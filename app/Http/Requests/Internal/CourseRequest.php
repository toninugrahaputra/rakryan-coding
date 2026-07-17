<?php

namespace App\Http\Requests\Internal;

use App\Models\CourseGallery;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $courseSlug = $this->route('course');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($courseSlug, 'slug')],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:8192'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_published' => ['boolean'],
            'gallery' => ['nullable', 'array', 'max:'.CourseGallery::MAX_PER_COURSE],
            'gallery.*' => ['image', 'mimes:jpeg,png,webp', 'max:8192'],
            'remove_gallery_ids' => ['nullable', 'array'],
            'remove_gallery_ids.*' => ['integer'],
            'technology_ids' => ['nullable', 'array'],
            'technology_ids.*' => ['integer', 'exists:technologies,id'],
        ];
    }
}
