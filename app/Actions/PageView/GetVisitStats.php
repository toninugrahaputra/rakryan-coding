<?php

namespace App\Actions\PageView;

use App\Models\PageView;
use Illuminate\Support\Carbon;

class GetVisitStats
{
    /**
     * @return array{
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

        // Dihitung per pengunjung unik, bukan per baris page_views — satu akun yang
        // buka 10 halaman tetap 1 "kunjungan", begitu juga satu tamu (diidentifikasi
        // dari session_id) yang buka beberapa halaman di hari yang sama.
        $uniqueLoggedInVisitors = PageView::query()
            ->whereDate('created_at', $day)
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $uniqueGuestVisitors = PageView::query()
            ->whereDate('created_at', $day)
            ->whereNull('user_id')
            ->whereNotNull('session_id')
            ->distinct('session_id')
            ->count('session_id');

        // Breakdown per jam, bukan daftar per kunjungan — supaya jumlah baris yang
        // ditampilkan tetap tetap (maksimal 24), berapa pun banyaknya trafik hari itu.
        // Dikelompokkan di PHP (bukan HOUR() SQL) supaya query-nya tetap portable
        // antar driver database (MySQL di production, SQLite di test).
        $rowsByHour = PageView::query()
            ->whereDate('created_at', $day)
            ->get(['created_at', 'user_id', 'session_id'])
            ->groupBy(fn (PageView $view) => (int) $view->created_at->format('G'));

        $hourly = collect(range(0, 23))->map(function (int $hour) use ($rowsByHour) {
            $rows = $rowsByHour->get($hour, collect());
            $loggedIn = $rows->whereNotNull('user_id')->pluck('user_id')->unique()->count();
            $guests = $rows->whereNull('user_id')->pluck('session_id')->filter()->unique()->count();

            return [
                'hour' => $hour,
                'total_visits' => $loggedIn + $guests,
                'guest_visits' => $guests,
                'logged_in_visits' => $loggedIn,
            ];
        })->values()->all();

        return [
            'date' => $day->toDateString(),
            'total_visits' => $uniqueLoggedInVisitors + $uniqueGuestVisitors,
            'guest_visits' => $uniqueGuestVisitors,
            'unique_logged_in_visitors' => $uniqueLoggedInVisitors,
            'hourly' => $hourly,
        ];
    }
}
