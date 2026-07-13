<?php

namespace App\Actions\Product;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class GetCourseOptions
{
    public function handle(): Collection
    {
        return Course::select('id', 'title')->orderBy('title')->get();
    }
}
