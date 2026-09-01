<?php

namespace App\Actions\PageView;

use App\Models\PageView;
use Illuminate\Support\Carbon;

class GetVisitStats
{
    public function __construct(private CountUniqueVisitors $countUniqueVisitors) {}

    /**
     * @return array{
     *     range: string,
     *     date: string,
     *     total_visits: int,
     *     guest_visits: int,
     *     unique_logged_in_visitors: int,
     *     hourly: array<int, array{hour: int, total_visits: int, guest_visits: int, logged_in_visits: int}>,
     * }
     */
    public function handle(?string $date = null): array
    {
        $day = $date ? Carbon::parse($date)->startOfDay() : Carbon::today();

        // Diambil sekali lalu dikelompokkan di PHP (bukan HOUR() SQL) supaya query-nya
        // tetap portable antar driver database (MySQL di production, SQLite di test),
        // dan dipakai ulang baik untuk total harian maupun breakdown per jam.
        $rows = PageView::query()
            ->whereDate('created_at', $day)
            ->get(['created_at', 'user_id', 'session_id']);

        $totals = $this->countUniqueVisitors->handle($rows);

        $rowsByHour = $rows->groupBy(fn (PageView $view) => (int) $view->created_at->format('G'));

        $hourly = collect(range(0, 23))->map(function (int $hour) use ($rowsByHour) {
            $counts = $this->countUniqueVisitors->handle($rowsByHour->get($hour, collect()));

            return [
                'hour' => $hour,
                'total_visits' => $counts['logged_in'] + $counts['guests'],
                'guest_visits' => $counts['guests'],
                'logged_in_visits' => $counts['logged_in'],
            ];
        })->values()->all();

        return [
            'range' => 'day',
            'date' => $day->toDateString(),
            'total_visits' => $totals['logged_in'] + $totals['guests'],
            'guest_visits' => $totals['guests'],
            'unique_logged_in_visitors' => $totals['logged_in'],
            'hourly' => $hourly,
        ];
    }
}
