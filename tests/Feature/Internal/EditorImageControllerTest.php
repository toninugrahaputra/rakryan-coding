<?php

namespace Tests\Feature\Internal;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EditorImageControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_upload_editor_image(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin)->post('/internal/editor-image/articles/intro-artikel', [
            'image' => UploadedFile::fake()->image('screenshot.png')->size(1024),
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['success', 'file' => ['url']]);
        Storage::disk('public')->assertExists(
            str_replace('/storage/', '', $response->json('file.url')),
        );
    }

    public function test_editor_image_upload_rejects_file_over_2mb(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin)->post('/internal/editor-image/articles/intro-artikel', [
            'image' => UploadedFile::fake()->image('too-big.png')->size(3000),
        ]);

        $response->assertSessionHasErrors('image');
    }
}
