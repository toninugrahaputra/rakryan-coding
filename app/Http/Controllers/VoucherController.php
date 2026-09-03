<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        // Dapatkan voucher tersedia (aktif, belum kedaluwarsa, kuota belum habis, dan
        // pemakaian user ini belum mencapai per_user_limit-nya). Difilter di PHP (bukan
        // whereHas dengan angka statis) karena per_user_limit berbeda-beda tiap voucher.
        $availableVouchers = Voucher::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('quota')->orWhereColumn('usage_count', '<', 'quota');
            })
            ->with(['usages' => fn ($q) => $q->where('user_id', $userId)])
            ->orderBy('ends_at')
            ->get()
            ->filter(function (Voucher $voucher) {
                $perUserLimit = $voucher->per_user_limit ?? 1;
                $usedCount = $voucher->usages->whereNotNull('order_id')->count();

                return $usedCount < $perUserLimit;
            })
            ->values();

        // Dapatkan voucher terpakai (pernah digunakan oleh user ini)
        $usedVouchers = Voucher::whereHas('usages', function ($q) use ($userId) {
            $q->where('user_id', $userId)->whereNotNull('order_id');
        })->get();

        // Dapatkan voucher kedaluwarsa (tidak aktif, sudah lewat ends_at, atau kuota sudah habis, dan belum pernah dipakai)
        $expiredVouchers = Voucher::where(function ($q) {
            $q->where('is_active', false)
                ->orWhere('ends_at', '<=', now())
                ->orWhereColumn('usage_count', '>=', 'quota');
        })->whereDoesntHave('usages', function ($q) use ($userId) {
            $q->where('user_id', $userId)->whereNotNull('order_id');
        })->get();

        $mapVoucher = fn ($v) => [
            'id' => $v->id,
            'code' => $v->code,
            'name' => $v->name,
            'type' => $v->type->value ?? $v->type,
            'value' => $v->value,
            'max_discount' => $v->max_discount,
            'min_purchase' => $v->min_purchase,
            'ends_at' => $v->ends_at?->translatedFormat('d M Y') ?? 'Selamanya',
        ];

        return Inertia::render('vouchers/index', [
            'availableVouchers' => $availableVouchers->map($mapVoucher),
            'usedVouchers' => $usedVouchers->map($mapVoucher),
            'expiredVouchers' => $expiredVouchers->map($mapVoucher),
        ]);
    }

    public function redeem(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($request->code));
        $voucher = Voucher::where('code', $code)->first();

        if (! $voucher) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Kode voucher tidak ditemukan.',
            ]);

            return back();
        }

        $userId = $request->user()->id;

        // Cek apakah sudah mencapai batas pemakaian per pengguna
        $perUserLimit = $voucher->per_user_limit ?? 1;
        $usedCount = $voucher->usages()->where('user_id', $userId)->whereNotNull('order_id')->count();
        if ($usedCount >= $perUserLimit) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $perUserLimit > 1
                    ? "Anda sudah mencapai batas pemakaian voucher ini ({$perUserLimit}x)."
                    : 'Anda sudah pernah menggunakan voucher ini.',
            ]);

            return back();
        }

        // Cek apakah sudah diklaim
        $hasClaimed = $voucher->usages()->where('user_id', $userId)->whereNull('order_id')->exists();
        if ($hasClaimed) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Anda sudah pernah mengklaim voucher ini.',
            ]);

            return back();
        }

        // Cek apakah kedaluwarsa atau tidak aktif
        $isExpired = ! $voucher->is_active || ($voucher->ends_at && $voucher->ends_at->isPast());
        if ($isExpired) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Kode voucher sudah kedaluwarsa atau tidak aktif.',
            ]);

            return back();
        }

        // Cek apakah kuota sudah habis
        if ($voucher->quota !== null && $voucher->usage_count >= $voucher->quota) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Kuota voucher sudah habis.',
            ]);

            return back();
        }

        // Buat record klaim voucher
        $voucher->usages()->create([
            'user_id' => $userId,
            'order_id' => null,
            'discount_amount' => 0,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Kupon '{$voucher->code}' berhasil ditukarkan! Silakan pilih course untuk memulai belajar.",
        ]);

        return back();
    }
}
