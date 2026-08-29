<?php

namespace Tests\Feature\Internal;

use App\Models\Course;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_creating_published_product_notifies_all_users(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Laravel Basics',
            'slug' => 'laravel-basics',
            'type' => 'single',
            'price' => 99000,
            'is_published' => true,
            'is_favourite' => false,
            'course_ids' => [$course->id],
        ]);

        $response->assertRedirect('/internal/products');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'title' => 'Produk Baru Tersedia! 🚀',
            'url' => route('courses.show', $course),
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'title' => 'Produk Baru Tersedia! 🚀',
            'url' => route('courses.show', $course),
        ]);
    }

    public function test_creating_published_bundle_product_notifies_with_catalog_link(): void
    {
        $courses = Course::factory()->count(2)->create();

        $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Full Stack Bundle',
            'slug' => 'full-stack-bundle',
            'type' => 'bundle',
            'price' => 299000,
            'is_published' => true,
            'is_favourite' => false,
            'course_ids' => $courses->pluck('id')->toArray(),
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'title' => 'Produk Baru Tersedia! 🚀',
            'url' => route('courses.index'),
        ]);
    }

    public function test_creating_unpublished_product_does_not_notify(): void
    {
        $course = Course::factory()->create();

        $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Laravel Basics',
            'slug' => 'laravel-basics',
            'type' => 'single',
            'price' => 99000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => [$course->id],
        ]);

        $this->assertDatabaseCount('notifications', 0);
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

    public function test_admin_can_create_source_code_product_without_course(): void
    {
        Storage::fake('local');

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'E-Commerce Laravel Source Code',
            'slug' => 'ecommerce-laravel-source-code',
            'type' => 'source_code',
            'platform' => 'web',
            'price' => 199000,
            'is_published' => false,
            'is_favourite' => false,
            'source_code_file' => UploadedFile::fake()->create('project.zip', 1024, 'application/zip'),
        ]);

        $response->assertRedirect('/internal/products');
        $this->assertDatabaseHas('products', ['slug' => 'ecommerce-laravel-source-code', 'type' => 'source_code']);

        $product = Product::where('slug', 'ecommerce-laravel-source-code')->first();
        $this->assertCount(0, $product->courses);
        $this->assertNotNull($product->source_code_path);
        Storage::disk('local')->assertExists($product->source_code_path);
    }

    public function test_source_code_product_rejects_zip_over_50mb(): void
    {
        Storage::fake('local');

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Big Project',
            'slug' => 'big-project',
            'type' => 'source_code',
            'platform' => 'web',
            'price' => 199000,
            'is_published' => false,
            'is_favourite' => false,
            'source_code_file' => UploadedFile::fake()->create('project.zip', 51300, 'application/zip'),
        ]);

        $response->assertSessionHasErrors(['source_code_file']);
    }

    public function test_source_code_product_requires_zip_file_on_create(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'No File Project',
            'slug' => 'no-file-project',
            'type' => 'source_code',
            'platform' => 'web',
            'price' => 199000,
            'is_published' => false,
            'is_favourite' => false,
        ]);

        $response->assertSessionHasErrors(['source_code_file']);
    }

    public function test_admin_can_update_source_code_product_without_replacing_file(): void
    {
        Storage::fake('local');

        $product = Product::factory()->sourceCode()->create([
            'source_code_path' => 'products/source-code/existing.zip',
        ]);
        Storage::disk('local')->put('products/source-code/existing.zip', 'fake-zip-content');

        $response = $this->actingAs($this->admin)->put("/internal/products/{$product->slug}", [
            'title' => 'Updated Title',
            'slug' => $product->slug,
            'type' => 'source_code',
            'platform' => 'web',
            'price' => 149000,
            'is_published' => true,
            'is_favourite' => false,
        ]);

        $response->assertRedirect('/internal/products');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'title' => 'Updated Title',
            'source_code_path' => 'products/source-code/existing.zip',
        ]);
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

    public function test_admin_can_create_bundle_product_with_bonus_courses(): void
    {
        $mainCourse = Course::factory()->create();
        $bonusCourses = Course::factory()->count(2)->create();

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Flutter Bundle',
            'slug' => 'flutter-bundle',
            'type' => 'bundle',
            'price' => 75000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => [$mainCourse->id],
            'bonus_course_ids' => $bonusCourses->pluck('id')->toArray(),
        ]);

        $response->assertRedirect('/internal/products');

        $product = Product::where('slug', 'flutter-bundle')->first();
        $this->assertCount(3, $product->courses);
        $this->assertFalse($product->courses->firstWhere('id', $mainCourse->id)->pivot->is_bonus);
        foreach ($bonusCourses as $bonusCourse) {
            $this->assertTrue($product->courses->firstWhere('id', $bonusCourse->id)->pivot->is_bonus);
        }
    }

    public function test_course_cannot_be_both_main_and_bonus_on_the_same_product(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)->post('/internal/products', [
            'title' => 'Flutter Bundle',
            'slug' => 'flutter-bundle',
            'type' => 'bundle',
            'price' => 75000,
            'is_published' => false,
            'is_favourite' => false,
            'course_ids' => [$course->id],
            'bonus_course_ids' => [$course->id],
        ]);

        $response->assertSessionHasErrors(['bonus_course_ids']);
    }

    public function test_admin_can_update_product_bonus_courses(): void
    {
        $mainCourse = Course::factory()->create();
        $bonusCourse = Course::factory()->create();
        $product = Product::factory()->bundle()->create();
        $product->courses()->attach($mainCourse->id, ['is_bonus' => false]);

        $response = $this->actingAs($this->admin)->put("/internal/products/{$product->slug}", [
            'title' => $product->title,
            'slug' => $product->slug,
            'type' => 'bundle',
            'price' => $product->price,
            'is_published' => true,
            'is_favourite' => false,
            'course_ids' => [$mainCourse->id],
            'bonus_course_ids' => [$bonusCourse->id],
        ]);

        $response->assertRedirect('/internal/products');

        $product->refresh();
        $this->assertFalse($product->courses->firstWhere('id', $mainCourse->id)->pivot->is_bonus);
        $this->assertTrue($product->courses->firstWhere('id', $bonusCourse->id)->pivot->is_bonus);
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
