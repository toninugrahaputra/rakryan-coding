<?php

namespace App\Actions\Voucher;

use App\Enums\VoucherType;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Validation\ValidationException;

class ApplyVoucher
{
    /**
     * Validate a voucher against a single-product purchase and compute the discount.
     *
     * Throws a ValidationException keyed on `voucher_code` when the voucher is not
     * applicable, so it surfaces cleanly as a form error in Inertia.
     *
     * @return array{voucher: Voucher, discount: int}
     */
    public function handle(string $code, Product $product, User $user): array
    {
        $voucher = Voucher::where('code', $code)->first();

        if (! $voucher) {
            $this->fail('Kode voucher tidak ditemukan.');
        }

        if (! $voucher->is_active) {
            $this->fail('Voucher tidak aktif.');
        }

        $now = now();

        if ($voucher->starts_at && $now->lessThan($voucher->starts_at)) {
            $this->fail('Voucher belum bisa digunakan.');
        }

        if ($voucher->ends_at && $now->greaterThan($voucher->ends_at)) {
            $this->fail('Masa berlaku voucher telah berakhir.');
        }

        if ($voucher->quota !== null && $voucher->usage_count >= $voucher->quota) {
            $this->fail('Kuota voucher sudah habis.');
        }

        if ($voucher->per_user_limit !== null) {
            $userUsage = $voucher->usages()->where('user_id', $user->id)->whereNotNull('order_id')->count();

            if ($userUsage >= $voucher->per_user_limit) {
                $this->fail("Voucher hanya dapat digunakan {$voucher->per_user_limit} kali per pengguna.");
            }
        }

        if (! $voucher->applies_to_all_products && ! $voucher->products()->whereKey($product->id)->exists()) {
            $this->fail('Voucher tidak berlaku untuk produk ini.');
        }

        if ($voucher->min_purchase !== null && $product->price < $voucher->min_purchase) {
            $minPurchase = number_format($voucher->min_purchase, 0, ',', '.');
            $this->fail("Minimum pembelian untuk voucher ini adalah Rp{$minPurchase}.");
        }

        return [
            'voucher' => $voucher,
            'discount' => $this->calculateDiscount($voucher, $product->price),
        ];
    }

    private function calculateDiscount(Voucher $voucher, int $price): int
    {
        $discount = $voucher->type === VoucherType::Percentage
            ? (int) floor($price * $voucher->value / 100)
            : $voucher->value;

        if ($voucher->max_discount !== null) {
            $discount = min($discount, $voucher->max_discount);
        }

        return min($discount, $price);
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['voucher_code' => $message]);
    }
}
