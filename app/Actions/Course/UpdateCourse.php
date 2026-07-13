<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateCourse
{
    public function handle(Course $course, array $data): void
    {
        $fields = [
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'is_published' => $data['is_published'] ?? false,
        ];

        if (array_key_exists('thumbnail', $data)) {
            $fields['thumbnail'] = $this->replaceThumbnail($course, $data['thumbnail']);
        }

        $course->update($fields);
    }

    private function replaceThumbnail(Course $course, mixed $file): ?string
    {
        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        if ($file instanceof UploadedFile) {
            return $file->store('courses/thumbnails', 'public');
        }

        return null;
    }
}
