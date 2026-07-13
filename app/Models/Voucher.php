<?php

namespace App\Models;

use App\Enums\VoucherType;
use Database\Factories\VoucherFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'code', 'name', 'type', 'value', 'max_discount', 'min_purchase', 'quota',
    'usage_count', 'per_user_limit', 'applies_to_all_products', 'starts_at', 'ends_at', 'is_active',
])]
class Voucher extends Model
{
    /** @use HasFactory<VoucherFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'type' => VoucherType::class,
            'value' => 'integer',
            'max_discount' => 'integer',
            'min_purchase' => 'integer',
            'quota' => 'integer',
            'usage_count' => 'integer',
            'per_user_limit' => 'integer',
            'applies_to_all_products' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(VoucherUsage::class);
    }
}
