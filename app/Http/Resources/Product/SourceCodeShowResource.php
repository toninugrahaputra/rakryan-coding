<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class SourceCodeShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null,
            'price' => $this->price,
            'price_strikethrough' => $this->price_strikethrough,
            'gallery' => $this->whenLoaded('galleries', fn () => $this->galleries
                ->map(fn ($gallery) => [
                    'id' => $gallery->id,
                    'type' => $gallery->type,
                    'url' => $gallery->type === 'video'
                        ? "https://img.youtube.com/vi/{$gallery->youtube_id}/hqdefault.jpg"
                        : Storage::disk('public')->url($gallery->path),
                    'youtube_id' => $gallery->youtube_id,
                ])),
        ];
    }
}
