<?php

namespace App\Http\Controllers;

use App\Actions\Course\GetCourseBySlug;
use App\Actions\CourseContent\GetCourseContentBySlug;
use App\Actions\User\HasPurchasedCourse;
use App\Models\UserProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseContentController extends Controller
{
    public function show(Request $request, string $courseSlug, string $contentSlug): Response
    {
        $course = app(GetCourseBySlug::class)->handle($courseSlug);
        $content = app(GetCourseContentBySlug::class)->handle($course, $contentSlug);

        abort_if(! $course->is_published, 404);
        abort_if(! $content->is_published, 404);
        abort_if(! app(HasPurchasedCourse::class)->handle($request->user(), $course), 403);

        // Dapatkan semua konten terbitan kelas
        $contents = $course->contents()
            ->where('is_published', true)
            ->orderBy('order')
            ->get();

        // Cari indeks konten saat ini
        $currentIndex = $contents->pluck('id')->search($content->id);
        $prevContent = $currentIndex > 0 ? $contents[$currentIndex - 1] : null;
        $nextContent = $currentIndex < $contents->count() - 1 ? $contents[$currentIndex + 1] : null;

        // Hitung progres
        $totalCount = $contents->count();
        $completedIds = $request->user()->progress()
            ->whereIn('course_content_id', $contents->pluck('id'))
            ->pluck('course_content_id')
            ->toArray();
        $completedCount = count($completedIds);
        $percentage = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

        $isCompleted = in_array($content->id, $completedIds);

        // Kelompokkan daftar pelajaran untuk sidebar
        $lessonList = $contents->map(fn ($c) => [
            'id'           => $c->id,
            'title'        => $c->title,
            'slug'         => $c->slug,
            'order'        => $c->order,
            'is_completed' => in_array($c->id, $completedIds),
        ]);

        return Inertia::render('courses/contents/show', [
            'course' => [
                'id'    => $course->id,
                'slug'  => $course->slug,
                'title' => $course->title,
            ],
            'content' => [
                'id'           => $content->id,
                'title'        => $content->title,
                'slug'         => $content->slug,
                'content'      => $content->content,
                'order'        => $content->order,
                'is_completed' => $isCompleted,
            ],
            'prevContent' => $prevContent ? [
                'slug'  => $prevContent->slug,
                'title' => $prevContent->title,
            ] : null,
            'nextContent' => $nextContent ? [
                'slug'  => $nextContent->slug,
                'title' => $nextContent->title,
            ] : null,
            'lessons'  => $lessonList,
            'progress' => [
                'total_count'     => $totalCount,
                'completed_count' => $completedCount,
                'percentage'      => $percentage,
                'current_index'   => $currentIndex + 1,
            ],
        ]);
    }

    public function complete(Request $request, string $courseSlug, string $contentSlug): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($courseSlug);
        $content = app(GetCourseContentBySlug::class)->handle($course, $contentSlug);

        abort_if(! $course->is_published, 404);
        abort_if(! $content->is_published, 404);
        abort_if(! app(HasPurchasedCourse::class)->handle($request->user(), $course), 403);

        // Catat progress selesai
        UserProgress::firstOrCreate([
            'user_id'           => $request->user()->id,
            'course_content_id' => $content->id,
        ]);

        // Temukan modul berikutnya berdasarkan order
        $next = $course->contents()
            ->where('is_published', true)
            ->where('order', '>', $content->order)
            ->orderBy('order')
            ->first();

        if ($next) {
            return redirect()->route('courses.contents.show', [$course->slug, $next->slug])
                ->with('success', 'Modul berhasil diselesaikan!');
        }

        \Inertia\Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Selamat! Anda telah menyelesaikan seluruh modul di kelas ini.',
        ]);

        return redirect()->route('courses.show', $course->slug);
    }
}
