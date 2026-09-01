<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateUserProfile
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'username' => $data['username'] ?? null,
            'phone' => $data['phone'] ?? null,
            'bio' => $data['bio'] ?? null,
            'school' => $data['school'] ?? null,
            'major' => $data['major'] ?? null,
            'grade' => $data['grade'] ?? null,
            'graduation_year' => $data['graduation_year'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'gender' => $data['gender'] ?? null,
            'city' => $data['city'] ?? null,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($data['avatar'] ?? null) {
            $user->avatar_url = $this->storeAvatar($user, $data['avatar']);
        } elseif ($data['remove_avatar'] ?? false) {
            $this->deleteStoredAvatar($user);
            $user->avatar_url = null;
        }

        $user->save();

        return $user;
    }

    private function storeAvatar(User $user, UploadedFile $file): string
    {
        $this->deleteStoredAvatar($user);

        return $file->store('avatars', 'public');
    }

    private function deleteStoredAvatar(User $user): void
    {
        // getRawOriginal supaya path relatif yang tersimpan di DB, bukan URL
        // penuh hasil accessor, yang dicek/dihapus dari disk.
        $existing = $user->getRawOriginal('avatar_url');

        if ($existing && Storage::disk('public')->exists($existing)) {
            Storage::disk('public')->delete($existing);
        }
    }
}
