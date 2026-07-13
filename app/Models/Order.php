<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id', 'product_id', 'items', 'order_number', 'provider', 'payment_reference',
    'channel_group', 'channel_code', 'channel_name', 'payment_fee', 'payment_code', 'payment_url',
    'total_amount', 'discount_amount', 'net_amount', 'valid_until', 'status', 'paid_at', 'approved_by', 'payment_metadata',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'payment_metadata' => 'array',
            'status' => OrderStatus::class,
            'valid_until' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(UserSubscription::class);
    }

    public function voucherUsage(): HasOne
    {
        return $this->hasOne(VoucherUsage::class);
    }
}
