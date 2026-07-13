<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Category\GetCategoryOptions;
use App\Actions\Course\CreateCourse;
use App\Actions\Course\DeleteCourse;
use App\Actions\Course\GetCourseBySlug;
use App\Actions\Course\GetPaginatedCourses;
use App\Actions\Course\SyncCourseGallery;
use App\Actions\Course\UpdateCourse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\CourseRequest;
use App\Http\Resources\Course\CourseListResource;
use App\Http\Resources\Course\CourseShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/courses/index', [
            'courses' => CourseListResource::collection(app(GetPaginatedCourses::class)->handle()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/courses/create', [
            'categories' => app(GetCategoryOptions::class)->handle(),
        ]);
    }

    public function store(CourseRequest $request): RedirectResponse
    {
        $course = app(CreateCourse::class)->handle($request->validated());
        app(SyncCourseGallery::class)->handle($course, $request->file('gallery', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Course berhasil ditambahkan.']);

        return redirect()->route('internal.courses.index');
    }

    public function edit(string $course): Response
    {
        $course = app(GetCourseBySlug::class)->handle($course)->load('galleries');

        return Inertia::render('internal/courses/edit', [
            'course' => new CourseShowResource($course),
            'categories' => app(GetCategoryOptions::class)->handle(),
        ]);
    }

    public function update(CourseRequest $request, string $course): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($course);
        app(UpdateCourse::class)->handle($course, $request->validated());
        app(SyncCourseGallery::class)->handle(
            $course,
            $request->file('gallery', []),
            $request->validated('remove_gallery_ids', []),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Course berhasil diperbarui.']);

        return redirect()->route('internal.courses.index');
    }

    public function destroy(string $course): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($course);
        app(DeleteCourse::class)->handle($course);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Course berhasil dihapus.']);

        return redirect()->route('internal.courses.index');
    }
}
