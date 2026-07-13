<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\UploadedFile;

class CreateCourse
{
    public function handle(array $data): Course
    {
        return Course::create([
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'thumbnail' => $this->storeThumbnail($data['thumbnail'] ?? null),
            'is_published' => $data['is_published'] ?? false,
        ]);
    }

    private function storeThumbnail(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('courses/thumbnails', 'public');
        }

        return null;
    }
}
