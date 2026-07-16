<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class GetActiveVoucherCode
{
    /**
     * Ambil kode voucher yang sedang berlaku untuk auto-terisi di checkout.
     * Kalau ada lebih dari satu (mis. admin lupa nonaktifkan yang lama), ambil yang paling baru dimulai.
     */
    public function handle(): ?string
    {
        return Voucher::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->orderByDesc('starts_at')
            ->orderByDesc('created_at')
            ->value('code');
    }
}
