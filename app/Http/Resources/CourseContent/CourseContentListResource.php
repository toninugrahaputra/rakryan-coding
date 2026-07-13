<?php

namespace App\Http\Resources\CourseContent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseContentListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'order' => $this->order,
            'is_published' => $this->is_published,
        ];
    }
}
