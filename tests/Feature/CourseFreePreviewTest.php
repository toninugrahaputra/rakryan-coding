<?php

namespace Tests\Feature;

use App\Actions\Order\ApproveOrder;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CourseFreePreviewTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Course, 1: array<int, CourseContent>}
     */
    private function createCourseWithModules(int $price, int $moduleCount = 4): array
    {
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => $price]);
        $product->courses()->attach($course->id);

        $contents = [];
        for ($i = 1; $i <= $moduleCount; $i++) {
            $contents[] = CourseContent::factory()->for($course)->create([
                'title' => "Modul {$i}",
                'slug' => "modul-{$i}",
                'content' => ['time' => now()->timestamp, 'blocks' => [['type' => 'paragraph', 'data' => ['text' => "Isi modul {$i}"]]], 'version' => '2.31.6'],
                'order' => $i,
                'is_published' => true,
            ]);
        }

        return [$course, $contents];
    }

    public function test_guest_can_preview_first_three_modules_of_free_course(): void
    {
        [$course, $contents] = $this->createCourseWithModules(price: 0);

        foreach ([0, 1, 2] as $index) {
            $response = $this->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[$index]->slug]));
            $response->assertOk();
            $response->assertInertia(fn (AssertableInertia $page) => $page
                ->component('courses/contents/show')
                ->where('isPurchased', false)
                ->where('isPreview', true)
            );
        }
    }

    public function test_guest_is_redirected_to_login_on_fourth_module_of_free_course(): void
    {
        [$course, $contents] = $this->createCourseWithModules(price: 0);

        $response = $this->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[3]->slug]));

        $response->assertRedirect(route('login'));
    }

    public function test_guest_is_redirected_to_login_on_first_module_of_paid_course(): void
    {
        [$course, $contents] = $this->createCourseWithModules(price: 100000);

        $response = $this->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[0]->slug]));

        $response->assertRedirect(route('login'));
    }

    public function test_logged_in_user_without_claiming_can_only_preview_free_course(): void
    {
        [$course, $contents] = $this->createCourseWithModules(price: 0);
        $user = User::factory()->create();

        // Modul pertama (dalam batas preview) tetap bisa dibaca meski belum klaim.
        $previewResponse = $this->actingAs($user)
            ->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[0]->slug]));
        $previewResponse->assertOk();
        $previewResponse->assertInertia(fn (AssertableInertia $page) => $page
            ->component('courses/contents/show')
            ->where('isPurchased', false)
            ->where('isPreview', true)
        );

        // Modul ke-4 (di luar batas preview) mengarahkan ke alur klaim gratis, bukan langsung terbuka.
        $lockedResponse = $this->actingAs($user)
            ->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[3]->slug]));
        $lockedResponse->assertRedirect(route('orders.create', ['course' => $course->slug]));
    }

    public function test_logged_in_user_who_has_claimed_free_course_gets_full_access(): void
    {
        [$course, $contents] = $this->createCourseWithModules(price: 0);
        $user = User::factory()->create();
        $product = $course->products()->first();

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
        app(ApproveOrder::class)->handle($order, $user);

        $response = $this->actingAs($user)
            ->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[3]->slug]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('courses/contents/show')
            ->where('isPurchased', true)
            ->where('isPreview', false)
        );
    }

    public function test_logged_in_user_without_purchase_is_blocked_on_paid_course(): void
    {
        [$course, $contents] = $this->createCourseWithModules(price: 100000);
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $contents[0]->slug]));

        $response->assertRedirect(route('courses.show', $course->slug));
    }
}
