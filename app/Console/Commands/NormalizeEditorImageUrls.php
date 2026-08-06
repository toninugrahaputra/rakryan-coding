<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\CourseContent;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;

class NormalizeEditorImageUrls extends Command
{
    protected $signature = 'content:normalize-image-urls {--dry-run : Report how many rows would change without saving}';

    protected $description = 'Rewrite absolute image URLs baked into stored EditorJS content (articles & course contents) to root-relative URLs, so they stay valid across domain changes.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->normalize(Article::class, $dryRun);
        $this->normalize(CourseContent::class, $dryRun);

        return self::SUCCESS;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private function normalize(string $modelClass, bool $dryRun): void
    {
        $changed = 0;

        $modelClass::query()->whereNotNull('content')->chunkById(100, function ($rows) use (&$changed, $dryRun) {
            foreach ($rows as $row) {
                $content = $row->content;

                if (! is_array($content) || empty($content['blocks'])) {
                    continue;
                }

                $modified = false;

                foreach ($content['blocks'] as &$block) {
                    if (($block['type'] ?? null) !== 'image') {
                        continue;
                    }

                    $url = $block['data']['file']['url'] ?? null;
                    if (! is_string($url)) {
                        continue;
                    }

                    $relative = preg_replace('#^https?://[^/]+(/storage/.*)$#i', '$1', $url);

                    if ($relative !== null && $relative !== $url) {
                        $block['data']['file']['url'] = $relative;
                        $modified = true;
                    }
                }
                unset($block);

                if (! $modified) {
                    continue;
                }

                $changed++;

                if (! $dryRun) {
                    $row->content = $content;
                    $row->save();
                }
            }
        });

        $prefix = $dryRun ? '[dry-run] ' : '';
        $this->info("{$prefix}".class_basename($modelClass).": {$changed} row(s) with normalized image URLs.");
    }
}
