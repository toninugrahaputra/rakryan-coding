<?php

namespace Tests\Feature\Internal;

use App\Models\PageView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VisitControllerTest extends TestCase
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

    public function test_non_admin_cannot_view_visits_page(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/visits');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_visits_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/visits');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/visits/index'));
    }

    public function test_visits_page_defaults_to_today(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/visits');

        $response->assertInertia(fn ($page) => $page->where('stats.date', Carbon::today()->toDateString()));
    }

    public function test_visits_page_shows_stats_for_the_requested_date(): void
    {
        $visitor = User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
        $targetDate = Carbon::parse('2026-08-10');

        // Logged-in visit on the target date — should be included.
        PageView::factory()->create(['user_id' => $visitor->id, 'path' => 'courses/laravel-dasar'])
            ->forceFill(['created_at' => $targetDate->copy()->setTime(9, 30)])->save();

        // Guest visit on the target date — counted, but not listed individually.
        PageView::factory()->create(['user_id' => null, 'path' => '/'])
            ->forceFill(['created_at' => $targetDate->copy()->setTime(14, 0)])->save();

        // Visit on a different date — must not leak into the target date's stats.
        PageView::factory()->create(['user_id' => $visitor->id, 'path' => 'articles'])
            ->forceFill(['created_at' => $targetDate->copy()->addDay()->setTime(9, 0)])->save();

        $response = $this->actingAs($this->admin)->get('/internal/visits?date=2026-08-10');

        $response->assertInertia(fn ($page) => $page
            ->where('stats.date', '2026-08-10')
            ->where('stats.total_visits', 2)
            ->where('stats.guest_visits', 1)
            ->where('stats.unique_logged_in_visitors', 1)
            ->where('stats.visits.0.user_name', 'Budi Santoso')
            ->where('stats.visits.0.user_email', 'budi@example.com')
            ->where('stats.visits.0.path', 'courses/laravel-dasar')
            ->where('stats.visits.0.visited_at', '09:30')
        );
    }

    public function test_visits_page_rejects_invalid_date_format(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/visits?date=10-08-2026');

        $response->assertSessionHasErrors('date');
    }

    public function test_visits_page_rejects_future_dates(): void
    {
        $future = Carbon::tomorrow()->toDateString();

        $response = $this->actingAs($this->admin)->get("/internal/visits?date={$future}");

        $response->assertSessionHasErrors('date');
    }
}
