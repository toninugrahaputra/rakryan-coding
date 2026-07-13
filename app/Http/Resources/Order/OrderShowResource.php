<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OrderShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status->value,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'product' => $this->whenLoaded('product', fn () => $this->product ? [
                'id' => $this->product->id,
                'title' => $this->product->title,
                'slug' => $this->product->slug,
                'thumbnail' => $this->product->thumbnail
                    ? Storage::disk('public')->url($this->product->thumbnail)
                    : null,
            ] : null),
            'items' => $this->items,
            'provider' => $this->provider,
            'payment_reference' => $this->payment_reference,
            'channel_group' => $this->channel_group,
            'channel_code' => $this->channel_code,
            'channel_name' => $this->channel_name,
            'payment_fee' => $this->payment_fee,
            'payment_code' => $this->payment_code,
            'payment_url' => $this->payment_url,
            'payment_metadata' => $this->payment_metadata,
            'total_amount' => $this->total_amount,
            'net_amount' => $this->net_amount,
            'valid_until' => $this->valid_until?->format('d-m-Y H:i'),
            'paid_at' => $this->paid_at?->format('d-m-Y H:i'),
            'approved_by' => $this->whenLoaded('approvedBy', fn () => $this->approvedBy?->name),
            'created_at' => $this->created_at->format('d-m-Y H:i'),
        ];
    }
}
