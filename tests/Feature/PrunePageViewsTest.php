<?php

namespace Tests\Feature;

use App\Models\PageView;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrunePageViewsTest extends TestCase
{
    use RefreshDatabase;

    private function createPageViewAt(\DateTimeInterface $createdAt): PageView
    {
        $view = PageView::factory()->create();
        $view->forceFill(['created_at' => $createdAt])->save();

        return $view;
    }

    public function test_command_deletes_page_views_older_than_six_months(): void
    {
        $oldView = $this->createPageViewAt(now()->subMonths(7));

        $this->artisan('page-views:prune')->assertExitCode(0);

        $this->assertDatabaseMissing('page_views', ['id' => $oldView->id]);
    }

    public function test_command_keeps_page_views_within_six_months(): void
    {
        $recentView = $this->createPageViewAt(now()->subMonths(3));

        $this->artisan('page-views:prune')->assertExitCode(0);

        $this->assertDatabaseHas('page_views', ['id' => $recentView->id]);
    }

    public function test_command_keeps_page_views_exactly_at_the_six_month_boundary(): void
    {
        $boundaryView = $this->createPageViewAt(now()->subMonths(6)->addMinute());

        $this->artisan('page-views:prune')->assertExitCode(0);

        $this->assertDatabaseHas('page_views', ['id' => $boundaryView->id]);
    }
}
