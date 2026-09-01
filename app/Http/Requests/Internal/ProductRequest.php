<?php

namespace App\Http\Requests\Internal;

use App\Actions\Course\ExtractYoutubeVideoId;
use App\Enums\ProductPlatform;
use App\Enums\ProductType;
use App\Models\ProductGallery;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProductRequest extends FormRequest
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
        $productSlug = $this->route('product');
        $isSourceCode = $this->input('type') === ProductType::SourceCode->value;
        $requiresSourceCodeFile = $isSourceCode && $this->isMethod('post');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productSlug, 'slug')],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::enum(ProductType::class)],
            'platform' => [$isSourceCode ? 'required' : 'nullable', Rule::enum(ProductPlatform::class)],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
            'price' => ['required', 'integer', 'min:0'],
            'price_strikethrough' => ['nullable', 'integer', 'min:0', 'gt:price'],
            'is_published' => ['boolean'],
            'is_favourite' => ['boolean'],
            'course_ids' => ['array'],
            'course_ids.*' => ['integer', Rule::exists('courses', 'id')->whereNull('deleted_at')],
            'bonus_course_ids' => ['nullable', 'array'],
            'bonus_course_ids.*' => ['integer', Rule::exists('courses', 'id')->whereNull('deleted_at')],
            'source_code_file' => [$requiresSourceCodeFile ? 'required' : 'nullable', 'file', 'mimes:zip', 'max:51200'],
            'gallery' => ['nullable', 'array', 'max:'.ProductGallery::MAX_PER_PRODUCT],
            'gallery.*' => ['image', 'mimes:jpeg,png,webp', 'max:8192'],
            'remove_gallery_ids' => ['nullable', 'array'],
            'remove_gallery_ids.*' => ['integer'],
            'gallery_youtube_urls' => ['nullable', 'array'],
            'gallery_youtube_urls.*' => [
                'string',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! app(ExtractYoutubeVideoId::class)->handle($value)) {
                        $fail('Link YouTube tidak valid.');
                    }
                },
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $type = $this->input('type');
            $courseIds = $this->input('course_ids', []);
            $bonusCourseIds = $this->input('bonus_course_ids', []);

            if ($type !== ProductType::SourceCode->value && count($courseIds) < 1) {
                $v->errors()->add('course_ids', 'Pilih minimal 1 course.');
            }

            if ($type === ProductType::Single->value && count($courseIds) > 1) {
                $v->errors()->add('course_ids', 'Produk single hanya boleh memiliki 1 course.');
            }

            if (array_intersect($courseIds, $bonusCourseIds) !== []) {
                $v->errors()->add('bonus_course_ids', 'Course yang sama tidak boleh dipilih sebagai course utama dan bonus sekaligus.');
            }
        });
    }
}
