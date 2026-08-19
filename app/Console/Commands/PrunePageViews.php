<?php

namespace App\Console\Commands;

use App\Models\PageView;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('page-views:prune')]
#[Description('Hapus data page_views yang lebih lama dari batas retensi, supaya tabelnya tidak terus membesar.')]
class PrunePageViews extends Command
{
    private const RETENTION_MONTHS = 6;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = PageView::query()
            ->where('created_at', '<', now()->subMonths(self::RETENTION_MONTHS))
            ->delete();

        $this->info("{$count} page view lebih lama dari ".self::RETENTION_MONTHS.' bulan dihapus.');

        return self::SUCCESS;
    }
}
