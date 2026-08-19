<?php

namespace App\Actions\PageView;

use App\Models\PageView;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class GetVisitStats
{
    /**
     * @return array{
     *     date: string,
     *     total_visits: int,
     *     guest_visits: int,
     *     unique_logged_in_visitors: int,
     *     visits: Collection<int, array{id: int, user_name: string, user_email: string, path: string, visited_at: string}>,
     * }
     */
    public function handle(?string $date = null): array
    {
        $day = $date ? Carbon::parse($date)->startOfDay() : Carbon::today();

        $loggedInViews = PageView::query()
            ->whereDate('created_at', $day)
            ->whereNotNull('user_id')
            ->with('user')
            ->latest('created_at')
            ->get();

        $totalVisits = PageView::query()->whereDate('created_at', $day)->count();

        return [
            'date' => $day->toDateString(),
            'total_visits' => $totalVisits,
            'guest_visits' => $totalVisits - $loggedInViews->count(),
            'unique_logged_in_visitors' => $loggedInViews->pluck('user_id')->unique()->count(),
            'visits' => $loggedInViews->map(fn (PageView $view) => [
                'id' => $view->id,
                'user_name' => $view->user->name,
                'user_email' => $view->user->email,
                'path' => $view->path,
                'visited_at' => $view->created_at->format('H:i'),
            ]),
        ];
    }
}
