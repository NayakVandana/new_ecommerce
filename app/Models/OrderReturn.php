<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderReturn extends Model
{
    protected $table = 'order_returns';

    protected $fillable = [
        'order_id',
        'user_id',
        'return_number',
        'status',
        'reason',
        'requested_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class, 'order_return_id');
    }
}
