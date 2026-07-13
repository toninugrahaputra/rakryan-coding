<?php

namespace App\Actions\User;

use App\Models\Course;
use App\Models\User;
use App\Models\UserSubscription;

class HasPurchasedCourse
{
    public function handle(User $user, Course $course): bool
    {
        return UserSubscription::query()
            ->where('user_id', $user->id)
            ->whereHas('product.courses', fn ($query) => $query->where('id', $course->id))
            ->exists();
    }
}
