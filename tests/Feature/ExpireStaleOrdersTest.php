<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpireStaleOrdersTest extends TestCase
{
    use RefreshDatabase;

    private function createPendingOrder(?\DateTimeInterface $validUntil): Order
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        return Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'valid_until' => $validUntil,
        ]);
    }

    public function test_command_marks_stale_pending_orders_as_expired(): void
    {
        $staleOrder = $this->createPendingOrder(now()->subHour());

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Expired, $staleOrder->fresh()->status);
    }

    public function test_command_does_not_touch_orders_still_within_valid_until(): void
    {
        $freshOrder = $this->createPendingOrder(now()->addHour());

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Pending, $freshOrder->fresh()->status);
    }

    public function test_command_does_not_touch_pending_orders_without_valid_until(): void
    {
        $orderWithoutDeadline = $this->createPendingOrder(null);

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Pending, $orderWithoutDeadline->fresh()->status);
    }
}
