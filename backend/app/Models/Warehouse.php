<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'warehouse_code',
        'name',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'contact_person',
        'contact_phone',
        'contact_email',
        'capacity',
        'status',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'decimal:2',
    ];

    /**
     * Get the inventory items in this warehouse.
     */
    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }

    /**
     * Get the inventory transactions for this warehouse.
     */
    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Get the stock movements for this warehouse.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get the user who created the warehouse.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active warehouses.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get total items count in warehouse.
     */
    public function getTotalItemsCount(): int
    {
        return $this->inventoryItems()->count();
    }

    /**
     * Get total stock value in warehouse.
     */
    public function getTotalStockValue(): float
    {
        return $this->inventoryItems()
            ->get()
            ->sum(function ($item) {
                return $item->current_stock * $item->cost_price;
            });
    }
}
