<?php

namespace App\Actions\User;

use App\Models\Course;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Eloquent\Collection;

class GetPurchasedCourses
{
    public function handle(User $user): Collection
    {
        $courseIds = UserSubscription::query()
            ->where('user_id', $user->id)
            ->with('product.courses')
            ->get()
            ->flatMap(fn (UserSubscription $subscription) => $subscription->product->courses->pluck('id'))
            ->unique()
            ->values();

        return Course::with([
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
        ->whereIn('id', $courseIds)
        ->get();
    }
}
