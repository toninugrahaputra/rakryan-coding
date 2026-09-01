<?php

namespace App\Http\Resources\ProductGuide;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductGuideShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'order' => $this->order,
            'is_published' => $this->is_published,
        ];
    }
}
