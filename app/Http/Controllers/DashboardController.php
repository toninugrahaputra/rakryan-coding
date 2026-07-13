<?php

namespace App\Http\Controllers;

use App\Actions\User\GetPurchasedCourses;
use App\Actions\User\GetUserStats;
use App\Actions\User\GetRecentlyAccessedCourses;
use App\Http\Resources\Course\CourseListResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $courses = app(GetPurchasedCourses::class)->handle($user);
        $userStats = app(GetUserStats::class)->handle($user);
        $recentCourses = app(GetRecentlyAccessedCourses::class)->handle($user);

        // Ambil 3 rekomendasi course yang belum dibeli oleh user
        $purchasedIds = $courses->pluck('id');
        $recommendations = \App\Models\Course::with(['category', 'products'])
            ->where('is_published', true)
            ->whereNotIn('id', $purchasedIds)
            ->take(3)
            ->get();

        // Deteksi apakah ada course yang terduplikasi di antara produk langganan user
        $subscriptions = \App\Models\UserSubscription::where('user_id', $user->id)
            ->with('product.courses')
            ->get();
        $allCourseIds = [];
        foreach ($subscriptions as $sub) {
            if ($sub->product) {
                foreach ($sub->product->courses as $c) {
                    $allCourseIds[] = $c->id;
                }
            }
        }
        $counts = array_count_values($allCourseIds);
        $hasDuplicateCourses = false;
        foreach ($counts as $courseId => $cnt) {
            if ($cnt > 1) {
                $hasDuplicateCourses = true;
                break;
            }
        }

        return Inertia::render('dashboard', [
            'purchasedCourses'    => CourseListResource::collection($courses)->resolve(),
            'userStats'           => $userStats,
            'recentCourses'       => CourseListResource::collection($recentCourses)->resolve(),
            'recommendations'     => CourseListResource::collection($recommendations)->resolve(),
            'hasDuplicateCourses' => $hasDuplicateCourses,
        ]);
    }
}