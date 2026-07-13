<?php

namespace App\Actions\User;

use App\Models\UserSubscription;
use App\Models\Course;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class GetUserStats
{
    public function handle(): array
    {
        $userId = Auth::id();
        if (!$userId) {
            return [
                'total_subscriptions' => 0,
                'courses_enrolled'    => 0,
                'member_since'        => null,
                'courses_completed'   => 0,
                'total_chapters_read' => 0,
                'streak_days'         => 0,
            ];
        }

        $subscriptionCount = UserSubscription::where('user_id', $userId)->count();

        // Hitung course yang dimiliki user
        $courseCount = Course::whereHas('products', function ($query) use ($userId) {
            $query->whereHas('userSubscriptions', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        })->count();

        $memberSince = User::where('id', $userId)->value('created_at');

        // Hitung course yang diselesaikan 100%
        $completedCount = Course::whereHas('products', function ($query) use ($userId) {
            $query->whereHas('userSubscriptions', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        })->where('is_published', true)
        ->get()
        ->filter(function ($course) use ($userId) {
            $totalContents = $course->contents()->where('is_published', true)->count();
            $completedContents = UserProgress::where('user_id', $userId)
                ->whereIn('course_content_id', $course->contents()->pluck('id'))
                ->count();
            return $totalContents > 0 && $completedContents === $totalContents;
        })
        ->count();

        // Hitung total bab/modul yang selesai dibaca
        $totalChaptersRead = UserProgress::where('user_id', $userId)->count();

        // Hitung streak hari berturut-turut
        $dates = UserProgress::where('user_id', $userId)
            ->selectRaw('DATE(created_at) as date')
            ->distinct()
            ->orderByDesc('date')
            ->pluck('date')
            ->map(fn ($d) => Carbon::parse($d));

        $streak = 0;
        if ($dates->isNotEmpty()) {
            $today = Carbon::today();
            $yesterday = Carbon::yesterday();
            
            // Streak aktif jika ada aktivitas hari ini atau kemarin
            if ($dates->first()->equalTo($today) || $dates->first()->equalTo($yesterday)) {
                $streak = 1;
                for ($i = 0; $i < $dates->count() - 1; $i++) {
                    $diff = $dates[$i]->diffInDays($dates[$i + 1]);
                    if ($diff === 1) {
                        $streak++;
                    } elseif ($diff > 1) {
                        break;
                    }
                }
            }
        }

        return [
            'total_subscriptions' => $subscriptionCount,
            'courses_enrolled'    => $courseCount,
            'member_since'        => $memberSince,
            'courses_completed'   => $completedCount,
            'total_chapters_read' => $totalChaptersRead,
            'streak_days'         => $streak,
        ];
    }
}