<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_recommendations_include_the_correct_contents_count(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        CourseContent::factory()->count(5)->create(['course_id' => $course->id]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('recommendations.0.contents_count', 5)
        );
    }
}
