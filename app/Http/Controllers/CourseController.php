<?php

namespace App\Http\Controllers;

use App\Actions\Category\GetCategoriesWithCourseCount;
use App\Actions\Course\GetCourseBySlug;
use App\Actions\Course\GetPaginatedCourses;
use App\Actions\User\GetPurchasedCourses;
use App\Actions\User\HasPurchasedCourse;
use App\Http\Resources\Course\CourseListResource;
use App\Http\Resources\Course\CourseShowResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = app(GetPaginatedCourses::class)->handle();

        /** Dapatkan course ID yang sudah dibeli user (jika login) */
        $purchasedCourseIds = [];
        if ($user = $request->user()) {
            $purchased = app(GetPurchasedCourses::class)->handle($user);
            $purchasedCourseIds = $purchased->pluck('id')->toArray();
        }

        return Inertia::render('courses/index', [
            'courses' => CourseListResource::collection($courses),
            'categories' => app(GetCategoriesWithCourseCount::class)->handle()->map(fn ($cat) => ['id' => $cat->id, 'name' => $cat->name]),
            'purchasedCourseIds' => $purchasedCourseIds,
            'filters' => [
                'search' => request()->input('search'),
                'category' => request()->input('category'),
                'sort' => request()->input('sort', 'latest'),
            ],
        ]);
    }

    public function show(Request $request, string $course): Response
    {
        $course = app(GetCourseBySlug::class)->handle($course);

        if (! $course->is_published) {
            abort(404);
        }

        $user = $request->user();
        $isPurchased = $user && app(HasPurchasedCourse::class)->handle($user, $course);

        $course->load([
            'category',
            'contents' => function ($q) {
                $q->where('is_published', true)->orderBy('order');
            },
            'contents.progress' => function ($q) use ($user) {
                if ($user) {
                    $q->where('user_id', $user->id);
                }
            },
            'products' => fn ($q) => $q->where('is_published', true)->orderBy('price'),
            'galleries',
            'technologies',
        ]);

        return Inertia::render('courses/show', [
            'course' => new CourseShowResource($course),
            'isPurchased' => $isPurchased,
            'isLoggedIn' => $user !== null,
        ]);
    }
}
