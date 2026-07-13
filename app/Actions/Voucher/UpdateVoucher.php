<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class UpdateVoucher
{
    public function handle(Voucher $voucher, array $data): void
    {
        $appliesToAll = $data['applies_to_all_products'] ?? true;

        $voucher->update([
            'code' => $data['code'],
            'name' => $data['name'] ?? null,
            'type' => $data['type'],
            'value' => $data['value'],
            'max_discount' => $data['max_discount'] ?? null,
            'min_purchase' => $data['min_purchase'] ?? null,
            'quota' => $data['quota'] ?? null,
            'per_user_limit' => $data['per_user_limit'] ?? null,
            'applies_to_all_products' => $appliesToAll,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $voucher->products()->sync($appliesToAll ? [] : ($data['product_ids'] ?? []));
    }
}
