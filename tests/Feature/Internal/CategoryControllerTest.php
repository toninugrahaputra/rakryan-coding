<?php

namespace Tests\Feature\Internal;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
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

    public function test_admin_can_view_categories_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/categories');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/categories/index'));
    }

    public function test_non_admin_cannot_view_categories(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/categories');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/categories/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/categories/create'));
    }

    public function test_admin_can_create_category(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/categories', [
            'name' => 'Web Development',
            'slug' => 'web-development',
        ]);

        $response->assertRedirect('/internal/categories');
        $this->assertDatabaseHas('categories', ['slug' => 'web-development']);
    }

    public function test_create_requires_unique_slug(): void
    {
        Category::create(['name' => 'Existing', 'slug' => 'existing-slug']);

        $response = $this->actingAs($this->admin)->post('/internal/categories', [
            'name' => 'Duplicate',
            'slug' => 'existing-slug',
        ]);

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::create(['name' => 'Old Name', 'slug' => 'old-name']);

        $response = $this->actingAs($this->admin)->put("/internal/categories/{$category->slug}", [
            'name' => 'New Name',
            'slug' => 'new-name',
        ]);

        $response->assertRedirect('/internal/categories');
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name']);
    }

    public function test_admin_can_delete_category(): void
    {
        $category = Category::create(['name' => 'To Delete', 'slug' => 'to-delete']);

        $response = $this->actingAs($this->admin)->delete("/internal/categories/{$category->slug}");

        $response->assertRedirect('/internal/categories');
        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }
}
