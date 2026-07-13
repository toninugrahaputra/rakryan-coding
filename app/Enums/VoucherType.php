<?php

namespace App\Enums;

enum VoucherType: string
{
    case Percentage = 'percentage';
    case Flat = 'flat';
}
