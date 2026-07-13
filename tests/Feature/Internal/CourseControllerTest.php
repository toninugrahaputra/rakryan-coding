<?php

namespace Tests\Feature\Internal;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CourseControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->user = User::factory()->create();
        $this->user->assignRole('user');
    }

    public function test_admin_can_view_courses_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/courses');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/courses/index'));
    }

    public function test_non_admin_cannot_view_courses(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/courses');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/courses/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/courses/create'));
    }

    public function test_admin_can_create_course(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/courses', [
            'title' => 'Laravel Basics',
            'slug' => 'laravel-basics',
            'is_published' => false,
        ]);

        $response->assertRedirect('/internal/courses');
        $this->assertDatabaseHas('courses', ['slug' => 'laravel-basics']);
    }

    public function test_create_course_requires_unique_slug(): void
    {
        Course::create(['title' => 'Existing', 'slug' => 'existing-slug', 'is_published' => false]);

        $response = $this->actingAs($this->admin)->post('/internal/courses', [
            'title' => 'Duplicate',
            'slug' => 'existing-slug',
            'is_published' => false,
        ]);

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_admin_can_update_course(): void
    {
        $course = Course::create(['title' => 'Old Title', 'slug' => 'old-title', 'is_published' => false]);

        $response = $this->actingAs($this->admin)->put("/internal/courses/{$course->slug}", [
            'title' => 'New Title',
            'slug' => 'new-title',
            'is_published' => true,
        ]);

        $response->assertRedirect('/internal/courses');
        $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => 'New Title']);
    }

    public function test_admin_can_delete_course(): void
    {
        $course = Course::create(['title' => 'To Delete', 'slug' => 'to-delete', 'is_published' => false]);

        $response = $this->actingAs($this->admin)->delete("/internal/courses/{$course->slug}");

        $response->assertRedirect('/internal/courses');
        $this->assertSoftDeleted('courses', ['id' => $course->id]);
    }

    public function test_deleting_course_soft_deletes_it(): void
    {
        $course = Course::create(['title' => 'Soft Delete', 'slug' => 'soft-delete', 'is_published' => false]);

        $course->delete();

        $this->assertSoftDeleted('courses', ['id' => $course->id]);
    }
}
