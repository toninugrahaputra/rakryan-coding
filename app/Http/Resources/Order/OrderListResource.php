<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderListResource extends JsonResource
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
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'title' => $this->product->title,
            ]),
            'channel_group' => $this->channel_group,
            'channel_name' => $this->channel_name,
            'total_amount' => $this->total_amount,
            'paid_at' => $this->paid_at?->format('d-m-Y H:i'),
            'created_at' => $this->created_at->format('d-m-Y'),
        ];
    }
}
