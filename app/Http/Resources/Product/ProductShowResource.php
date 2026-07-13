<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type->value,
            'thumbnail' => $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null,
            'price' => $this->price,
            'price_strikethrough' => $this->price_strikethrough,
            'is_published' => $this->is_published,
            'is_favourite' => $this->is_favourite,
            'course_ids' => $this->whenLoaded('courses', fn () => $this->courses->pluck('id')->toArray()),
        ];
    }
}
