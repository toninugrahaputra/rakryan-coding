<?php

namespace App\Actions\Notification;

use App\Models\Notification;
use App\Models\User;

class NotifyUser
{
    public function handle(User $user, string $title, string $message, ?string $url = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'is_read' => false,
        ]);
    }
}
