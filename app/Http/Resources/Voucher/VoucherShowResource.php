<?php

namespace App\Http\Resources\Voucher;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'type' => $this->type->value,
            'value' => $this->value,
            'max_discount' => $this->max_discount,
            'min_purchase' => $this->min_purchase,
            'quota' => $this->quota,
            'usage_count' => $this->usage_count,
            'per_user_limit' => $this->per_user_limit,
            'applies_to_all_products' => $this->applies_to_all_products,
            'is_active' => $this->is_active,
            'starts_at' => $this->starts_at?->format('Y-m-d'),
            'ends_at' => $this->ends_at?->format('Y-m-d'),
            'product_ids' => $this->whenLoaded('products', fn () => $this->products->pluck('id')->toArray()),
        ];
    }
}
