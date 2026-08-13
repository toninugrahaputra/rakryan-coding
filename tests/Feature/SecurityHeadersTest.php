<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_security_headers_are_present(): void
    {
        $response = $this->get('/');

        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->assertHeaderMissing('X-Frame-Options');
        $this->assertNotNull($response->headers->get('Content-Security-Policy'));
    }

    public function test_csp_excludes_vite_dev_server_outside_local_environment(): void
    {
        $this->app['env'] = 'production';

        $response = $this->get('/');

        $csp = $response->headers->get('Content-Security-Policy');

        $this->assertStringNotContainsString('[::1]', $csp);
        $this->assertStringNotContainsString('localhost:*', $csp);
    }

    public function test_csp_allows_vite_dev_server_in_local_environment(): void
    {
        $this->app['env'] = 'local';

        $response = $this->get('/');

        $csp = $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("style-src 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:*", $csp);
        $this->assertStringContainsString("font-src 'self' http://localhost:* http://127.0.0.1:*", $csp);
        $this->assertStringContainsString("script-src 'self' 'nonce-", $csp);
        $this->assertStringContainsString('ws://localhost:*', $csp);
    }
}
