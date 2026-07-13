<?php

namespace Tests\Feature\Internal;

use App\Models\Course;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductTest extends TestCase
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

    public function test_admin_can_view_products_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/products');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/products/index'));
    }

    public function test_non_admin_cannot_view_products(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/products');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/products/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/products/create'));
    }

    public function test_admin_can_create_single_product(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Laravel Basics',
            'slug' => 'laravel-basics',
            'type' => 'single',
            'price' => 99000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => [$course->id],
        ]);

        $response->assertRedirect('/internal/products');
        $this->assertDatabaseHas('products', ['slug' => 'laravel-basics', 'type' => 'single']);

        $product = Product::where('slug', 'laravel-basics')->first();
        $this->assertCount(1, $product->courses);
    }

    public function test_admin_can_create_bundle_product(): void
    {
        $courses = Course::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Full Stack Bundle',
            'slug' => 'full-stack-bundle',
            'type' => 'bundle',
            'price' => 299000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => $courses->pluck('id')->toArray(),
        ]);

        $response->assertRedirect('/internal/products');
        $this->assertDatabaseHas('products', ['slug' => 'full-stack-bundle', 'type' => 'bundle']);

        $product = Product::where('slug', 'full-stack-bundle')->first();
        $this->assertCount(3, $product->courses);
    }

    public function test_single_product_cannot_have_more_than_one_course(): void
    {
        $courses = Course::factory()->count(2)->create();

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Single Course',
            'slug' => 'single-course',
            'type' => 'single',
            'price' => 99000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => $courses->pluck('id')->toArray(),
        ]);

        $response->assertSessionHasErrors(['course_ids']);
    }

    public function test_create_product_requires_unique_slug(): void
    {
        $course = Course::factory()->create();
        $existingProduct = Product::factory()->single()->create(['slug' => 'existing-slug']);
        $existingProduct->courses()->attach($course->id);

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Duplicate',
            'slug' => 'existing-slug',
            'type' => 'single',
            'price' => 99000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => [$course->id],
        ]);

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_admin_can_update_product(): void
    {
        $course = Course::factory()->create();
        $product = Product::factory()->single()->create();
        $product->courses()->attach($course->id);

        $response = $this->actingAs($this->admin)->put("/internal/products/{$product->slug}", [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'type' => 'single',
            'price' => 149000,
            'is_published' => true,
            'is_favourite' => false,
            'course_ids' => [$course->id],
        ]);

        $response->assertRedirect('/internal/products');
        $this->assertDatabaseHas('products', ['id' => $product->id, 'title' => 'Updated Title']);
    }

    public function test_admin_can_delete_product(): void
    {
        $course = Course::factory()->create();
        $product = Product::factory()->single()->create();
        $product->courses()->attach($course->id);

        $response = $this->actingAs($this->admin)->delete("/internal/products/{$product->slug}");

        $response->assertRedirect('/internal/products');
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }
}
