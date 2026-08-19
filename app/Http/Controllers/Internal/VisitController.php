<?php

namespace App\Http\Controllers\Internal;

use App\Actions\PageView\GetVisitStats;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
        ]);

        return Inertia::render('internal/visits/index', [
            'stats' => app(GetVisitStats::class)->handle($data['date'] ?? null),
        ]);
    }
}
