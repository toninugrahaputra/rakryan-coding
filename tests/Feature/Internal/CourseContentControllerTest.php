<?php

namespace Tests\Feature\Internal;

use App\Models\Course;
use App\Models\CourseContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CourseContentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->course = Course::create(['title' => 'Test Course', 'slug' => 'test-course', 'is_published' => false]);
    }

    public function test_admin_can_view_contents_index(): void
    {
        $response = $this->actingAs($this->admin)->get("/internal/courses/{$this->course->slug}/contents");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/courses/contents/index'));
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get("/internal/courses/{$this->course->slug}/contents/create");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/courses/contents/create'));
    }

    public function test_admin_can_create_content(): void
    {
        $response = $this->actingAs($this->admin)->post("/internal/courses/{$this->course->slug}/contents", [
            'title' => 'Intro to Laravel',
            'slug' => 'intro-to-laravel',
            'content' => ['time' => 123, 'blocks' => [], 'version' => '2.26.5'],
            'is_published' => false,
        ]);

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'course_id' => $this->course->id,
            'title' => 'Intro to Laravel',
        ]);
    }

    public function test_admin_can_update_content(): void
    {
        $content = CourseContent::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->admin)->put(
            "/internal/courses/{$this->course->slug}/contents/{$content->slug}",
            ['title' => 'New Title', 'slug' => 'new-title', 'is_published' => true, 'content' => $content->content]
        );

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', ['id' => $content->id, 'title' => 'New Title']);
    }

    public function test_admin_can_delete_content(): void
    {
        Storage::fake('public');

        $content = CourseContent::factory()->create(['course_id' => $this->course->id]);

        Storage::disk('public')->put("courses/{$this->course->slug}/{$content->slug}/image.jpg", 'fake');

        $response = $this->actingAs($this->admin)->delete(
            "/internal/courses/{$this->course->slug}/contents/{$content->slug}"
        );

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseMissing('course_contents', ['id' => $content->id]);
        Storage::disk('public')->assertMissing("courses/{$this->course->slug}/{$content->slug}/image.jpg");
    }
}
