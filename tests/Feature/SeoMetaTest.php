<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoMetaTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_has_default_seo_meta(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('data-inertia="description" name="description" content="Platform belajar coding teks lengkap', false);
        $response->assertSee('property="og:type" data-inertia="og:type" content="website"', false);
        $response->assertSee('property="og:locale" content="id_ID"', false);
        $response->assertSee('name="twitter:card" content="summary_large_image"', false);
    }

    public function test_course_show_page_has_course_specific_seo_meta(): void
    {
        $course = Course::factory()->create([
            'is_published' => true,
            'description' => 'Kursus singkat tentang testing otomatis di Laravel.',
        ]);

        $response = $this->get("/courses/{$course->slug}");

        $response->assertOk();
        $response->assertSee("property=\"og:title\" data-inertia=\"og:title\" content=\"{$course->title}\"", false);
        $response->assertSee('content="Kursus singkat tentang testing otomatis di Laravel."', false);
        $response->assertSee('rel="canonical" href="'.route('courses.show', $course).'"', false);
        $response->assertSee("property=\"og:image:alt\" data-inertia=\"og:image:alt\" content=\"{$course->title}\"", false);
    }

    public function test_course_show_page_falls_back_to_default_description_when_empty(): void
    {
        $course = Course::factory()->create([
            'is_published' => true,
            'description' => null,
        ]);

        $response = $this->get("/courses/{$course->slug}");

        $response->assertOk();
        $response->assertSee('data-inertia="description" name="description" content="Platform belajar ngoding teks lengkap', false);
    }

    public function test_article_show_page_has_article_specific_seo_meta_and_og_type(): void
    {
        $article = Article::factory()->create([
            'is_published' => true,
            'excerpt' => 'Ringkasan singkat artikel ini.',
        ]);

        $response = $this->get("/articles/{$article->slug}");

        $response->assertOk();
        $response->assertSee("property=\"og:title\" data-inertia=\"og:title\" content=\"{$article->title}\"", false);
        $response->assertSee('content="Ringkasan singkat artikel ini."', false);
        $response->assertSee('property="og:type" data-inertia="og:type" content="article"', false);
    }

    public function test_courses_index_and_articles_index_have_their_own_descriptions(): void
    {
        $courseResponse = $this->get('/courses');
        $courseResponse->assertSee('content="Jelajahi semua course coding', false);

        $articleResponse = $this->get('/articles');
        $articleResponse->assertSee('content="Kumpulan artikel, tips, dan tutorial singkat', false);
    }

    public function test_google_site_verification_tag_is_absent_by_default(): void
    {
        $response = $this->get('/');

        $response->assertDontSee('name="google-site-verification"', false);
    }

    public function test_google_site_verification_tag_is_rendered_when_configured(): void
    {
        config(['services.google.site_verification' => 'test-verification-code']);

        $response = $this->get('/');

        $response->assertSee('name="google-site-verification" content="test-verification-code"', false);
    }

    public function test_seo_meta_does_not_leak_between_requests(): void
    {
        $course = Course::factory()->create([
            'is_published' => true,
            'title' => 'Kursus Unik Untuk Tes Kebocoran Meta',
        ]);

        $this->get("/courses/{$course->slug}");
        $response = $this->get('/');

        $response->assertSee('property="og:title" data-inertia="og:title" content="Platform Belajar Coding"', false);
        $response->assertDontSee('property="og:title" data-inertia="og:title" content="Kursus Unik Untuk Tes Kebocoran Meta"', false);
    }
}
