<?php

namespace Tests\Feature\Internal;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderControllerTest extends TestCase
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

    public function test_admin_can_view_orders_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/orders');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/orders/index'));
    }

    public function test_non_admin_cannot_view_orders(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/orders');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/orders/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/orders/create'));
    }

    public function test_admin_can_create_order(): void
    {
        $product = Product::factory()->published()->create(['price' => 150000]);
        $buyer = User::factory()->create();

        $response = $this->actingAs($this->admin)->post('/internal/orders', [
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'channel_group' => 'Transfer',
            'channel_name' => 'BCA',
            'payment_fee' => 6500,
            'total_amount' => 150000,
        ]);

        $response->assertRedirect('/internal/orders');
        $this->assertDatabaseHas('orders', [
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'channel_group' => 'Transfer',
            'channel_name' => 'BCA',
            'payment_fee' => 6500,
            'total_amount' => 150000,
            'net_amount' => 143500,
            'provider' => 'Manual',
            'status' => 'pending',
        ]);
    }

    public function test_order_number_is_auto_generated(): void
    {
        $product = Product::factory()->published()->create();
        $buyer = User::factory()->create();

        $this->actingAs($this->admin)->post('/internal/orders', [
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'channel_group' => 'Transfer',
            'payment_fee' => 0,
            'total_amount' => 100000,
        ]);

        $order = Order::first();
        $this->assertStringStartsWith('ORD-', $order->order_number);
    }

    public function test_create_order_requires_valid_fields(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/orders', []);

        $response->assertSessionHasErrors(['user_id', 'product_id', 'channel_group', 'payment_fee', 'total_amount']);
    }

    public function test_admin_can_view_order_show(): void
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)->get("/internal/orders/{$order->order_number}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/orders/show'));
    }

    public function test_admin_can_approve_pending_order(): void
    {
        $product = Product::factory()->create();
        $buyer = User::factory()->create();
        $order = Order::factory()->pending()->create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}/approve");

        $response->assertRedirect("/internal/orders/{$order->order_number}");

        $order->refresh();
        $this->assertEquals(OrderStatus::Paid, $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertEquals($this->admin->id, $order->approved_by);

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
        ]);
    }

    public function test_admin_cannot_approve_already_paid_order(): void
    {
        $order = Order::factory()->paid()->create();

        $response = $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}/approve");

        $response->assertSessionHasErrors('status');
        $this->assertDatabaseCount('user_subscriptions', 0);
    }

    public function test_admin_can_cancel_pending_order(): void
    {
        $order = Order::factory()->pending()->create();

        $response = $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}/cancel");

        $response->assertRedirect("/internal/orders/{$order->order_number}");
        $this->assertEquals(OrderStatus::Cancel, $order->fresh()->status);
    }

    public function test_admin_cannot_cancel_already_paid_order(): void
    {
        $order = Order::factory()->paid()->create();

        $response = $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}/cancel");

        $response->assertSessionHasErrors('status');
    }

    public function test_approving_order_creates_exactly_one_subscription(): void
    {
        $product = Product::factory()->create();
        $buyer = User::factory()->create();
        $order = Order::factory()->pending()->create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}/approve");

        $this->assertDatabaseCount('user_subscriptions', 1);
    }

    public function test_admin_can_view_edit_form_for_pending_order(): void
    {
        $order = Order::factory()->pending()->create();

        $response = $this->actingAs($this->admin)->get("/internal/orders/{$order->order_number}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/orders/edit'));
    }

    public function test_admin_cannot_edit_non_pending_order(): void
    {
        $order = Order::factory()->paid()->create();

        $response = $this->actingAs($this->admin)->get("/internal/orders/{$order->order_number}/edit");

        $response->assertStatus(403);
    }

    public function test_admin_can_update_pending_order(): void
    {
        $order = Order::factory()->pending()->create([
            'channel_group' => 'Transfer',
            'payment_fee' => 0,
            'total_amount' => 100000,
        ]);

        $response = $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}", [
            'channel_group' => 'Virtual Account',
            'channel_name' => 'BNI',
            'payment_fee' => 4000,
            'total_amount' => 100000,
            'payment_code' => '8277001234567',
            'payment_reference' => 'TXN-ABC123',
        ]);

        $response->assertRedirect("/internal/orders/{$order->order_number}");

        $order->refresh();
        $this->assertEquals('Virtual Account', $order->channel_group);
        $this->assertEquals('BNI', $order->channel_name);
        $this->assertEquals(4000, $order->payment_fee);
        $this->assertEquals(96000, $order->net_amount);
        $this->assertEquals('8277001234567', $order->payment_code);
        $this->assertEquals('TXN-ABC123', $order->payment_reference);
    }

    public function test_admin_cannot_update_non_pending_order(): void
    {
        $order = Order::factory()->paid()->create();

        $response = $this->actingAs($this->admin)->patch("/internal/orders/{$order->order_number}", [
            'channel_group' => 'Transfer',
            'payment_fee' => 0,
            'total_amount' => 100000,
        ]);

        $response->assertSessionHasErrors('status');
    }

    public function test_admin_can_delete_pending_order(): void
    {
        $order = Order::factory()->pending()->create();
        $orderNumber = $order->order_number;

        $response = $this->actingAs($this->admin)->delete("/internal/orders/{$orderNumber}");

        $response->assertRedirect('/internal/orders');
        $this->assertDatabaseMissing('orders', ['order_number' => $orderNumber]);
    }

    public function test_admin_cannot_delete_non_pending_order(): void
    {
        $order = Order::factory()->paid()->create();

        $response = $this->actingAs($this->admin)->delete("/internal/orders/{$order->order_number}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('orders', ['order_number' => $order->order_number]);
    }
}
