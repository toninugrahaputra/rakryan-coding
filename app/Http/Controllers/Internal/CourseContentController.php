<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Course\ExtractYoutubeVideoId;
use App\Actions\Course\GetCourseBySlug;
use App\Actions\CourseContent\CreateCourseContent;
use App\Actions\CourseContent\DeleteCourseContent;
use App\Actions\CourseContent\GetCourseContentBySlug;
use App\Actions\CourseContent\GetCourseContents;
use App\Actions\CourseContent\ReorderCourseContents;
use App\Actions\CourseContent\UpdateCourseContent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\CourseContentRequest;
use App\Http\Requests\Internal\ReorderCourseContentsRequest;
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

        $data = $request->validated();

        if ($request->filled('youtube_url')) {
            $data['youtube_id'] = app(ExtractYoutubeVideoId::class)->handle($data['youtube_url']);
        }

        app(CreateCourseContent::class)->handle($course, $data);

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

        $data = $request->validated();

        // Field dibiarkan kosong berarti "jangan diubah" — key youtube_id sengaja tidak
        // dimasukkan sama sekali kalau admin tidak mengetik link baru, supaya video yang
        // sudah ada tidak ikut terhapus tiap kali form disimpan.
        if ($request->filled('youtube_url')) {
            $data['youtube_id'] = app(ExtractYoutubeVideoId::class)->handle($data['youtube_url']);
        }

        app(UpdateCourseContent::class)->handle($content, $course, $data);

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

    public function reorder(ReorderCourseContentsRequest $request, string $course): RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($course);

        app(ReorderCourseContents::class)->handle($course, $request->validated('order'));

        return back();
    }
}
