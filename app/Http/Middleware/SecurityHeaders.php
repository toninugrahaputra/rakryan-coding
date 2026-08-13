<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $nonce = Str::random(16);

        View::share('cspNonce', $nonce);
        Vite::useCspNonce($nonce);

        $response = $next($request);

        if ($request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        $scriptSrc = "script-src 'self' 'nonce-{$nonce}'";
        $styleSrc = "style-src 'self' 'unsafe-inline'";
        $fontSrc = "font-src 'self'";
        $connectSrc = "connect-src 'self'";

        if (app()->environment('local')) {
            // Chrome does not accept IPv6 literals (e.g. http://[::1]:*) as a CSP
            // source, so the Vite dev server is pinned to 127.0.0.1 in vite.config.ts.
            $viteDevServers = 'http://localhost:* http://127.0.0.1:*';
            $viteDevSockets = 'ws://localhost:* ws://127.0.0.1:*';

            $scriptSrc .= " {$viteDevServers}";
            $styleSrc .= " {$viteDevServers}";
            $fontSrc .= " {$viteDevServers}";
            $connectSrc .= " {$viteDevServers} {$viteDevSockets}";
        }

        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'self'",
            $scriptSrc,
            $styleSrc,
            "img-src 'self' data: blob: https: http:",
            $fontSrc,
            $connectSrc,
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'self'",
        ]));

        return $response;
    }
}
