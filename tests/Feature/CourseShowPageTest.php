<?php

namespace Tests\Feature;

use App\Actions\Order\ApproveOrder;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Order;
use App\Models\Product;
use App\Models\Technology;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CourseShowPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_paid_user_can_view_course_and_published_module()
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        app(ApproveOrder::class)->handle($order, $user);

        $content = CourseContent::factory()->for($course)->create([
            'title' => 'Modul Pertama',
            'slug' => 'modul-pertama',
            'content' => ['time' => now()->timestamp, 'blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Isi modul pertama']]], 'version' => '2.31.6'],
            'order' => 1,
            'is_published' => true,
        ]);

        $this->actingAs($user);

        $courseResponse = $this->get(route('courses.show', ['course' => $course->slug]));
        $courseResponse->assertStatus(200);
        $courseResponse->assertSeeText($course->title);
        $courseResponse->assertSeeText('Modul Pertama');

        $contentResponse = $this->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $content->slug]));
        $contentResponse->assertStatus(200);
        $contentResponse->assertInertia(fn (AssertableInertia $page) => $page
            ->component('courses/contents/show')
            ->has('content')
            ->where('content.title', 'Modul Pertama')
        );
    }

    public function test_user_without_purchase_cannot_access_course_or_module()
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $content = CourseContent::factory()->for($course)->create([
            'title' => 'Modul Tertutup',
            'slug' => 'modul-tertutup',
            'content' => ['time' => now()->timestamp, 'blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Rahasia konten']]], 'version' => '2.31.6'],
            'order' => 1,
            'is_published' => true,
        ]);

        $this->actingAs($user);

        $this->get(route('courses.show', ['course' => $course->slug]))
            ->assertStatus(200);

        $this->get(route('courses.contents.show', ['course' => $course->slug, 'content' => $content->slug]))
            ->assertRedirect(route('courses.show', $course->slug));
    }

    public function test_course_show_page_lists_attached_technologies()
    {
        $course = Course::factory()->create(['is_published' => true]);
        $laravel = Technology::create(['name' => 'Laravel', 'slug' => 'laravel']);
        $react = Technology::create(['name' => 'React', 'slug' => 'react']);
        $course->technologies()->attach([$laravel->id, $react->id]);

        $response = $this->get(route('courses.show', ['course' => $course->slug]));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('courses/show')
            ->has('course.technologies', 2)
            ->where('course.technologies.0.name', 'Laravel')
            ->where('course.technologies.1.name', 'React')
        );
    }
}
