<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transaction_number',
        'inventory_item_id',
        'warehouse_id',
        'transaction_type',
        'quantity',
        'unit',
        'unit_cost',
        'total_cost',
        'transaction_date',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    /**
     * Get the inventory item.
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the warehouse.
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Get the user who created the transaction.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include incoming transactions.
     */
    public function scopeIn($query)
    {
        return $query->where('transaction_type', 'in');
    }

    /**
     * Scope a query to only include outgoing transactions.
     */
    public function scopeOut($query)
    {
        return $query->where('transaction_type', 'out');
    }

    /**
     * Scope a query to only include transfer transactions.
     */
    public function scopeTransfer($query)
    {
        return $query->where('transaction_type', 'transfer');
    }

    /**
     * Scope a query to only include adjustment transactions.
     */
    public function scopeAdjustment($query)
    {
        return $query->where('transaction_type', 'adjustment');
    }

    /**
     * Boot method to update inventory item stock on transaction.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($transaction) {
            $item = $transaction->inventoryItem;
            if ($item) {
                if ($transaction->transaction_type === 'in' || $transaction->transaction_type === 'adjustment') {
                    $item->current_stock += $transaction->quantity;
                } elseif ($transaction->transaction_type === 'out') {
                    $item->current_stock -= $transaction->quantity;
                }
                $item->save();
            }
        });
    }
}
