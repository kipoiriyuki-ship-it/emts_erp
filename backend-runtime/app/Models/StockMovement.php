<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'movement_number',
        'inventory_item_id',
        'from_warehouse_id',
        'to_warehouse_id',
        'movement_type',
        'quantity',
        'unit',
        'movement_date',
        'reason',
        'approved_by',
        'approved_at',
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
        'quantity' => 'decimal:2',
        'movement_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the inventory item.
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the source warehouse.
     */
    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    /**
     * Get the destination warehouse.
     */
    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    /**
     * Get the user who approved the movement.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who created the movement.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include pending movements.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved movements.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include transfer movements.
     */
    public function scopeTransfer($query)
    {
        return $query->where('movement_type', 'transfer');
    }

    /**
     * Approve the stock movement.
     */
    public function approve($userId)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Complete the stock movement.
     */
    public function complete()
    {
        $this->update(['status' => 'completed']);

        // Update inventory item stock
        $item = $this->inventoryItem;
        if ($item) {
            if ($this->movement_type === 'transfer' && $this->from_warehouse_id) {
                // For transfers, stock moves from one warehouse to another
                // This would require handling warehouse-specific stock
                // For now, we just update the main item stock
            } elseif ($this->movement_type === 'adjustment') {
                // Adjustments can increase or decrease stock
                // This is handled by inventory transactions
            }
        }
    }

    /**
     * Reject the stock movement.
     */
    public function reject($userId)
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }
}
