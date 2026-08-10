<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_endpoint_is_rate_limited(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->published()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($user)->post(route('orders.store'), ['product_id' => $product->id]);
        }

        $response = $this->actingAs($user)->post(route('orders.store'), ['product_id' => $product->id]);

        $response->assertStatus(429);
    }

    public function test_apply_voucher_endpoint_is_rate_limited(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->published()->create();

        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($user)->post(route('orders.apply-voucher'), [
                'voucher_code' => 'INVALID',
                'product_id' => $product->id,
            ]);
        }

        $response = $this->actingAs($user)->post(route('orders.apply-voucher'), [
            'voucher_code' => 'INVALID',
            'product_id' => $product->id,
        ]);

        $response->assertStatus(429);
    }

    public function test_generate_ai_endpoint_is_rate_limited(): void
    {
        // Fake the outbound call so this test never depends on ambient/real
        // OPENROUTER_API_KEY env state and never makes a real network call.
        Http::fake(['openrouter.ai/*' => Http::response([
            'choices' => [['message' => ['content' => json_encode(['excerpt' => null, 'blocks' => []])]]],
        ], 200)]);

        Role::create(['name' => 'admin']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($admin)->postJson('/internal/articles/generate-ai', ['title' => 'Test']);
        }

        $response = $this->actingAs($admin)->postJson('/internal/articles/generate-ai', ['title' => 'Test']);

        $response->assertStatus(429);
    }
}
