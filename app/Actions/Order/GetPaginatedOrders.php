<?php

namespace App\Actions\Order;

use App\Models\Order;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedOrders
{
    /**
     * @param  array{search?: string, status?: string, channel_group?: string, needs_review?: string}  $filters
     */
    public function handle(array $filters = []): LengthAwarePaginator
    {
        return Order::with(['user', 'product'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['channel_group'] ?? null, fn ($q, $v) => $q->where('channel_group', $v))
            ->when($filters['needs_review'] ?? null, fn ($q) => $q->where('needs_payment_review', true))
            ->latest()
            ->paginate(15)
            ->withQueryString();
    }
}
