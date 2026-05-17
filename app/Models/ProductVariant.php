<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'barcode',
        'size',
        'color',
        'color_hex',
        'price',
        'compare_at_price',
        'list_price',
        'cost',
        'discount_percent',
        'commission_percent',
        'stock_quantity',
        'low_stock_threshold',
        'weight_kg',
        'is_default',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'list_price' => 'decimal:2',
            'cost' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'commission_percent' => 'decimal:2',
            'weight_kg' => 'decimal:3',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorefrontArray(): array
    {
        $presentation = \App\Support\VariantPricing::presentation(
            $this->cost !== null ? (float) $this->cost : null,
            $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            $this->list_price !== null ? (float) $this->list_price : null,
            (float) $this->price,
            $this->discount_percent !== null ? (float) $this->discount_percent : null,
            $this->commission_percent !== null ? (float) $this->commission_percent : null,
        );

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => $this->price,
            'compare_at_price' => $presentation['mrp'],
            'list_price' => $presentation['list_price'],
            'discount_percent' => $presentation['discount_percent'],
            'size' => $this->size,
            'color' => $this->color,
            'color_hex' => $this->color_hex,
            'stock_quantity' => $this->stock_quantity,
            'is_default' => $this->is_default,
            'is_active' => $this->is_active,
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'product_variant_attributes')
            ->withTimestamps();
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(ProductVideo::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
