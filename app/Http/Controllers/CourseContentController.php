<?php

namespace App\Http\Controllers;

use App\Actions\Course\GetCourseBySlug;
use App\Actions\Course\IsFreeCourse;
use App\Actions\CourseContent\GetCourseContentBySlug;
use App\Actions\User\HasPurchasedCourse;
use App\Models\UserProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseContentController extends Controller
{
    /** Jumlah modul pertama yang boleh dibaca tanpa login pada course gratis. */
    private const FREE_PREVIEW_LIMIT = 3;

    public function show(Request $request, string $courseSlug, string $contentSlug): Response|RedirectResponse
    {
        $course = app(GetCourseBySlug::class)->handle($courseSlug);
        $content = app(GetCourseContentBySlug::class)->handle($course, $contentSlug);

        abort_if(! $course->is_published, 404);
        abort_if(! $content->is_published, 404);

        $user = $request->user();
        $isFree = app(IsFreeCourse::class)->handle($course);
        $isPurchased = app(HasPurchasedCourse::class)->handle($user, $course);

        // Dapatkan semua konten terbitan course
        $contents = $course->contents()
            ->where('is_published', true)
            ->orderBy('order')
            ->get();

        // Cari indeks konten saat ini
        $currentIndex = $contents->pluck('id')->search($content->id);

        // Course berbayar juga dapat preview, tapi wajib login (beda dari course gratis yang
        // preview-nya boleh diakses guest), hanya berlaku kalau course-nya benar-benar punya
        // produk yang bisa dibeli (bukan course yang belum dikaitkan produk sama sekali), dan
        // di-cap 30% dari total modul supaya course pendek tidak keburu ke-preview mayoritas isinya.
        $paidPreviewLimit = min(self::FREE_PREVIEW_LIMIT, (int) ceil($contents->count() * 0.3));
        $hasPurchasableProduct = $course->products()
            ->where('is_published', true)
            ->where('course_product.is_bonus', false)
            ->exists();
        $isPreviewEligible = $isFree
            ? $currentIndex < self::FREE_PREVIEW_LIMIT
            : ($user !== null && $hasPurchasableProduct && $currentIndex < $paidPreviewLimit);

        if (! $isPurchased && ! $isPreviewEligible) {
            // Guest diarahkan ke login (lalu kembali ke halaman ini).
            if (! $user) {
                return redirect()->guest(route('login'));
            }

            // User login yang belum klaim course gratis diarahkan ke alur klaim (gratis, auto-approve).
            // User login yang belum membeli course berbayar diarahkan ke halaman detail untuk membeli.
            if ($isFree) {
                Inertia::flash('toast', [
                    'type' => 'info',
                    'message' => 'Daftar course gratis ini dulu ya, biar bisa lanjut ke modul berikutnya.',
                ]);

                return redirect()->route('orders.create', ['course' => $course->slug]);
            }

            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'Kamu sudah mencapai batas modul preview. Beli course ini dulu untuk lanjut belajar, yuk!',
            ]);

            return redirect()->route('courses.show', $course->slug);
        }

        $prevContent = $currentIndex > 0 ? $contents[$currentIndex - 1] : null;
        $nextContent = $currentIndex < $contents->count() - 1 ? $contents[$currentIndex + 1] : null;

        // Hitung progres — guest tidak punya progress tersimpan
        $totalCount = $contents->count();
        $completedIds = $user
            ? $user->progress()
                ->whereIn('course_content_id', $contents->pluck('id'))
                ->pluck('course_content_id')
                ->toArray()
            : [];
        $completedCount = count($completedIds);
        $percentage = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

        $isCompleted = in_array($content->id, $completedIds);

        // Kelompokkan daftar pelajaran untuk sidebar
        $lessonList = $contents->values()->map(fn ($c, $index) => [
            'id' => $c->id,
            'title' => $c->title,
            'slug' => $c->slug,
            'order' => $c->order,
            'is_completed' => in_array($c->id, $completedIds),
            'is_locked' => ! $isPurchased && ! ($isFree
                ? $index < self::FREE_PREVIEW_LIMIT
                : ($user !== null && $hasPurchasableProduct && $index < $paidPreviewLimit)),
            'has_video' => $c->youtube_id !== null,
        ]);

        return Inertia::render('courses/contents/show', [
            'course' => [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
            ],
            'content' => [
                'id' => $content->id,
                'title' => $content->title,
                'slug' => $content->slug,
                'content' => $content->content,
                'youtube_id' => $content->youtube_id,
                'order' => $content->order,
                'is_completed' => $isCompleted,
            ],
            'prevContent' => $prevContent ? [
                'slug' => $prevContent->slug,
                'title' => $prevContent->title,
            ] : null,
            'nextContent' => $nextContent ? [
                'slug' => $nextContent->slug,
                'title' => $nextContent->title,
            ] : null,
            'lessons' => $lessonList,
            'isLoggedIn' => $user !== null,
            'isPurchased' => $isPurchased,
            'isPreview' => ! $isPurchased,
            'isFree' => $isFree,
            'progress' => [
                'total_count' => $totalCount,
                'completed_count' => $completedCount,
                'percentage' => $percentage,
                'current_index' => $currentIndex + 1,
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
            'user_id' => $request->user()->id,
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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Selamat! Anda telah menyelesaikan seluruh modul di course ini.',
        ]);

        return redirect()->route('courses.show', $course->slug);
    }
}
