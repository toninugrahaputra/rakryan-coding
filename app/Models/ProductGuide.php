<?php

namespace App\Models;

use Database\Factories\ProductGuideFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'title', 'slug', 'content', 'order', 'is_published'])]
class ProductGuide extends Model
{
    /** @use HasFactory<ProductGuideFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
