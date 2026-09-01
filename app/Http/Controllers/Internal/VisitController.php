<?php

namespace App\Http\Controllers\Internal;

use App\Actions\PageView\GetLoggedInVisitsForDate;
use App\Actions\PageView\GetVisitStats;
use App\Actions\PageView\GetVisitStatsRange;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'range' => ['nullable', Rule::in(['day', 'week', 'month', 'quarter'])],
        ]);

        $range = $data['range'] ?? 'day';

        $stats = $range === 'day'
            ? app(GetVisitStats::class)->handle($data['date'] ?? null)
            : app(GetVisitStatsRange::class)->handle($range, $data['date'] ?? null);

        return Inertia::render('internal/visits/index', [
            'stats' => $stats,
        ]);
    }

    /**
     * Daftar pengunjung terdaftar untuk satu tanggal — di-load sesuai
     * kebutuhan saat modal detail dibuka, bukan ikut ke-load di index().
     */
    public function loggedIn(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $visits = app(GetLoggedInVisitsForDate::class)->handle($data['date'] ?? null);

        return response()->json($visits);
    }
}
