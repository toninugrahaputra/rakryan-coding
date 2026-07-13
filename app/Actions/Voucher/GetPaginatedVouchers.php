<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedVouchers
{
    public function handle(): LengthAwarePaginator
    {
        return Voucher::withCount('products')
            ->latest()
            ->paginate(10);
    }
}
