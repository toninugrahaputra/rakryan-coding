<?php

namespace App\Actions\Product;

use App\Enums\ProductPlatform;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class GetPublishedSourceCodeProducts
{
    public function handle(?int $limit = null, ?ProductPlatform $platform = null): Collection
    {
        $query = Product::where('type', ProductType::SourceCode)
            ->where('is_published', true)
            ->when($platform, fn ($q) => $q->where('platform', $platform))
            ->latest();

        if ($limit) {
            $query->take($limit);
        }

        return $query->get();
    }
}
