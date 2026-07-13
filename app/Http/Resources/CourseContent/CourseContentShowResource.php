<?php

namespace App\Http\Resources\CourseContent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseContentShowResource extends JsonResource
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
