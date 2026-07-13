<?php

namespace App\Actions\Category;

use App\Models\Category;

class DeleteCategory
{
    public function handle(Category $category): void
    {
        $category->delete();
    }
}
