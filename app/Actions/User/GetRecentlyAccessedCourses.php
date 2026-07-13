<?php

namespace App\Actions\User;

use App\Models\Course;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Eloquent\Collection;

class GetRecentlyAccessedCourses
{
    public function handle(User $user): Collection
    {
        // Dapatkan ID kursus yang dibeli user dari riwayat subskripsi
        $recentSubscriptionCourseIds = UserSubscription::where('user_id', $user->id)
            ->with('product.courses')
            ->orderByDesc('created_at')
            ->take(10)
            ->get()
            ->flatMap(function ($subscription) {
                return $subscription->product->courses->pluck('id')->toArray();
            })
            ->unique()
            ->take(6);

        if ($recentSubscriptionCourseIds->isNotEmpty()) {
            return Course::whereIn('id', $recentSubscriptionCourseIds)
                ->with([
                    'category',
                    'contents' => function ($query) {
                        $query->where('is_published', true)->orderBy('order');
                    },
                    'contents.progress' => function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    }
                ])
                ->withCount([
                    'contents',
                    'contents as completed_contents_count' => function ($query) use ($user) {
                        $query->where('is_published', true)
                            ->whereHas('progress', function ($q) use ($user) {
                                $q->where('user_id', $user->id);
                            });
                    }
                ])
                ->get();
        }

        return new Collection();
    }
}