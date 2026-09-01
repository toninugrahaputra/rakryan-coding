<?php

namespace Tests\Feature;

use App\Actions\Order\ApproveOrder;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CourseProgressTest extends TestCase
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

    public function test_purchased_user_can_mark_a_module_complete_and_is_sent_to_the_next_one(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);

        $first = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);
        $second = CourseContent::factory()->for($course)->create(['order' => 2, 'is_published' => true]);

        $response = $this->actingAs($user)
            ->post(route('courses.contents.complete', [$course->slug, $first->slug]));

        $response->assertRedirect(route('courses.contents.show', [$course->slug, $second->slug]));
        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->id,
            'course_content_id' => $first->id,
        ]);
    }

    public function test_completing_the_last_module_redirects_to_the_course_page_with_a_finished_toast(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);

        $only = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);

        $response = $this->actingAs($user)
            ->post(route('courses.contents.complete', [$course->slug, $only->slug]));

        $response->assertRedirect(route('courses.show', $course->slug));
        $this->assertSame(
            ['type' => 'success', 'message' => 'Selamat! Anda telah menyelesaikan seluruh modul di course ini.'],
            session('inertia.flash_data')['toast'] ?? null,
        );
    }

    public function test_completing_a_module_twice_does_not_create_duplicate_progress_rows(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);

        $content = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);

        $this->actingAs($user)->post(route('courses.contents.complete', [$course->slug, $content->slug]));
        $this->actingAs($user)->post(route('courses.contents.complete', [$course->slug, $content->slug]));

        $this->assertSame(1, UserProgress::where('user_id', $user->id)
            ->where('course_content_id', $content->id)
            ->count());
    }

    public function test_user_who_has_not_purchased_the_course_cannot_mark_a_module_complete(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $content = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);

        $response = $this->actingAs($user)
            ->post(route('courses.contents.complete', [$course->slug, $content->slug]));

        $response->assertStatus(403);
        $this->assertDatabaseMissing('user_progress', [
            'user_id' => $user->id,
            'course_content_id' => $content->id,
        ]);
    }

    public function test_guest_hitting_complete_is_redirected_to_login(): void
    {
        $course = Course::factory()->create(['is_published' => true]);
        $content = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);

        $response = $this->post(route('courses.contents.complete', [$course->slug, $content->slug]));

        $response->assertRedirect(route('login'));
    }

    public function test_one_users_progress_does_not_leak_into_another_users_view(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($userA, $course);
        $this->purchaseCourse($userB, $course);

        $content = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);

        $this->actingAs($userA)->post(route('courses.contents.complete', [$course->slug, $content->slug]));

        $responseA = $this->actingAs($userA)->get(route('courses.contents.show', [$course->slug, $content->slug]));
        $responseA->assertInertia(fn (AssertableInertia $page) => $page
            ->where('content.is_completed', true)
            ->where('progress.completed_count', 1)
        );

        $responseB = $this->actingAs($userB)->get(route('courses.contents.show', [$course->slug, $content->slug]));
        $responseB->assertInertia(fn (AssertableInertia $page) => $page
            ->where('content.is_completed', false)
            ->where('progress.completed_count', 0)
        );
    }

    public function test_progress_percentage_reflects_completed_modules(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $this->purchaseCourse($user, $course);

        $first = CourseContent::factory()->for($course)->create(['order' => 1, 'is_published' => true]);
        CourseContent::factory()->for($course)->create(['order' => 2, 'is_published' => true]);
        CourseContent::factory()->for($course)->create(['order' => 3, 'is_published' => true]);
        CourseContent::factory()->for($course)->create(['order' => 4, 'is_published' => true]);

        $this->actingAs($user)->post(route('courses.contents.complete', [$course->slug, $first->slug]));

        $response = $this->actingAs($user)->get(route('courses.contents.show', [$course->slug, $first->slug]));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('progress.total_count', 4)
            ->where('progress.completed_count', 1)
            ->where('progress.percentage', 25)
        );
    }
}
