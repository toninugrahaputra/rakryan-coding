<?php

namespace App\Actions\PageView;

use App\Models\PageView;

class RecordPageView
{
    public function handle(?int $userId, ?string $sessionId, string $path): void
    {
        PageView::create([
            'user_id' => $userId,
            'session_id' => $userId ? null : $sessionId,
            'path' => $path,
        ]);
    }
}
