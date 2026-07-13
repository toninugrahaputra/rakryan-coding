<?php

namespace App\Actions\CourseContent;

use App\Models\Course;
use App\Models\CourseContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CreateCourseContent
{
    public function handle(Course $course, array $data): CourseContent
    {
        $contentSlug = $data['slug'];

        try {
            return DB::transaction(function () use ($course, $data) {
                return $course->contents()->create([
                    'section_name' => $data['section_name'] ?? null,
                    'title' => $data['title'],
                    'slug' => $data['slug'],
                    'content' => $data['content'] ?? null,
                    'sub_topics' => $data['sub_topics'] ?? null,
                    'is_published' => $data['is_published'] ?? false,
                    'order' => $course->contents()->max('order') + 1,
                ]);
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->deleteDirectory("courses/{$course->slug}/{$contentSlug}");
            throw $e;
        }
    }
}
