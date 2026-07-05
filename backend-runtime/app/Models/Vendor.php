<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'vendor_code',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'tax_id',
        'vendor_type',
        'contact_person',
        'contact_phone',
        'credit_limit',
        'payment_terms_days',
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
        'credit_limit' => 'decimal:2',
    ];

    /**
     * Get the vendor payments.
     */
    public function payments()
    {
        return $this->hasMany(VendorPayment::class);
    }

    /**
     * Get the purchase orders.
     */
    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    /**
     * Get the user who created the vendor.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active vendors.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include material vendors.
     */
    public function scopeMaterial($query)
    {
        return $query->where('vendor_type', 'material');
    }

    /**
     * Scope a query to only include service vendors.
     */
    public function scopeService($query)
    {
        return $query->where('vendor_type', 'service');
    }
}
