<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SimulateXenditPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
    }

    private function createPendingOrder(): Order
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        return Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'net_amount' => 100000,
        ]);
    }

    public function test_command_marks_order_as_paid_and_activates_subscription(): void
    {
        config(['services.xendit.callback_token' => 'local-testing-token']);
        $order = $this->createPendingOrder();

        $this->artisan('xendit:simulate', ['order_number' => $order->order_number])
            ->assertExitCode(0);

        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $order->user_id,
            'product_id' => $order->product_id,
        ]);
    }

    public function test_command_marks_order_as_expired(): void
    {
        config(['services.xendit.callback_token' => 'local-testing-token']);
        $order = $this->createPendingOrder();

        $this->artisan('xendit:simulate', [
            'order_number' => $order->order_number,
            '--status' => 'EXPIRED',
        ])->assertExitCode(0);

        $this->assertEquals(OrderStatus::Expired, $order->fresh()->status);
    }

    public function test_command_fails_when_callback_token_not_configured(): void
    {
        config(['services.xendit.callback_token' => null]);
        $order = $this->createPendingOrder();

        $this->artisan('xendit:simulate', ['order_number' => $order->order_number])
            ->assertExitCode(1);

        $this->assertEquals(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_command_fails_when_order_not_found(): void
    {
        config(['services.xendit.callback_token' => 'local-testing-token']);

        $this->artisan('xendit:simulate', ['order_number' => 'ORD-NONEXISTENT'])
            ->assertExitCode(1);
    }

    public function test_command_is_blocked_in_production_env(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        config(['services.xendit.callback_token' => 'local-testing-token']);
        $order = $this->createPendingOrder();

        $this->artisan('xendit:simulate', ['order_number' => $order->order_number])
            ->assertExitCode(1);

        $this->assertEquals(OrderStatus::Pending, $order->fresh()->status);
    }
}
