<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseProduct extends Pivot
{
    protected function casts(): array
    {
        return [
            'is_bonus' => 'boolean',
        ];
    }
}
