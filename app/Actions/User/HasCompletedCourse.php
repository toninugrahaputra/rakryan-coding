<?php

namespace App\Actions\User;

use App\Models\Course;
use App\Models\User;

class HasCompletedCourse
{
    public function __construct(private HasPurchasedCourse $hasPurchasedCourse) {}

    public function handle(?User $user, Course $course): bool
    {
        if (! $user || ! $this->hasPurchasedCourse->handle($user, $course)) {
            return false;
        }

        $totalCount = $course->contents()->where('is_published', true)->count();

        if ($totalCount === 0) {
            return false;
        }

        $completedCount = $course->contents()
            ->where('is_published', true)
            ->whereHas('progress', fn ($query) => $query->where('user_id', $user->id))
            ->count();

        return $completedCount === $totalCount;
    }
}
