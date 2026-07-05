<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'pic',
        'phone',
        'email',
        'address',
        'website',
        'npwp',
        'logo',
        'license_id',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
