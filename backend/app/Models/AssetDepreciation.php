<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetDepreciation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fixed_asset_id',
        'depreciation_date',
        'depreciation_amount',
        'accumulated_depreciation',
        'net_book_value',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'depreciation_amount' => 'decimal:2',
        'accumulated_depreciation' => 'decimal:2',
        'net_book_value' => 'decimal:2',
        'depreciation_date' => 'date',
    ];

    /**
     * Get the fixed asset.
     */
    public function fixedAsset()
    {
        return $this->belongsTo(FixedAsset::class);
    }

    /**
     * Get the user who created the depreciation record.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Boot method to update asset after depreciation is created.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($depreciation) {
            $asset = $depreciation->fixedAsset;
            if ($asset) {
                $asset->update([
                    'accumulated_depreciation' => $depreciation->accumulated_depreciation,
                    'net_book_value' => $depreciation->net_book_value,
                ]);
            }
        });
    }
}
