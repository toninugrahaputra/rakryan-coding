<?php

namespace App\Http\Requests\Internal;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
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
        return [
            'channel_group' => ['required', 'string', Rule::in(['Transfer', 'Virtual Account', 'QRIS', 'E Wallet'])],
            'channel_name' => ['nullable', 'string', 'max:100'],
            'payment_fee' => ['required', 'integer', 'min:0'],
            'total_amount' => ['required', 'integer', 'min:0'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'payment_code' => ['nullable', 'string', 'max:100'],
            'payment_metadata' => ['nullable', 'array'],
            'payment_metadata.sender_name' => ['nullable', 'string', 'max:100'],
            'payment_metadata.sender_account' => ['nullable', 'string', 'max:50'],
            'payment_metadata.sender_phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
