<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsOnboarded
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->onboarded_at === null) {
            if ($request->isMethod('get')) {
                $request->session()->put('url.intended', $request->fullUrl());
            }

            return redirect()->route('onboarding.show');
        }

        return $next($request);
    }
}
