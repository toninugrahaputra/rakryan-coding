<?php

namespace App\Actions\Notification;

use App\Models\Notification;
use App\Models\User;

class NotifyAllUsers
{
    public function handle(string $title, string $message, ?string $url = null): void
    {
        $userIds = User::query()->pluck('id');

        if ($userIds->isEmpty()) {
            return;
        }

        $now = now();

        Notification::insert(
            $userIds->map(fn (int $userId) => [
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'url' => $url,
                'is_read' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all(),
        );
    }
}
