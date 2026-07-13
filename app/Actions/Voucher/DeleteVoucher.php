<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class DeleteVoucher
{
    public function handle(Voucher $voucher): void
    {
        $voucher->delete();
    }
}
