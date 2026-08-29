<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SourceCodeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_shows_only_published_source_code_products(): void
    {
        $published = Product::factory()->sourceCode()->published()->create();
        Product::factory()->sourceCode()->create(['is_published' => false]);
        Product::factory()->single()->published()->create();

        $response = $this->get('/source-code');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('source-code/index')
            ->has('products', 1)
            ->where('products.0.slug', $published->slug));
    }

    public function test_index_filters_by_platform(): void
    {
        $web = Product::factory()->sourceCode()->published()->create(['platform' => 'web']);
        Product::factory()->sourceCode()->published()->create(['platform' => 'mobile']);

        $response = $this->get('/source-code?platform=web');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('source-code/index')
            ->has('products', 1)
            ->where('products.0.slug', $web->slug)
            ->where('filters.platform', 'web'));
    }

    public function test_show_returns_published_source_code_product(): void
    {
        $product = Product::factory()->sourceCode()->published()->create();

        $response = $this->get("/source-code/{$product->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('source-code/show')
            ->where('product.slug', $product->slug)
            ->where('isPurchased', false));
    }

    public function test_show_returns_404_for_unpublished_product(): void
    {
        $product = Product::factory()->sourceCode()->create(['is_published' => false]);

        $response = $this->get("/source-code/{$product->slug}");

        $response->assertStatus(404);
    }

    public function test_show_returns_404_for_non_source_code_product(): void
    {
        $product = Product::factory()->single()->published()->create();

        $response = $this->get("/source-code/{$product->slug}");

        $response->assertStatus(404);
    }

    public function test_show_reports_purchased_true_for_owner(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create();
        UserSubscription::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        $response = $this->actingAs($user)->get("/source-code/{$product->slug}");

        $response->assertInertia(fn ($page) => $page->where('isPurchased', true));
    }

    public function test_owner_can_download_source_code(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('products/source-code/project.zip', 'fake-zip-content');

        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create([
            'source_code_path' => 'products/source-code/project.zip',
        ]);
        UserSubscription::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        $response = $this->actingAs($user)->get("/source-code/{$product->slug}/download");

        $response->assertOk();
        $response->assertHeader('content-disposition', "attachment; filename={$product->slug}.zip");
    }

    public function test_non_owner_cannot_download_source_code(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('products/source-code/project.zip', 'fake-zip-content');

        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create([
            'source_code_path' => 'products/source-code/project.zip',
        ]);

        $response = $this->actingAs($user)->get("/source-code/{$product->slug}/download");

        $response->assertStatus(403);
    }

    public function test_guest_cannot_download_source_code(): void
    {
        $product = Product::factory()->sourceCode()->published()->create([
            'source_code_path' => 'products/source-code/project.zip',
        ]);

        $response = $this->get("/source-code/{$product->slug}/download");

        $response->assertRedirect('/login');
    }
}
