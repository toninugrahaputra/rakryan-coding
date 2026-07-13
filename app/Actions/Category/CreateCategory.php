<?php

namespace App\Actions\Category;

use App\Models\Category;

class CreateCategory
{
    public function handle(array $data): Category
    {
        return Category::create([
            'name' => $data['name'],
            'slug' => $data['slug'],
        ]);
    }
}
