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

        // Dapatkan voucher tersedia (aktif, belum kedaluwarsa, belum pernah digunakan oleh user ini)
        $availableVouchers = Voucher::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->where(function ($q) use ($userId) {
                $q->whereDoesntHave('usages', function ($sq) use ($userId) {
                    $sq->where('user_id', $userId);
                })
                    ->orWhereHas('usages', function ($sq) use ($userId) {
                        $sq->where('user_id', $userId)->whereNull('order_id');
                    });
            })
            ->orderBy('ends_at')
            ->get();

        // Dapatkan voucher terpakai (pernah digunakan oleh user ini)
        $usedVouchers = Voucher::whereHas('usages', function ($q) use ($userId) {
            $q->where('user_id', $userId)->whereNotNull('order_id');
        })->get();

        // Dapatkan voucher kedaluwarsa (sudah tidak aktif atau sudah lewat ends_at, dan belum pernah dipakai)
        $expiredVouchers = Voucher::where(function ($q) {
            $q->where('is_active', false)->orWhere('ends_at', '<=', now());
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

        // Cek apakah sudah terpakai
        $hasUsed = $voucher->usages()->where('user_id', $userId)->whereNotNull('order_id')->exists();
        if ($hasUsed) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Anda sudah pernah menggunakan voucher ini.',
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
