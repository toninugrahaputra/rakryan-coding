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

    public function test_public_courses_index_excludes_bonus_only_courses(): void
    {
        $mainCourse = Course::factory()->create(['title' => 'Main Bundle Course', 'is_published' => true]);
        $bonusCourse = Course::factory()->create(['title' => 'Bonus Companion Course', 'is_published' => true]);

        $product = Product::factory()->published()->create();
        $product->courses()->attach($mainCourse->id, ['is_bonus' => false]);
        $product->courses()->attach($bonusCourse->id, ['is_bonus' => true]);

        $response = $this->get('/courses');

        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses.data', 1)
            ->where('courses.data.0.title', 'Main Bundle Course')
        );
    }

    public function test_public_courses_index_can_be_sorted_by_price_ascending(): void
    {
        $expensive = Course::factory()->create(['title' => 'Expensive Course', 'is_published' => true]);
        $expensive->products()->attach(Product::factory()->published()->create(['price' => 300000]));

        $cheap = Course::factory()->create(['title' => 'Cheap Course', 'is_published' => true]);
        $cheap->products()->attach(Product::factory()->published()->create(['price' => 50000]));

        $free = Course::factory()->create(['title' => 'Free Course', 'is_published' => true]);
        $free->products()->attach(Product::factory()->published()->create(['price' => 0]));

        $response = $this->get('/courses?sort=price-asc');

        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses.data', 3)
            ->where('courses.data.0.title', 'Free Course')
            ->where('courses.data.1.title', 'Cheap Course')
            ->where('courses.data.2.title', 'Expensive Course')
        );
    }

    public function test_public_courses_index_can_be_sorted_by_price_descending(): void
    {
        $expensive = Course::factory()->create(['title' => 'Expensive Course', 'is_published' => true]);
        $expensive->products()->attach(Product::factory()->published()->create(['price' => 300000]));

        $cheap = Course::factory()->create(['title' => 'Cheap Course', 'is_published' => true]);
        $cheap->products()->attach(Product::factory()->published()->create(['price' => 50000]));

        $response = $this->get('/courses?sort=price-desc');

        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses.data', 2)
            ->where('courses.data.0.title', 'Expensive Course')
            ->where('courses.data.1.title', 'Cheap Course')
        );
    }
}
