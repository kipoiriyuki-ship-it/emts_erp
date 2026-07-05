<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FixedAsset extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'asset_number',
        'name',
        'description',
        'category_id',
        'location_id',
        'purchase_date',
        'purchase_cost',
        'salvage_value',
        'useful_life_years',
        'depreciation_method',
        'accumulated_depreciation',
        'net_book_value',
        'status',
        'disposal_date',
        'disposal_value',
        'disposal_notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'purchase_cost' => 'decimal:2',
        'salvage_value' => 'decimal:2',
        'accumulated_depreciation' => 'decimal:2',
        'net_book_value' => 'decimal:2',
        'disposal_value' => 'decimal:2',
        'purchase_date' => 'date',
        'disposal_date' => 'date',
    ];

    /**
     * Get the asset category.
     */
    public function category()
    {
        return $this->belongsTo(AssetCategory::class);
    }

    /**
     * Get the location.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the depreciation records.
     */
    public function depreciations()
    {
        return $this->hasMany(AssetDepreciation::class);
    }

    /**
     * Get the user who created the asset.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active assets.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Calculate annual depreciation (straight line method).
     */
    public function calculateAnnualDepreciation()
    {
        return ($this->purchase_cost - $this->salvage_value) / $this->useful_life_years;
    }

    /**
     * Update net book value.
     */
    public function updateNetBookValue()
    {
        $this->net_book_value = $this->purchase_cost - $this->accumulated_depreciation;
        $this->save();
    }

    /**
     * Dispose the asset.
     */
    public function dispose($disposalValue, $notes = null)
    {
        $this->update([
            'status' => 'disposed',
            'disposal_date' => now(),
            'disposal_value' => $disposalValue,
            'disposal_notes' => $notes,
        ]);
    }

    /**
     * Sell the asset.
     */
    public function sell($saleValue, $notes = null)
    {
        $this->update([
            'status' => 'sold',
            'disposal_date' => now(),
            'disposal_value' => $saleValue,
            'disposal_notes' => $notes,
        ]);
    }
}
