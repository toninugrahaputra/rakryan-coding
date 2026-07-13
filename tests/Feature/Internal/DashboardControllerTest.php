<?php

namespace Tests\Feature\Internal;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->user = User::factory()->create();
        $this->user->assignRole('user');
    }

    public function test_admin_can_view_dashboard_with_stats(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/dashboard')
            && $page->has('stats'));
    }

    public function test_non_admin_cannot_view_internal_dashboard(): void
    {
        $response = $this->actingAs($this->user)->get('/internal');

        $response->assertStatus(403);
    }
}
