<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_courses_index_excludes_draft_courses(): void
    {
        $published = Course::factory()->create(['title' => 'Published Course', 'is_published' => true]);
        $published->products()->attach(Product::factory()->published()->create());

        Course::factory()->create(['title' => 'Draft Course', 'is_published' => false]);

        $response = $this->get('/courses');

        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses.data', 1)
        );
    }

    public function test_public_courses_index_excludes_courses_without_a_published_product(): void
    {
        $withProduct = Course::factory()->create(['title' => 'Has Published Product', 'is_published' => true]);
        $withProduct->products()->attach(Product::factory()->published()->create());

        $withoutPublishedProduct = Course::factory()->create(['title' => 'Product Still Draft', 'is_published' => true]);
        $withoutPublishedProduct->products()->attach(Product::factory()->create(['is_published' => false]));

        Course::factory()->create(['title' => 'No Product', 'is_published' => true]);

        $response = $this->get('/courses');

        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses.data', 1)
            ->where('courses.data.0.title', 'Has Published Product')
        );
    }
}
