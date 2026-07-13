<?php

namespace App\Actions\Category;

use App\Models\Category;

class UpdateCategory
{
    public function handle(Category $category, array $data): void
    {
        $category->update([
            'name' => $data['name'],
            'slug' => $data['slug'],
        ]);
    }
}
