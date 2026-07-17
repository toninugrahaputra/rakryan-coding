<?php

namespace Tests\Feature\Internal;

use App\Models\Technology;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TechnologyControllerTest extends TestCase
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

    public function test_admin_can_view_technologies_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/technologies');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/technologies/index'));
    }

    public function test_non_admin_cannot_view_technologies(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/technologies');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/technologies/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/technologies/create'));
    }

    public function test_admin_can_create_technology_with_logo(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin)->post('/internal/technologies', [
            'name' => 'Laravel',
            'slug' => 'laravel',
            'logo' => UploadedFile::fake()->image('laravel.png'),
        ]);

        $response->assertRedirect('/internal/technologies');
        $this->assertDatabaseHas('technologies', ['slug' => 'laravel']);

        $technology = Technology::where('slug', 'laravel')->firstOrFail();
        Storage::disk('public')->assertExists($technology->logo);
    }

    public function test_create_requires_unique_slug(): void
    {
        Technology::create(['name' => 'Existing', 'slug' => 'existing-slug']);

        $response = $this->actingAs($this->admin)->post('/internal/technologies', [
            'name' => 'Duplicate',
            'slug' => 'existing-slug',
        ]);

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_admin_can_update_technology(): void
    {
        $technology = Technology::create(['name' => 'Old Name', 'slug' => 'old-name']);

        $response = $this->actingAs($this->admin)->put("/internal/technologies/{$technology->slug}", [
            'name' => 'New Name',
            'slug' => 'new-name',
        ]);

        $response->assertRedirect('/internal/technologies');
        $this->assertDatabaseHas('technologies', ['id' => $technology->id, 'name' => 'New Name']);
    }

    public function test_admin_can_delete_technology(): void
    {
        $technology = Technology::create(['name' => 'To Delete', 'slug' => 'to-delete']);

        $response = $this->actingAs($this->admin)->delete("/internal/technologies/{$technology->slug}");

        $response->assertRedirect('/internal/technologies');
        $this->assertSoftDeleted('technologies', ['id' => $technology->id]);
    }
}
