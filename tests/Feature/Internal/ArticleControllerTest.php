<?php

namespace Tests\Feature\Internal;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ArticleControllerTest extends TestCase
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

    public function test_admin_can_view_articles_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/articles');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/articles/index'));
    }

    public function test_non_admin_cannot_view_articles(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/articles');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/articles/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/articles/create'));
    }

    public function test_admin_can_create_article(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/articles', [
            'title' => 'Cara Menangani Error',
            'slug' => 'cara-menangani-error',
            'excerpt' => 'Tips singkat menangani error.',
            'content' => ['time' => 1, 'blocks' => [], 'version' => '2.29.0'],
            'is_published' => true,
        ]);

        $response->assertRedirect('/internal/articles');
        $this->assertDatabaseHas('articles', ['slug' => 'cara-menangani-error', 'is_published' => true]);
    }

    public function test_create_requires_unique_slug(): void
    {
        Article::factory()->create(['slug' => 'existing-slug']);

        $response = $this->actingAs($this->admin)->post('/internal/articles', [
            'title' => 'Duplicate',
            'slug' => 'existing-slug',
        ]);

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_admin_can_view_edit_form(): void
    {
        $article = Article::factory()->create();

        $response = $this->actingAs($this->admin)->get("/internal/articles/{$article->slug}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/articles/edit'));
    }

    public function test_admin_can_update_article(): void
    {
        $article = Article::factory()->create(['title' => 'Old Title', 'slug' => 'old-title']);

        $response = $this->actingAs($this->admin)->put("/internal/articles/{$article->slug}", [
            'title' => 'New Title',
            'slug' => 'new-title',
            'excerpt' => 'Ringkasan baru.',
            'is_published' => false,
        ]);

        $response->assertRedirect('/internal/articles');
        $this->assertDatabaseHas('articles', ['id' => $article->id, 'title' => 'New Title', 'is_published' => false]);
    }

    public function test_admin_can_delete_article(): void
    {
        $article = Article::factory()->create();

        $response = $this->actingAs($this->admin)->delete("/internal/articles/{$article->slug}");

        $response->assertRedirect('/internal/articles');
        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }

    public function test_public_can_view_published_article(): void
    {
        $article = Article::factory()->create(['is_published' => true]);

        $response = $this->get("/articles/{$article->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('articles/show'));
    }

    public function test_public_cannot_view_unpublished_article(): void
    {
        $article = Article::factory()->create(['is_published' => false]);

        $response = $this->get("/articles/{$article->slug}");

        $response->assertStatus(404);
    }
}
