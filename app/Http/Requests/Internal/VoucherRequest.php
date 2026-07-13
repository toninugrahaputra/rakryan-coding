<?php

namespace App\Http\Requests\Internal;

use App\Enums\VoucherType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class VoucherRequest extends FormRequest
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
        $voucherCode = $this->route('voucher');

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucherCode, 'code')],
            'name' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::enum(VoucherType::class)],
            'value' => ['required', 'integer', 'min:1'],
            'max_discount' => ['nullable', 'integer', 'min:0'],
            'min_purchase' => ['nullable', 'integer', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'applies_to_all_products' => ['boolean'],
            'product_ids' => ['array', 'required_if:applies_to_all_products,false'],
            'product_ids.*' => ['integer', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            if ($this->input('type') === VoucherType::Percentage->value && (int) $this->input('value') > 100) {
                $v->errors()->add('value', 'Diskon percentage tidak boleh lebih dari 100%.');
            }
        });
    }
}
