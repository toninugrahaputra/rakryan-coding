<?php

namespace App\Http\Requests\Internal;

use App\Enums\ProductType;
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

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productSlug, 'slug')],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::enum(ProductType::class)],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
            'price' => ['required', 'integer', 'min:0'],
            'price_strikethrough' => ['nullable', 'integer', 'min:0', 'gt:price'],
            'is_published' => ['boolean'],
            'is_favourite' => ['boolean'],
            'course_ids' => ['required', 'array', 'min:1'],
            'course_ids.*' => ['integer', Rule::exists('courses', 'id')->whereNull('deleted_at')],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $type = $this->input('type');
            $courseIds = $this->input('course_ids', []);

            if ($type === ProductType::Single->value && count($courseIds) > 1) {
                $v->errors()->add('course_ids', 'Produk single hanya boleh memiliki 1 course.');
            }
        });
    }
}
