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
            'section_name' => 'Persiapan Awal',
            'title' => 'Intro to Laravel',
            'slug' => 'intro-to-laravel',
            'content' => ['time' => 123, 'blocks' => [], 'version' => '2.26.5'],
            'sub_topics' => "pengenalan project\nPenjelasan Desain Database",
            'is_published' => false,
        ]);

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'course_id' => $this->course->id,
            'section_name' => 'Persiapan Awal',
            'title' => 'Intro to Laravel',
            'sub_topics' => "pengenalan project\nPenjelasan Desain Database",
        ]);
    }

    public function test_admin_can_add_youtube_video_when_creating_course_content(): void
    {
        $response = $this->actingAs($this->admin)->post("/internal/courses/{$this->course->slug}/contents", [
            'title' => 'Pengenalan HTML',
            'slug' => 'pengenalan-html',
            'content' => ['time' => 123, 'blocks' => [], 'version' => '2.26.5'],
            'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ',
            'is_published' => false,
        ]);

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'course_id' => $this->course->id,
            'title' => 'Pengenalan HTML',
            'youtube_id' => 'dQw4w9WgXcQ',
        ]);
    }

    public function test_invalid_youtube_url_is_rejected_for_course_content(): void
    {
        $response = $this->actingAs($this->admin)->post("/internal/courses/{$this->course->slug}/contents", [
            'title' => 'Pengenalan HTML',
            'slug' => 'pengenalan-html',
            'content' => ['time' => 123, 'blocks' => [], 'version' => '2.26.5'],
            'youtube_url' => 'https://example.com/not-a-video',
            'is_published' => false,
        ]);

        $response->assertSessionHasErrors(['youtube_url']);
        $this->assertDatabaseMissing('course_contents', ['slug' => 'pengenalan-html']);
    }

    public function test_course_content_without_video_stays_optional(): void
    {
        $response = $this->actingAs($this->admin)->post("/internal/courses/{$this->course->slug}/contents", [
            'title' => 'Pengenalan HTML',
            'slug' => 'pengenalan-html',
            'content' => ['time' => 123, 'blocks' => [], 'version' => '2.26.5'],
            'is_published' => false,
        ]);

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'course_id' => $this->course->id,
            'title' => 'Pengenalan HTML',
            'youtube_id' => null,
        ]);
    }

    public function test_admin_can_update_youtube_video_on_existing_content(): void
    {
        $content = CourseContent::factory()->create([
            'course_id' => $this->course->id,
            'youtube_id' => 'oldVideoId1',
        ]);

        $response = $this->actingAs($this->admin)->put(
            "/internal/courses/{$this->course->slug}/contents/{$content->slug}",
            [
                'title' => $content->title,
                'slug' => $content->slug,
                'content' => $content->content,
                'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ',
                'is_published' => $content->is_published,
            ]
        );

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'id' => $content->id,
            'youtube_id' => 'dQw4w9WgXcQ',
        ]);
    }

    public function test_leaving_youtube_field_blank_on_update_keeps_existing_video(): void
    {
        $content = CourseContent::factory()->create([
            'course_id' => $this->course->id,
            'youtube_id' => 'existingVideo1',
        ]);

        $response = $this->actingAs($this->admin)->put(
            "/internal/courses/{$this->course->slug}/contents/{$content->slug}",
            [
                'title' => 'Judul Baru',
                'slug' => $content->slug,
                'content' => $content->content,
                'is_published' => $content->is_published,
            ]
        );

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'id' => $content->id,
            'title' => 'Judul Baru',
            'youtube_id' => 'existingVideo1',
        ]);
    }

    public function test_admin_can_update_content(): void
    {
        $content = CourseContent::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->admin)->put(
            "/internal/courses/{$this->course->slug}/contents/{$content->slug}",
            [
                'section_name' => 'Persiapan Awal Updated',
                'title' => 'New Title',
                'slug' => 'new-title',
                'is_published' => true,
                'content' => $content->content,
                'sub_topics' => 'Updated Sub Topics',
            ]
        );

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $this->assertDatabaseHas('course_contents', [
            'id' => $content->id,
            'section_name' => 'Persiapan Awal Updated',
            'title' => 'New Title',
            'sub_topics' => 'Updated Sub Topics',
        ]);
    }

    public function test_admin_can_update_content_with_deleted_image(): void
    {
        Storage::fake('public');

        $content = CourseContent::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $imagePath = "courses/{$this->course->slug}/{$content->slug}/removed.png";
        Storage::disk('public')->put($imagePath, 'fake-image-content');

        $response = $this->actingAs($this->admin)->put(
            "/internal/courses/{$this->course->slug}/contents/{$content->slug}",
            [
                'section_name' => $content->section_name,
                'title' => $content->title,
                'slug' => $content->slug,
                'is_published' => $content->is_published,
                'content' => $content->content,
                'sub_topics' => $content->sub_topics,
                'deleted_images' => ["/storage/{$imagePath}"],
            ]
        );

        $response->assertRedirect("/internal/courses/{$this->course->slug}/contents");
        $response->assertSessionDoesntHaveErrors();
        Storage::disk('public')->assertMissing($imagePath);
    }

    public function test_admin_can_reorder_contents(): void
    {
        $first = CourseContent::factory()->create(['course_id' => $this->course->id, 'order' => 1]);
        $second = CourseContent::factory()->create(['course_id' => $this->course->id, 'order' => 2]);
        $third = CourseContent::factory()->create(['course_id' => $this->course->id, 'order' => 3]);

        $response = $this->actingAs($this->admin)->patch(
            "/internal/courses/{$this->course->slug}/contents/reorder",
            ['order' => [$third->id, $first->id, $second->id]]
        );

        $response->assertRedirect();
        $this->assertSame(1, $third->fresh()->order);
        $this->assertSame(2, $first->fresh()->order);
        $this->assertSame(3, $second->fresh()->order);
    }

    public function test_reorder_rejects_content_from_another_course(): void
    {
        $ownContent = CourseContent::factory()->create(['course_id' => $this->course->id, 'order' => 1]);

        $otherCourse = Course::create(['title' => 'Other Course', 'slug' => 'other-course', 'is_published' => false]);
        $otherContent = CourseContent::factory()->create(['course_id' => $otherCourse->id, 'order' => 1]);

        $response = $this->actingAs($this->admin)->patch(
            "/internal/courses/{$this->course->slug}/contents/reorder",
            ['order' => [$ownContent->id, $otherContent->id]]
        );

        $response->assertStatus(422);
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
