<?php

namespace Tests\Feature\Internal;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserControllerTest extends TestCase
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

    public function test_admin_can_view_users_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/users');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/users/index'));
    }

    public function test_non_admin_cannot_view_users_index(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/users');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_is_redirected(): void
    {
        $response = $this->get('/internal/users');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_view_create_user_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/users/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/users/create'));
    }

    public function test_admin_can_create_user(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'user',
        ]);

        $response->assertRedirect('/internal/users');
        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_create_user_requires_valid_data(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/users', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'role' => 'nonexistent',
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'password', 'role']);
    }

    public function test_create_user_requires_unique_email(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/users', [
            'name' => 'Duplicate',
            'email' => $this->user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'user',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_admin_can_view_edit_user_form(): void
    {
        $response = $this->actingAs($this->admin)->get("/internal/users/{$this->user->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/users/edit'));
    }

    public function test_admin_can_update_user(): void
    {
        $response = $this->actingAs($this->admin)->put("/internal/users/{$this->user->id}", [
            'name' => 'Updated Name',
            'email' => $this->user->email,
            'password' => null,
            'password_confirmation' => null,
            'role' => 'admin',
        ]);

        $response->assertRedirect('/internal/users');
        $this->assertDatabaseHas('users', ['id' => $this->user->id, 'name' => 'Updated Name']);
        $this->assertTrue($this->user->fresh()->hasRole('admin'));
    }

    public function test_admin_can_delete_user(): void
    {
        $targetUser = User::factory()->create();
        $targetUser->assignRole('user');

        $response = $this->actingAs($this->admin)->delete("/internal/users/{$targetUser->id}");

        $response->assertRedirect('/internal/users');
        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
    }
}
