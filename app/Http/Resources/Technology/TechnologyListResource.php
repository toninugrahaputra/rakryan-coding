<?php

namespace App\Http\Resources\Technology;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TechnologyListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_url' => $this->logo ? Storage::disk('public')->url($this->logo) : null,
            'courses_count' => $this->when($this->courses_count !== null, $this->courses_count),
            'created_at' => $this->when($this->created_at !== null, fn () => $this->created_at->format('d-m-Y')),
        ];
    }
}
