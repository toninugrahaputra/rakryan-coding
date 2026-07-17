<?php

namespace App\Actions\Technology;

use App\Models\Technology;
use Illuminate\Http\UploadedFile;

class CreateTechnology
{
    public function handle(array $data): Technology
    {
        return Technology::create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'logo' => $this->storeLogo($data['logo'] ?? null),
        ]);
    }

    private function storeLogo(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('technologies/logos', 'public');
        }

        return null;
    }
}
