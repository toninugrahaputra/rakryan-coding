<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class GetVoucherByCode
{
    public function handle(string $code): Voucher
    {
        return Voucher::where('code', $code)->firstOrFail();
    }
}
