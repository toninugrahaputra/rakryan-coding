<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Course;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_returns_xml_content_type(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');
    }

    public function test_sitemap_includes_static_pages(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertSee(route('home'), false);
        $response->assertSee(route('courses.index'), false);
        $response->assertSee(route('articles.index'), false);
    }

    public function test_sitemap_includes_published_course_with_published_product(): void
    {
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $response = $this->get('/sitemap.xml');

        $response->assertSee(route('courses.show', $course), false);
    }

    public function test_sitemap_excludes_course_without_published_product(): void
    {
        $course = Course::factory()->create(['is_published' => true, 'slug' => 'no-product-course']);

        $response = $this->get('/sitemap.xml');

        $response->assertDontSee(route('courses.show', $course), false);
    }

    public function test_sitemap_excludes_unpublished_course(): void
    {
        $course = Course::factory()->create(['is_published' => false, 'slug' => 'draft-course']);
        $product = Product::factory()->single()->published()->create();
        $product->courses()->attach($course->id);

        $response = $this->get('/sitemap.xml');

        $response->assertDontSee(route('courses.show', $course), false);
    }

    public function test_sitemap_includes_published_article(): void
    {
        $article = Article::factory()->create(['is_published' => true]);

        $response = $this->get('/sitemap.xml');

        $response->assertSee(route('articles.show', $article), false);
    }

    public function test_sitemap_excludes_unpublished_article(): void
    {
        $article = Article::factory()->create(['is_published' => false, 'slug' => 'draft-article']);

        $response = $this->get('/sitemap.xml');

        $response->assertDontSee(route('articles.show', $article), false);
    }
}
