<?php

namespace App\Actions\User;

use App\Models\Product;
use App\Models\User;
use App\Models\UserSubscription;

class HasPurchasedProduct
{
    public function handle(?User $user, Product $product): bool
    {
        if (! $user) {
            return false;
        }

        return UserSubscription::query()
            ->where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();
    }
}
