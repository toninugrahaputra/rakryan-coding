<?php

namespace App\Http\Requests\Internal;

use App\Actions\Course\GetCourseBySlug;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseContentRequest extends FormRequest
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
        $contentSlug = $this->route('content');

        $course = app(GetCourseBySlug::class)->handle($courseSlug);

        return [
            'section_name' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255',
                Rule::unique('course_contents', 'slug')
                    ->where('course_id', $course->id)
                    ->ignore($contentSlug, 'slug'),
            ],
            'content' => ['nullable', 'array'],
            'sub_topics' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'deleted_images' => ['nullable', 'array'],
            'deleted_images.*' => ['nullable', 'string', 'url'],
        ];
    }
}
