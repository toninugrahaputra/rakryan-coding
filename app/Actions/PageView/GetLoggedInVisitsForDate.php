<?php

namespace App\Actions\PageView;

use App\Models\PageView;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class GetLoggedInVisitsForDate
{
    public function handle(?string $date = null, int $perPage = 20): LengthAwarePaginator
    {
        $day = $date ? Carbon::parse($date)->startOfDay() : Carbon::today();

        return PageView::query()
            ->whereDate('created_at', $day)
            ->whereNotNull('user_id')
            ->with('user:id,name,email')
            ->latest('created_at')
            ->paginate($perPage)
            ->through(fn (PageView $view) => [
                'id' => $view->id,
                'user_name' => $view->user->name,
                'user_email' => $view->user->email,
                'path' => $view->path,
                'visited_at' => $view->created_at->format('H:i'),
            ]);
    }
}
