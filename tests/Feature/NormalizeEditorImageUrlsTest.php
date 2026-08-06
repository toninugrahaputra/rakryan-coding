<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\CourseContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NormalizeEditorImageUrlsTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_rewrites_absolute_image_urls_to_root_relative(): void
    {
        $article = Article::factory()->create([
            'content' => [
                'time' => 1,
                'blocks' => [
                    ['type' => 'paragraph', 'data' => ['text' => 'Halo']],
                    ['type' => 'image', 'data' => ['file' => ['url' => 'https://rcodingcoba.rakryan.id/storage/articles/foo/bar.png'], 'caption' => '']],
                ],
                'version' => '2.29.0',
            ],
        ]);

        $courseContent = CourseContent::factory()->create([
            'content' => [
                'time' => 1,
                'blocks' => [
                    ['type' => 'image', 'data' => ['file' => ['url' => 'http://old-domain.test/storage/courses/x/y/baz.png'], 'caption' => '']],
                ],
                'version' => '2.29.0',
            ],
        ]);

        $this->artisan('content:normalize-image-urls')->assertExitCode(0);

        $this->assertSame(
            '/storage/articles/foo/bar.png',
            $article->fresh()->content['blocks'][1]['data']['file']['url'],
        );
        $this->assertSame(
            '/storage/courses/x/y/baz.png',
            $courseContent->fresh()->content['blocks'][0]['data']['file']['url'],
        );
    }

    public function test_command_leaves_already_relative_urls_untouched(): void
    {
        $article = Article::factory()->create([
            'content' => [
                'time' => 1,
                'blocks' => [
                    ['type' => 'image', 'data' => ['file' => ['url' => '/storage/articles/foo/bar.png'], 'caption' => '']],
                ],
                'version' => '2.29.0',
            ],
        ]);

        $this->artisan('content:normalize-image-urls')->assertExitCode(0);

        $this->assertSame(
            '/storage/articles/foo/bar.png',
            $article->fresh()->content['blocks'][0]['data']['file']['url'],
        );
    }

    public function test_dry_run_does_not_persist_changes(): void
    {
        $article = Article::factory()->create([
            'content' => [
                'time' => 1,
                'blocks' => [
                    ['type' => 'image', 'data' => ['file' => ['url' => 'https://old-domain.test/storage/articles/foo/bar.png'], 'caption' => '']],
                ],
                'version' => '2.29.0',
            ],
        ]);

        $this->artisan('content:normalize-image-urls --dry-run')->assertExitCode(0);

        $this->assertSame(
            'https://old-domain.test/storage/articles/foo/bar.png',
            $article->fresh()->content['blocks'][0]['data']['file']['url'],
        );
    }

    public function test_command_ignores_content_without_blocks(): void
    {
        $courseContent = CourseContent::factory()->create(['content' => null]);

        $this->artisan('content:normalize-image-urls')->assertExitCode(0);

        $this->assertNull($courseContent->fresh()->content);
    }
}
