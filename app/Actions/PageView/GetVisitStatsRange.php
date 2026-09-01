<?php

namespace App\Actions\PageView;

use App\Models\PageView;
use Illuminate\Support\Carbon;

class GetVisitStatsRange
{
    /**
     * @var array<string, int>
     */
    private const RANGE_DAYS = [
        'week' => 7,
        'month' => 30,
        'quarter' => 90,
    ];

    public function __construct(private CountUniqueVisitors $countUniqueVisitors) {}

    /**
     * @return array{
     *     range: string,
     *     start_date: string,
     *     end_date: string,
     *     total_visits: int,
     *     guest_visits: int,
     *     unique_logged_in_visitors: int,
     *     daily: array<int, array{date: string, total_visits: int, guest_visits: int, logged_in_visits: int}>,
     * }
     */
    public function handle(string $range, ?string $endDate = null): array
    {
        $days = self::RANGE_DAYS[$range] ?? self::RANGE_DAYS['week'];
        $end = $endDate ? Carbon::parse($endDate)->startOfDay() : Carbon::today();
        $start = $end->copy()->subDays($days - 1);

        $rows = PageView::query()
            ->whereBetween('created_at', [$start, $end->copy()->endOfDay()])
            ->get(['created_at', 'user_id', 'session_id']);

        $rowsByDate = $rows->groupBy(fn (PageView $view) => $view->created_at->toDateString());

        $daily = [];
        for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
            $dateKey = $cursor->toDateString();
            $counts = $this->countUniqueVisitors->handle($rowsByDate->get($dateKey, collect()));

            $daily[] = [
                'date' => $dateKey,
                'total_visits' => $counts['logged_in'] + $counts['guests'],
                'guest_visits' => $counts['guests'],
                'logged_in_visits' => $counts['logged_in'],
            ];
        }

        $totals = $this->countUniqueVisitors->handle($rows);

        return [
            'range' => $range,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'total_visits' => $totals['logged_in'] + $totals['guests'],
            'guest_visits' => $totals['guests'],
            'unique_logged_in_visitors' => $totals['logged_in'],
            'daily' => $daily,
        ];
    }
}
