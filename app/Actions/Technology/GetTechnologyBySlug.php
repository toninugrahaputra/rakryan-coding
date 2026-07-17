<?php

namespace App\Actions\Technology;

use App\Models\Technology;

class GetTechnologyBySlug
{
    public function handle(string $slug): Technology
    {
        return Technology::where('slug', $slug)->firstOrFail();
    }
}
