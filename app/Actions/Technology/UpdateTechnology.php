<?php

namespace App\Actions\Technology;

use App\Models\Technology;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateTechnology
{
    public function handle(Technology $technology, array $data): void
    {
        $fields = [
            'name' => $data['name'],
            'slug' => $data['slug'],
        ];

        if (array_key_exists('logo', $data)) {
            $fields['logo'] = $this->replaceLogo($technology, $data['logo']);
        }

        $technology->update($fields);
    }

    private function replaceLogo(Technology $technology, mixed $file): ?string
    {
        if ($technology->logo) {
            Storage::disk('public')->delete($technology->logo);
        }

        if ($file instanceof UploadedFile) {
            return $file->store('technologies/logos', 'public');
        }

        return null;
    }
}
