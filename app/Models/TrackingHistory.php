<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrackingHistory extends Model
{
    protected $fillable = [
        'shipment_id',
        'status',
        'location',
        'description',
        'tracked_at',
    ];

    protected function casts(): array
    {
        return [
            'tracked_at' => 'datetime',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
