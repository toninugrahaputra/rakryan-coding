<?php

namespace Tests\Feature\Internal;

use App\Models\Product;
use App\Models\ProductGuide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductGuideControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->product = Product::factory()->sourceCode()->create(['title' => 'Test Product', 'slug' => 'test-product']);
    }

    public function test_admin_can_view_guides_index(): void
    {
        $response = $this->actingAs($this->admin)->get("/internal/products/{$this->product->slug}/guides");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/products/guides/index'));
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get("/internal/products/{$this->product->slug}/guides/create");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/products/guides/create'));
    }

    public function test_admin_can_create_guide(): void
    {
        $response = $this->actingAs($this->admin)->post("/internal/products/{$this->product->slug}/guides", [
            'title' => 'Ekstrak & Buka Project',
            'slug' => 'ekstrak-buka-project',
            'content' => ['time' => 123, 'blocks' => [], 'version' => '2.26.5'],
            'is_published' => false,
        ]);

        $response->assertRedirect("/internal/products/{$this->product->slug}/guides");
        $this->assertDatabaseHas('product_guides', [
            'product_id' => $this->product->id,
            'title' => 'Ekstrak & Buka Project',
            'slug' => 'ekstrak-buka-project',
        ]);
    }

    public function test_admin_can_update_guide(): void
    {
        $guide = ProductGuide::factory()->create(['product_id' => $this->product->id]);

        $response = $this->actingAs($this->admin)->put(
            "/internal/products/{$this->product->slug}/guides/{$guide->slug}",
            [
                'title' => 'New Title',
                'slug' => 'new-title',
                'is_published' => true,
                'content' => $guide->content,
            ]
        );

        $response->assertRedirect("/internal/products/{$this->product->slug}/guides");
        $this->assertDatabaseHas('product_guides', [
            'id' => $guide->id,
            'title' => 'New Title',
            'is_published' => true,
        ]);
    }

    public function test_admin_can_update_guide_with_deleted_image(): void
    {
        Storage::fake('public');

        $guide = ProductGuide::factory()->create(['product_id' => $this->product->id]);

        $imagePath = "products/{$this->product->slug}/guides/{$guide->slug}/removed.png";
        Storage::disk('public')->put($imagePath, 'fake-image-content');

        $response = $this->actingAs($this->admin)->put(
            "/internal/products/{$this->product->slug}/guides/{$guide->slug}",
            [
                'title' => $guide->title,
                'slug' => $guide->slug,
                'is_published' => $guide->is_published,
                'content' => $guide->content,
                'deleted_images' => ["/storage/{$imagePath}"],
            ]
        );

        $response->assertRedirect("/internal/products/{$this->product->slug}/guides");
        $response->assertSessionDoesntHaveErrors();
        Storage::disk('public')->assertMissing($imagePath);
    }

    public function test_admin_can_reorder_guides(): void
    {
        $first = ProductGuide::factory()->create(['product_id' => $this->product->id, 'order' => 1]);
        $second = ProductGuide::factory()->create(['product_id' => $this->product->id, 'order' => 2]);
        $third = ProductGuide::factory()->create(['product_id' => $this->product->id, 'order' => 3]);

        $response = $this->actingAs($this->admin)->patch(
            "/internal/products/{$this->product->slug}/guides/reorder",
            ['order' => [$third->id, $first->id, $second->id]]
        );

        $response->assertRedirect();
        $this->assertSame(1, $third->fresh()->order);
        $this->assertSame(2, $first->fresh()->order);
        $this->assertSame(3, $second->fresh()->order);
    }

    public function test_reorder_rejects_guide_from_another_product(): void
    {
        $ownGuide = ProductGuide::factory()->create(['product_id' => $this->product->id, 'order' => 1]);

        $otherProduct = Product::factory()->sourceCode()->create(['slug' => 'other-product']);
        $otherGuide = ProductGuide::factory()->create(['product_id' => $otherProduct->id, 'order' => 1]);

        $response = $this->actingAs($this->admin)->patch(
            "/internal/products/{$this->product->slug}/guides/reorder",
            ['order' => [$ownGuide->id, $otherGuide->id]]
        );

        $response->assertStatus(422);
    }

    public function test_admin_can_delete_guide(): void
    {
        Storage::fake('public');

        $guide = ProductGuide::factory()->create(['product_id' => $this->product->id]);

        Storage::disk('public')->put("products/{$this->product->slug}/guides/{$guide->slug}/image.jpg", 'fake');

        $response = $this->actingAs($this->admin)->delete(
            "/internal/products/{$this->product->slug}/guides/{$guide->slug}"
        );

        $response->assertRedirect("/internal/products/{$this->product->slug}/guides");
        $this->assertDatabaseMissing('product_guides', ['id' => $guide->id]);
        Storage::disk('public')->assertMissing("products/{$this->product->slug}/guides/{$guide->slug}/image.jpg");
    }

    public function test_non_admin_cannot_manage_guides(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this->actingAs($user)->get("/internal/products/{$this->product->slug}/guides");

        $response->assertStatus(403);
    }
}
