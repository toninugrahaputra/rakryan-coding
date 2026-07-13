<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Course\GetCourseBySlug;
use App\Actions\CourseContent\CreateCourseContent;
use App\Actions\CourseContent\DeleteCourseContent;
use App\Actions\CourseContent\GetCourseContentBySlug;
use App\Actions\CourseContent\GetCourseContents;
use App\Actions\CourseContent\UpdateCourseContent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\CourseContentRequest;
use App\Http\Resources\CourseContent\CourseContentListResource;
use App\Http\Resources\CourseContent\CourseContentShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseContentController extends Controller
{
    public function index(string $course): Response
    {
        $course = app(GetCourseBySlug::class)->handle($course);

        return Inertia::render('internal/courses/contents/index', [
            'course' => ['id' => $course->id, 'slug' => $course->slug, 'title' => $course->title],
            'contents' => CourseContentListResource::collection(app(GetCourseContents::class)->handle($course)),
        ]);
    }

    public function create(string $course): Response
    {
        $course = app(GetCourseBySlug::class)->handle($course);

        return Inertia::render('internal/courses/contents/create', [
            'course' => ['id' => $course->id, 'slug' => $course->slug, 'title' => $course->title],
        ]);
    }

    public function store(CourseContentRequest $request, string $course): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($course);

        app(CreateCourseContent::class)->handle($course, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Konten berhasil ditambahkan.']);

        return redirect()->route('internal.courses.contents.index', $course);
    }

    public function edit(string $course, string $content): Response
    {
        $course = app(GetCourseBySlug::class)->handle($course);
        $content = app(GetCourseContentBySlug::class)->handle($course, $content);

        return Inertia::render('internal/courses/contents/edit', [
            'course' => ['id' => $course->id, 'slug' => $course->slug, 'title' => $course->title],
            'content' => new CourseContentShowResource($content),
        ]);
    }

    public function update(CourseContentRequest $request, string $course, string $content): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($course);
        $content = app(GetCourseContentBySlug::class)->handle($course, $content);

        app(UpdateCourseContent::class)->handle($content, $course, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Konten berhasil diperbarui.']);

        return redirect()->route('internal.courses.contents.index', $course);
    }

    public function destroy(string $course, string $content): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($course);
        $content = app(GetCourseContentBySlug::class)->handle($course, $content);
        app(DeleteCourseContent::class)->handle($content, $course);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Konten berhasil dihapus.']);

        return redirect()->route('internal.courses.contents.index', $course);
    }
}
