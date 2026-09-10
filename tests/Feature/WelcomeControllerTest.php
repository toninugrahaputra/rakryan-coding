<?php

namespace Tests\Feature;

use App\Actions\Order\ApproveOrder;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WelcomeControllerTest extends TestCase
{
    use RefreshDatabase;

    private function purchaseCourse(User $user, Course $course): void
    {
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        app(ApproveOrder::class)->handle($order, $user);
    }

    public function test_active_voucher_with_remaining_quota_is_shown(): void
    {
        $voucher = Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 5,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('vouchers', 1)
            ->where('vouchers.0.code', $voucher->code));
    }

    public function test_voucher_with_exhausted_quota_is_not_shown(): void
    {
        Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 10,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('vouchers', 0));
    }

    public function test_voucher_with_unlimited_quota_is_shown(): void
    {
        $voucher = Voucher::factory()->create([
            'quota' => null,
            'usage_count' => 500,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('vouchers', 1)
            ->where('vouchers.0.code', $voucher->code));
    }

    public function test_unpublished_course_is_not_shown_as_featured_even_if_its_product_is_published(): void
    {
        $course = Course::factory()->create(['is_published' => false]);
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('featuredCourses', 0));
    }

    public function test_published_course_with_published_product_is_shown_as_featured(): void
    {
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('featuredCourses', 1)
            ->where('featuredCourses.0.slug', $course->slug));
    }

    public function test_featured_courses_mix_up_to_three_paid_and_three_free(): void
    {
        for ($i = 1; $i <= 4; $i++) {
            $course = Course::factory()->create(['title' => "Paid Course {$i}", 'is_published' => true]);
            $product = Product::factory()->single()->published()->create(['price' => 100000]);
            $product->courses()->attach($course->id);
        }

        for ($i = 1; $i <= 4; $i++) {
            $course = Course::factory()->create(['title' => "Free Course {$i}", 'is_published' => true]);
            $product = Product::factory()->single()->published()->create(['price' => 0]);
            $product->courses()->attach($course->id);
        }

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('featuredCourses', 6));

        $titles = collect($response->inertiaPage()['props']['featuredCourses'])->pluck('title');
        $paidCount = $titles->filter(fn ($title) => str_starts_with($title, 'Paid Course'))->count();
        $freeCount = $titles->filter(fn ($title) => str_starts_with($title, 'Free Course'))->count();

        $this->assertSame(3, $paidCount);
        $this->assertSame(3, $freeCount);
    }

    public function test_purchased_course_ids_are_shared_for_featured_courses(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);

        $response = $this->actingAs($user)->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('purchasedCourseIds', [$course->id]));
    }
}
