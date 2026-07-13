<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class CreateVoucher
{
    public function handle(array $data): Voucher
    {
        $appliesToAll = $data['applies_to_all_products'] ?? true;

        $voucher = Voucher::create([
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

        return $voucher;
    }
}
