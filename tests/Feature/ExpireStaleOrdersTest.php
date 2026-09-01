<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
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
        $staleOrder = $this->createPendingOrder(now()->subHours(3));

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Expired, $staleOrder->fresh()->status);
    }

    public function test_command_does_not_touch_orders_still_within_valid_until(): void
    {
        $freshOrder = $this->createPendingOrder(now()->addHour());

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Pending, $freshOrder->fresh()->status);
    }

    public function test_command_leaves_a_grace_period_after_valid_until_before_expiring(): void
    {
        // Baru lewat 30 menit dari batas waktu — dalam masa toleransi, belum
        // di-expire, supaya webhook Xendit yang datang sedikit telat masih
        // menemukan order ini Pending, bukan sudah Expired.
        $justPastDeadline = $this->createPendingOrder(now()->subMinutes(30));

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Pending, $justPastDeadline->fresh()->status);
    }

    public function test_command_expires_orders_past_the_grace_period(): void
    {
        $wellPastDeadline = $this->createPendingOrder(now()->subHours(3));

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Expired, $wellPastDeadline->fresh()->status);
    }

    public function test_command_does_not_touch_pending_orders_without_valid_until(): void
    {
        $orderWithoutDeadline = $this->createPendingOrder(null);

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Pending, $orderWithoutDeadline->fresh()->status);
    }

    public function test_command_releases_voucher_usage_of_orders_it_expires(): void
    {
        $staleOrder = $this->createPendingOrder(now()->subHours(3));
        $voucher = Voucher::factory()->flat(20000)->create(['usage_count' => 1, 'per_user_limit' => 1]);
        $usage = $voucher->usages()->create([
            'user_id' => $staleOrder->user_id,
            'order_id' => $staleOrder->id,
            'discount_amount' => 20000,
        ]);

        $this->artisan('orders:expire-stale')->assertExitCode(0);

        $this->assertEquals(OrderStatus::Expired, $staleOrder->fresh()->status);
        $this->assertEquals(0, $voucher->fresh()->usage_count);
        $this->assertDatabaseMissing('voucher_usages', ['id' => $usage->id]);
    }
}
