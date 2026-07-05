<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'item_code',
        'name',
        'description',
        'category_id',
        'unit_id',
        'sku',
        'barcode',
        'cost_price',
        'selling_price',
        'reorder_level',
        'reorder_quantity',
        'current_stock',
        'warehouse_id',
        'location',
        'item_type',
        'notes',
        'status',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'reorder_level' => 'decimal:2',
        'reorder_quantity' => 'decimal:2',
        'current_stock' => 'decimal:2',
    ];

    /**
     * Get the inventory category.
     */
    public function category()
    {
        return $this->belongsTo(InventoryCategory::class);
    }

    /**
     * Get the unit.
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the warehouse.
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Get the inventory transactions.
     */
    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Get the stock movements.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get the purchase order items.
     */
    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    /**
     * Get the sales order items.
     */
    public function salesOrderItems()
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    /**
     * Get the user who created the item.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active items.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include items below reorder level.
     */
    public function scopeBelowReorderLevel($query)
    {
        return $query->whereColumn('current_stock', '<=', 'reorder_level');
    }

    /**
     * Check if item needs reordering.
     */
    public function needsReorder(): bool
    {
        return $this->current_stock <= $this->reorder_level;
    }
}
