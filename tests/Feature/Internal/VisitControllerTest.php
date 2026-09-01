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

        // Guest visit on the target date — counted in the same hour bucket.
        PageView::factory()->create(['user_id' => null, 'path' => '/'])
            ->forceFill(['created_at' => $targetDate->copy()->setTime(9, 45)])->save();

        // Visit on a different date — must not leak into the target date's stats.
        PageView::factory()->create(['user_id' => $visitor->id, 'path' => 'articles'])
            ->forceFill(['created_at' => $targetDate->copy()->addDay()->setTime(9, 0)])->save();

        $response = $this->actingAs($this->admin)->get('/internal/visits?date=2026-08-10');

        $response->assertInertia(fn ($page) => $page
            ->where('stats.date', '2026-08-10')
            ->where('stats.total_visits', 2)
            ->where('stats.guest_visits', 1)
            ->where('stats.unique_logged_in_visitors', 1)
            ->where('stats.hourly.9.hour', 9)
            ->where('stats.hourly.9.total_visits', 2)
            ->where('stats.hourly.9.guest_visits', 1)
            ->where('stats.hourly.9.logged_in_visits', 1)
            ->where('stats.hourly.10.total_visits', 0)
            ->has('stats.hourly', 24)
        );
    }

    public function test_repeated_page_views_by_the_same_visitor_count_once(): void
    {
        $visitor = User::factory()->create();
        $targetDate = Carbon::parse('2026-08-10');
        $guestSession = 'guest-session-abc';

        // Akun yang sama membuka 3 halaman berbeda — tetap 1 kunjungan.
        foreach (['courses', 'courses/laravel-dasar', 'dashboard'] as $i => $path) {
            PageView::factory()->create(['user_id' => $visitor->id, 'session_id' => null, 'path' => $path])
                ->forceFill(['created_at' => $targetDate->copy()->setTime(9, 10 + $i)])->save();
        }

        // Tamu (session sama) membuka 2 halaman berbeda — tetap 1 kunjungan.
        foreach (['/', 'articles'] as $i => $path) {
            PageView::factory()->create(['user_id' => null, 'session_id' => $guestSession, 'path' => $path])
                ->forceFill(['created_at' => $targetDate->copy()->setTime(9, 20 + $i)])->save();
        }

        $response = $this->actingAs($this->admin)->get('/internal/visits?date=2026-08-10');

        $response->assertInertia(fn ($page) => $page
            ->where('stats.total_visits', 2)
            ->where('stats.guest_visits', 1)
            ->where('stats.unique_logged_in_visitors', 1)
            ->where('stats.hourly.9.total_visits', 2)
            ->where('stats.hourly.9.guest_visits', 1)
            ->where('stats.hourly.9.logged_in_visits', 1)
        );
    }

    public function test_guest_visits_recorded_before_session_tracking_are_still_counted(): void
    {
        $targetDate = Carbon::parse('2026-08-10');

        // Data lama, direkam sebelum kolom session_id ada — tidak bisa lagi
        // di-unikkan, tapi tetap harus terhitung, bukan hilang jadi nol.
        foreach (range(1, 3) as $i) {
            PageView::factory()->create(['user_id' => null, 'session_id' => null, 'path' => '/'])
                ->forceFill(['created_at' => $targetDate->copy()->setTime(9, $i)])->save();
        }

        $response = $this->actingAs($this->admin)->get('/internal/visits?date=2026-08-10');

        $response->assertInertia(fn ($page) => $page
            ->where('stats.guest_visits', 3)
            ->where('stats.total_visits', 3)
        );
    }

    public function test_visits_page_accepts_a_week_range_and_returns_daily_breakdown(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/visits?range=week');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.range', 'week')
            ->has('stats.daily', 7)
            ->where('stats.end_date', Carbon::today()->toDateString())
            ->where('stats.start_date', Carbon::today()->subDays(6)->toDateString())
        );
    }

    public function test_visits_page_accepts_a_month_range_ending_on_a_chosen_date(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/visits?range=month&date=2026-08-10');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.range', 'month')
            ->has('stats.daily', 30)
            ->where('stats.end_date', '2026-08-10')
            ->where('stats.start_date', '2026-07-12')
        );
    }

    public function test_visits_page_accepts_a_quarter_range(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/visits?range=quarter');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.range', 'quarter')
            ->has('stats.daily', 90)
        );
    }

    public function test_week_range_aggregates_visitors_across_all_its_days(): void
    {
        $day1 = Carbon::today()->subDays(2);
        $day2 = Carbon::today()->subDay();
        $visitor = User::factory()->create();

        // Akun yang sama login di dua hari berbeda dalam rentang — dihitung 1x
        // per hari di breakdown harian, tapi tetap 1 pengunjung unik di total rentang.
        PageView::factory()->create(['user_id' => $visitor->id, 'path' => '/'])
            ->forceFill(['created_at' => $day1->copy()->setTime(9, 0)])->save();
        PageView::factory()->create(['user_id' => $visitor->id, 'path' => '/'])
            ->forceFill(['created_at' => $day2->copy()->setTime(9, 0)])->save();

        $response = $this->actingAs($this->admin)->get('/internal/visits?range=week');

        $response->assertInertia(fn ($page) => $page
            ->where('stats.unique_logged_in_visitors', 1)
        );
    }

    public function test_admin_can_view_logged_in_visit_details(): void
    {
        $visitor = User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
        $targetDate = Carbon::parse('2026-08-10');

        PageView::factory()->create(['user_id' => $visitor->id, 'path' => 'courses/laravel-dasar'])
            ->forceFill(['created_at' => $targetDate->copy()->setTime(9, 30)])->save();

        // Guest visit on the same date — must not appear in the logged-in detail list.
        PageView::factory()->create(['user_id' => null, 'path' => '/'])
            ->forceFill(['created_at' => $targetDate->copy()->setTime(9, 45)])->save();

        $response = $this->actingAs($this->admin)
            ->getJson('/internal/visits/logged-in?date=2026-08-10');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment([
            'user_name' => 'Budi Santoso',
            'user_email' => 'budi@example.com',
            'path' => 'courses/laravel-dasar',
            'visited_at' => '09:30',
        ]);
    }

    public function test_non_admin_cannot_view_logged_in_visit_details(): void
    {
        $response = $this->actingAs($this->user)->getJson('/internal/visits/logged-in');

        $response->assertStatus(403);
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
