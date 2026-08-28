<?php

namespace Tests\Feature\Internal;

use App\Actions\Notification\NotifyAllUsers;
use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
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

    public function test_creating_published_article_notifies_all_users(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/articles', [
            'title' => 'Cara Menangani Error',
            'slug' => 'cara-menangani-error',
            'excerpt' => 'Tips singkat menangani error.',
            'content' => ['time' => 1, 'blocks' => [], 'version' => '2.29.0'],
            'is_published' => true,
        ]);

        $response->assertRedirect('/internal/articles');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'title' => 'Artikel Baru! 📰',
            'url' => route('articles.show', 'cara-menangani-error'),
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'title' => 'Artikel Baru! 📰',
            'url' => route('articles.show', 'cara-menangani-error'),
        ]);
    }

    public function test_creating_unpublished_article_does_not_notify(): void
    {
        $this->actingAs($this->admin)->post('/internal/articles', [
            'title' => 'Cara Menangani Error',
            'slug' => 'cara-menangani-error',
            'excerpt' => 'Tips singkat menangani error.',
            'is_published' => false,
        ]);

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_publishing_article_succeeds_even_if_notification_fails(): void
    {
        $this->mock(NotifyAllUsers::class, function ($mock) {
            $mock->shouldReceive('handle')->andThrow(new RuntimeException('notification service down'));
        });

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

    public function test_admin_can_generate_article_content_with_ai(): void
    {
        config(['services.openrouter.api_key' => 'test-key']);

        Http::fake([
            'openrouter.ai/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'role' => 'assistant',
                            'content' => json_encode([
                                'excerpt' => 'Ringkasan singkat.',
                                'blocks' => [
                                    ['type' => 'header', 'data' => ['text' => 'Judul', 'level' => 2]],
                                    ['type' => 'paragraph', 'data' => ['text' => 'Isi paragraf.']],
                                ],
                            ]),
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/internal/articles/generate-ai', ['title' => 'Cara Belajar Laravel']);

        $response->assertStatus(200);
        $response->assertJson(['excerpt' => 'Ringkasan singkat.']);
        $response->assertJsonCount(2, 'content.blocks');

        Http::assertSent(fn ($request) => $request->url() === 'https://openrouter.ai/api/v1/chat/completions'
            && $request['model'] === 'nvidia/nemotron-3-ultra-550b-a55b:free');
    }

    public function test_non_admin_cannot_generate_article_content_with_ai(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/internal/articles/generate-ai', ['title' => 'Cara Belajar Laravel']);

        $response->assertStatus(403);
    }

    public function test_generate_ai_requires_title(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/internal/articles/generate-ai', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    public function test_generate_ai_returns_error_when_api_key_missing(): void
    {
        config(['services.openrouter.api_key' => null]);

        $response = $this->actingAs($this->admin)
            ->postJson('/internal/articles/generate-ai', ['title' => 'Cara Belajar Laravel']);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message']);
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

    public function test_admin_can_update_article_with_deleted_image(): void
    {
        Storage::fake('public');

        $article = Article::factory()->create(['slug' => 'old-title']);
        $imagePath = "articles/{$article->slug}/removed.png";
        Storage::disk('public')->put($imagePath, 'fake-image-content');

        $response = $this->actingAs($this->admin)->put("/internal/articles/{$article->slug}", [
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => $article->excerpt,
            'is_published' => $article->is_published,
            'deleted_images' => ["/storage/{$imagePath}"],
        ]);

        $response->assertRedirect('/internal/articles');
        $response->assertSessionDoesntHaveErrors();
        Storage::disk('public')->assertMissing($imagePath);
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
