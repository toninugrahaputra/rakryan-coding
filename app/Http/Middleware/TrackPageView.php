<?php

namespace App\Http\Middleware;

use App\Actions\PageView\RecordPageView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageView
{
    /**
     * Route names (or name prefixes, ending in `.`) that should never be
     * counted as a site visit — admin panel usage, webhooks, and machine-read
     * endpoints aren't "who visited the website today".
     *
     * @var array<int, string>
     */
    private const EXCLUDED_ROUTE_NAMES = [
        'internal.',
        'webhooks.',
        'sitemap',
    ];

    /**
     * Case-insensitive substrings matched against the User-Agent header to
     * filter out crawlers, uptime monitors, link-preview fetchers, and
     * common HTTP client libraries — none of them are a real site visitor.
     * Not exhaustive (no UA blocklist ever is), but covers the traffic that
     * would otherwise skew "who visited today" the most.
     *
     * @var array<int, string>
     */
    private const BOT_USER_AGENT_SIGNATURES = [
        'bot', 'crawl', 'spider', 'slurp', 'archiver', 'preview',
        'facebookexternalhit', 'twitterbot', 'telegrambot', 'whatsapp',
        'slackbot', 'discordbot', 'linkedinbot', 'skypeuripreview',
        'uptimerobot', 'pingdom', 'statuscake', 'better uptime', 'site24x7',
        'curl', 'wget', 'python-requests', 'python-urllib', 'scrapy',
        'go-http-client', 'node-fetch', 'axios', 'okhttp', 'headlesschrome',
        'phantomjs', 'postmanruntime', 'insomnia',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            app(RecordPageView::class)->handle($request->user()?->id, $request->session()->getId(), $request->path());
        }

        return $response;
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        if ($response->getStatusCode() >= 400) {
            return false;
        }

        if (! $request->isMethod('GET')) {
            return false;
        }

        $routeName = $request->route()?->getName();

        if ($routeName === null) {
            return false;
        }

        foreach (self::EXCLUDED_ROUTE_NAMES as $excluded) {
            if ($routeName === $excluded || str_starts_with($routeName, $excluded)) {
                return false;
            }
        }

        if ($this->isBot($request->userAgent())) {
            return false;
        }

        return true;
    }

    private function isBot(?string $userAgent): bool
    {
        if ($userAgent === null || trim($userAgent) === '') {
            return true;
        }

        $userAgent = strtolower($userAgent);

        foreach (self::BOT_USER_AGENT_SIGNATURES as $signature) {
            if (str_contains($userAgent, $signature)) {
                return true;
            }
        }

        return false;
    }
}
