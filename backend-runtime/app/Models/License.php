<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class License extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'license_code',
        'type',
        'license_type',
        'max_users',
        'max_projects',
        'modules_enabled',
        'device_limit',
        'valid_from',
        'valid_until',
        'is_active',
        'is_used',
        'used_by_user_id',
        'used_at',
        'issued_at',
        'activated_at',
        'generated_by',
        'used_by',
        'company_id',
        'status',
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'issued_at' => 'datetime',
        'activated_at' => 'datetime',
        'modules_enabled' => 'array',
    ];

    /**
     * Get the user that used this license.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Check if the license can be used for activation.
     */
    public function isActivationCandidate(): bool
    {
        if (!$this->is_active || $this->is_used || $this->status !== 'available') {
            return false;
        }

        return !$this->isExpired();
    }

    /**
     * Check if the license is currently usable for login.
     */
    public function isUsable(): bool
    {
        if (!$this->is_active || !$this->is_used || $this->status === 'expired') {
            return false;
        }

        return !$this->isExpired();
    }

    /**
     * Check if the license has already expired.
     */
    public function isExpired(): bool
    {
        return $this->valid_until && $this->valid_until->isPast();
    }

    /**
     * Generate a unique license code.
     */
    public static function generateCode(?string $type = null): string
    {
        $prefix = 'EMTS-' . strtoupper($type ?? 'GEN') . '-';

        do {
            $code = $prefix . strtoupper(Str::random(8));
        } while (self::where(function ($query) use ($code) {
            $query->where('license_code', $code)
                ->orWhere('code', $code);
        })->exists());

        return $code;
    }
}
