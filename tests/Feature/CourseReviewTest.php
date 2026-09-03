<?php

namespace Tests\Feature;

use App\Actions\Order\ApproveOrder;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseReviewTest extends TestCase
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

    private function completeCourse(User $user, Course $course): void
    {
        $contents = CourseContent::factory()->for($course)->count(2)->sequence(
            ['order' => 1, 'is_published' => true],
            ['order' => 2, 'is_published' => true],
        )->create();

        foreach ($contents as $content) {
            $this->actingAs($user)->post(route('courses.contents.complete', [$course->slug, $content->slug]));
        }
    }

    public function test_user_who_completed_the_course_can_submit_review(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);
        $this->completeCourse($user, $course);

        $response = $this->actingAs($user)->post(route('courses.reviews.store', ['course' => $course->slug]), [
            'rating' => 5,
            'tags' => ['Materi Jelas', 'Sangat Detail'],
            'comment' => 'Kelasnya mantap sekali!',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'rating' => 5,
            'comment' => 'Kelasnya mantap sekali!',
        ]);
    }

    public function test_user_who_never_purchased_the_course_cannot_submit_review(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);

        $response = $this->actingAs($user)->post(route('courses.reviews.store', ['course' => $course->slug]), [
            'rating' => 1,
            'comment' => 'Review palsu',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('reviews', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_user_who_purchased_but_has_not_finished_the_course_cannot_submit_review(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);
        CourseContent::factory()->for($course)->count(2)->sequence(
            ['order' => 1, 'is_published' => true],
            ['order' => 2, 'is_published' => true],
        )->create();

        $response = $this->actingAs($user)->post(route('courses.reviews.store', ['course' => $course->slug]), [
            'rating' => 5,
            'comment' => 'Belum kelar tapi review',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('reviews', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);
    }
}
