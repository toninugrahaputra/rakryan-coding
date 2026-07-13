<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'slug'])]
class Category extends Model
{
    use HasFactory, SoftDeletes;

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function publishedCourses(): HasMany
    {
        return $this->hasMany(Course::class)->where('is_published', true);
    }
}
