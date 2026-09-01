<?php

namespace App\Http\Requests\Internal;

use App\Actions\Product\GetProductBySlug;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductGuideRequest extends FormRequest
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
        $guideSlug = $this->route('guide');

        $product = app(GetProductBySlug::class)->handle($productSlug);

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255',
                Rule::unique('product_guides', 'slug')
                    ->where('product_id', $product->id)
                    ->ignore($guideSlug, 'slug'),
            ],
            'content' => ['nullable', 'array'],
            'is_published' => ['boolean'],
            'deleted_images' => ['nullable', 'array'],
            'deleted_images.*' => ['nullable', 'string'],
        ];
    }
}
