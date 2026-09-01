<?php

namespace App\Models;

use Database\Factories\ProductGalleryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'type', 'path', 'youtube_id', 'order'])]
class ProductGallery extends Model
{
    /** @use HasFactory<ProductGalleryFactory> */
    use HasFactory;

    public const MAX_PER_PRODUCT = 4;

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
