<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductGuide;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ProductGuideAccessTest extends TestCase
{
    use RefreshDatabase;

    private function purchaseProduct(User $user, Product $product): void
    {
        $order = Order::factory()->paid()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        UserSubscription::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
        ]);
    }

    public function test_guest_sees_guide_titles_but_content_is_locked(): void
    {
        $product = Product::factory()->sourceCode()->published()->create();
        $guide = ProductGuide::factory()->create([
            'product_id' => $product->id,
            'title' => 'Ekstrak Project',
            'content' => ['time' => 1, 'blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Rahasia isi panduan']]], 'version' => '2.26.5'],
            'is_published' => true,
        ]);

        $response = $this->get("/source-code/{$product->slug}/guide/{$guide->slug}");

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('source-code/guide')
            ->where('guide.title', 'Ekstrak Project')
            ->where('guide.content', null)
            ->where('isPurchased', false)
            ->has('guides', 1)
        );
    }

    public function test_purchased_user_sees_full_guide_content(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create();
        $guide = ProductGuide::factory()->create([
            'product_id' => $product->id,
            'content' => ['time' => 1, 'blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Isi panduan lengkap']]], 'version' => '2.26.5'],
            'is_published' => true,
        ]);

        $this->purchaseProduct($user, $product);

        $response = $this->actingAs($user)->get("/source-code/{$product->slug}/guide/{$guide->slug}");

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('isPurchased', true)
            ->where('guide.content.blocks.0.data.text', 'Isi panduan lengkap')
        );
    }

    public function test_unpublished_guide_returns_404(): void
    {
        $product = Product::factory()->sourceCode()->published()->create();
        $guide = ProductGuide::factory()->create([
            'product_id' => $product->id,
            'is_published' => false,
        ]);

        $response = $this->get("/source-code/{$product->slug}/guide/{$guide->slug}");

        $response->assertNotFound();
    }

    public function test_source_code_show_page_lists_published_guide_titles(): void
    {
        $product = Product::factory()->sourceCode()->published()->create();
        ProductGuide::factory()->create(['product_id' => $product->id, 'title' => 'Step Terbit', 'order' => 1, 'is_published' => true]);
        ProductGuide::factory()->create(['product_id' => $product->id, 'title' => 'Step Draft', 'order' => 2, 'is_published' => false]);

        $response = $this->get("/source-code/{$product->slug}");

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->has('guides', 1)
            ->where('guides.0.title', 'Step Terbit')
        );
    }
}
