<?php

namespace App\Actions\Category;

use App\Models\Category;

class GetCategoryBySlug
{
    public function handle(string $slug): Category
    {
        return Category::where('slug', $slug)->firstOrFail();
    }
}
