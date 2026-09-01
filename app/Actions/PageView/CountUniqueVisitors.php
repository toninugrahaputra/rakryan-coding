<?php

namespace App\Actions\PageView;

use App\Models\PageView;
use Illuminate\Support\Collection;

class CountUniqueVisitors
{
    /**
     * Reduce a set of page_views rows down to unique visitor counts.
     *
     * Registered visitors are counted by distinct user_id. Guests are counted
     * by distinct session_id — except rows recorded before the session_id
     * column existed, which have no way to be de-duplicated anymore and are
     * counted one-by-one instead, so old data doesn't collapse to zero.
     *
     * @param  Collection<int, PageView>  $rows
     * @return array{logged_in: int, guests: int}
     */
    public function handle(Collection $rows): array
    {
        $loggedIn = $rows->whereNotNull('user_id')->pluck('user_id')->unique()->count();

        $guestRows = $rows->whereNull('user_id');
        $uniqueGuestSessions = $guestRows->whereNotNull('session_id')->pluck('session_id')->unique()->count();
        $legacyGuestRows = $guestRows->whereNull('session_id')->count();

        return [
            'logged_in' => $loggedIn,
            'guests' => $uniqueGuestSessions + $legacyGuestRows,
        ];
    }
}
