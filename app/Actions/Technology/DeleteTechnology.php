<?php

namespace App\Actions\Technology;

use App\Models\Technology;

class DeleteTechnology
{
    public function handle(Technology $technology): void
    {
        $technology->delete();
    }
}
