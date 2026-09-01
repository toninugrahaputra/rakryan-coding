<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\PageView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TrackPageViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_visiting_a_public_page_records_a_guest_page_view(): void
    {
        $this->get('/');

        $this->assertDatabaseHas('page_views', [
            'user_id' => null,
            'path' => '/',
        ]);
    }

    public function test_visiting_a_page_while_logged_in_records_the_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/courses');

        $this->assertDatabaseHas('page_views', [
            'user_id' => $user->id,
            'session_id' => null,
            'path' => 'courses',
        ]);
    }

    public function test_visiting_a_page_as_guest_records_a_session_id(): void
    {
        $this->get('/');

        $view = PageView::first();

        $this->assertNotNull($view->session_id);
    }

    public function test_visiting_a_nonexistent_course_does_not_record_a_page_view(): void
    {
        $this->get('/courses/does-not-exist');

        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_visiting_the_internal_admin_panel_does_not_record_a_page_view(): void
    {
        Role::create(['name' => 'admin']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->get('/internal');

        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_non_get_requests_do_not_record_a_page_view(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/notifications/read-all');

        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_visiting_a_published_course_records_its_path(): void
    {
        $course = Course::factory()->create(['is_published' => true]);

        $this->get("/courses/{$course->slug}");

        $this->assertDatabaseHas('page_views', [
            'user_id' => null,
            'path' => "courses/{$course->slug}",
        ]);
    }

    public function test_known_bot_user_agent_does_not_record_a_page_view(): void
    {
        $this->withHeader('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
            ->get('/');

        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_missing_user_agent_does_not_record_a_page_view(): void
    {
        $this->withHeader('User-Agent', '')->get('/');

        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_http_client_user_agent_does_not_record_a_page_view(): void
    {
        $this->withHeader('User-Agent', 'python-requests/2.31.0')->get('/');

        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_real_browser_user_agent_records_a_page_view(): void
    {
        $this->withHeader(
            'User-Agent',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        )->get('/');

        $this->assertDatabaseCount('page_views', 1);
    }
}
