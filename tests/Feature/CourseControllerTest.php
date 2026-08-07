<?php

namespace Tests\Feature;

use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_courses_index_excludes_draft_courses(): void
    {
        Course::factory()->create(['title' => 'Published Course', 'is_published' => true]);
        Course::factory()->create(['title' => 'Draft Course', 'is_published' => false]);

        $response = $this->get('/courses');

        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses.data', 1)
        );
    }
}
