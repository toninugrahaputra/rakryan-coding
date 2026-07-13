<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_review_for_course()
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);

        $this->actingAs($user);

        $response = $this->post(route('courses.reviews.store', ['course' => $course->slug]), [
            'rating'   => 5,
            'tags'     => ['Materi Jelas', 'Sangat Detail'],
            'comment'  => 'Kelasnya mantap sekali!',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('reviews', [
            'user_id'   => $user->id,
            'course_id' => $course->id,
            'rating'    => 5,
            'comment'   => 'Kelasnya mantap sekali!',
        ]);
    }
}
