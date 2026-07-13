<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        \Spatie\Permission\Models\Role::create(['name' => 'admin']);
    }

    public function test_guest_user_can_view_landing_page(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('welcome'));
    }

    public function test_authenticated_user_can_view_landing_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('welcome'));
    }

    public function test_authenticated_admin_can_view_landing_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('welcome'));
    }
}
