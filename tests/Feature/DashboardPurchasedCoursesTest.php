<?php

namespace Tests\Feature;

use App\Actions\Order\ApproveOrder;
use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardPurchasedCoursesTest extends TestCase
{
    use RefreshDatabase;

    public function test_purchased_course_is_visible_on_dashboard()
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        app(ApproveOrder::class)->handle($order, $user);

        $this->actingAs($user);
        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertSeeText($course->title);
        $response->assertInertia(fn ($page) => $page->component('dashboard'));
    }
}
