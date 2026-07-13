<?php

namespace App\Actions\Category;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class GetCategoryOptions
{
    public function handle(): Collection
    {
        return Category::select('id', 'name')->orderBy('name')->get();
    }
}
