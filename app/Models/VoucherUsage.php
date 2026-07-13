<?php

namespace App\Models;

use Database\Factories\VoucherUsageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['voucher_id', 'user_id', 'order_id', 'discount_amount'])]
class VoucherUsage extends Model
{
    /** @use HasFactory<VoucherUsageFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'discount_amount' => 'integer',
        ];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
