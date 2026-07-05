<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LargeCashItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'large_cash_request_id',
        'description',
        'quantity',
        'unit_price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function largeCashRequest()
    {
        return $this->belongsTo(LargeCashRequest::class);
    }
}
