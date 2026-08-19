<?php

namespace App\Actions\PageView;

use App\Models\PageView;

class RecordPageView
{
    public function handle(?int $userId, string $path): void
    {
        PageView::create([
            'user_id' => $userId,
            'path' => $path,
        ]);
    }
}
