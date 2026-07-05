<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'approver_id',
        'status',
        'current_level',
        'required_level',
        'action_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'current_level' => 'integer',
        'required_level' => 'integer',
        'action_at' => 'datetime',
    ];

    /**
     * Get the user who is the approver.
     */
    public function approver()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent approvable model.
     */
    public function approvable()
    {
        return $this->morphTo();
    }

    /**
     * Get the approval histories for this approval.
     */
    public function histories()
    {
        return $this->hasMany(ApprovalHistory::class);
    }

    /**
     * Scope a query to only include pending approvals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved approvals.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected approvals.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to filter by approver.
     */
    public function scopeByApprover($query, $approverId)
    {
        return $query->where('approver_id', $approverId);
    }

    /**
     * Check if approval is at the current level.
     */
    public function isAtCurrentLevel()
    {
        return $this->current_level === $this->required_level;
    }

    /**
     * Check if approval is fully approved.
     */
    public function isFullyApproved()
    {
        return $this->status === 'approved' && $this->current_level >= $this->required_level;
    }
}
