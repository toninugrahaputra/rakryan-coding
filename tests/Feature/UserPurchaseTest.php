<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Services\XenditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserPurchaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
    }

    public function test_user_can_view_checkout_page(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['course' => $course->slug]));

        $response->assertOk();
    }

    public function test_user_cannot_view_checkout_page_if_already_purchased(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // Langsung daftarkan user ke subskripsi product ini
        $user->subscriptions()->create([
            'product_id' => $product->id,
            'order_id' => $order->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['course' => $course->slug]));

        $response->assertRedirect(route('courses.show', $course->slug));
    }

    public function test_user_can_place_order_and_gets_payment_url(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $response = $this->actingAs($user)
            ->post(route('orders.store'), [
                'product_id' => $product->id,
            ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals($user->id, $order->user_id);
        $this->assertEquals(OrderStatus::Pending, $order->status);
        $this->assertNotNull($order->payment_url);
        $this->assertNotNull($order->valid_until);
        $this->assertNotNull($order->payment_metadata);

        $response->assertRedirect(route('orders.show', $order->id));
    }

    public function test_order_and_voucher_redemption_roll_back_when_xendit_invoice_creation_fails(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);
        $voucher = Voucher::factory()->flat(20000)->create();

        $this->mock(XenditService::class, function ($mock) {
            $mock->shouldReceive('createInvoice')->once()->andThrow(new \Exception('Xendit sedang gangguan'));
        });

        $response = $this->actingAs($user)
            ->post(route('orders.store'), [
                'product_id' => $product->id,
                'voucher_code' => $voucher->code,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('voucher_usages', 0);
        $this->assertEquals(0, $voucher->fresh()->usage_count);
    }

    public function test_user_can_apply_voucher_successfully(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);
        $voucher = Voucher::factory()->flat(20000)->create();

        $response = $this->actingAs($user)
            ->postJson(route('orders.apply-voucher'), [
                'voucher_code' => $voucher->code,
                'product_id' => $product->id,
            ]);

        $response->assertOk()
            ->assertJson([
                'valid' => true,
                'discount' => 20000,
            ]);
    }

    public function test_xendit_webhook_callback_successfully_activates_subscription(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        // Buat order pending
        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'net_amount' => 100000,
        ]);

        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
                'amount' => 100000,
            ]);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
        ]);
    }

    public function test_xendit_webhook_callback_requires_valid_token_if_configured(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        // Buat order pending
        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // Kirim tanpa token -> 401
        $response = $this->postJson(route('webhooks.xendit'), [
            'external_id' => $order->order_number,
            'status' => 'PAID',
        ]);
        $response->assertStatus(401);

        // Kirim dengan token salah -> 401
        $response = $this->withHeaders(['x-callback-token' => 'wrong-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
            ]);
        $response->assertStatus(401);

        // Kirim dengan token benar -> 200
        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
            ]);
        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
    }

    public function test_duplicate_paid_webhook_is_idempotent_and_does_not_error(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'net_amount' => 100000,
        ]);

        $payload = [
            'external_id' => $order->order_number,
            'status' => 'PAID',
            'amount' => 100000,
        ];

        // Kiriman pertama: memproses & meng-approve order seperti biasa
        $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), $payload)
            ->assertOk();

        // Kiriman kedua (retry/duplicate dari Xendit): harus tetap 200, bukan 500
        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), $payload);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
        $this->assertDatabaseCount('user_subscriptions', 1);
    }

    public function test_paid_webhook_for_already_cancelled_order_does_not_auto_approve(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'status' => OrderStatus::Cancel,
        ]);

        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
                'amount' => 100000,
            ]);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Cancel, $order->fresh()->status);
        $this->assertDatabaseCount('user_subscriptions', 0);
    }

    public function test_expired_webhook_marks_pending_order_as_expired(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'EXPIRED',
            ]);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Expired, $order->fresh()->status);
    }

    public function test_order_self_approval_via_mock_pay_works_in_local_or_testing_env(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.show', [$order->id, 'mock_pay' => '1']));

        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
    }

    public function test_order_self_approval_via_mock_pay_does_not_work_in_production_env(): void
    {
        // Mock the environment to production
        $this->app->detectEnvironment(fn () => 'production');

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.show', [$order->id, 'mock_pay' => '1']));

        $response->assertOk();
        $this->assertEquals(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_user_can_cancel_own_pending_order(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->patch(route('orders.cancel', $order->id));

        $response->assertRedirect();
        $this->assertEquals(OrderStatus::Cancel, $order->fresh()->status);
    }

    public function test_user_cannot_cancel_another_users_order(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $otherUser->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->patch(route('orders.cancel', $order->id));

        $response->assertStatus(403);
        $this->assertEquals(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_user_cannot_cancel_an_already_paid_order(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'status' => OrderStatus::Paid,
        ]);

        $response = $this->actingAs($user)
            ->patch(route('orders.cancel', $order->id));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
    }
}
