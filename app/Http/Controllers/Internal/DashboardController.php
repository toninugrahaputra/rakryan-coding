<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Dashboard\GetDashboardStats;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(GetDashboardStats $getDashboardStats): Response
    {
        return Inertia::render('internal/dashboard', [
            'stats' => $getDashboardStats->handle(),
        ]);
    }
}
