<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Traits\HasApprovals;
use App\Traits\Auditable;

class LargeCashRequest extends Model
{
    use HasFactory, HasApprovals, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'request_number',
        'project_id',
        'user_id',
        'type',
        'total_amount',
        'description',
        'status',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'evidence_image',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'project_id' => 'integer',
        'user_id' => 'integer',
        'reviewed_by' => 'integer',
        'approved_by' => 'integer',
        'rejected_by' => 'integer',
        'total_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the project for the request.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created the request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who reviewed the request.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the user who approved the request.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected the request.
     */
    public function rejecter()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Get the items for the request.
     */
    public function items()
    {
        return $this->hasMany(LargeCashItem::class);
    }

    /**
     * Get the payment records for the request.
     */
    public function payments()
    {
        return $this->hasMany(PaymentRecord::class);
    }

    /**
     * Scope a query to only include pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved requests.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected requests.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to only include draft requests.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope a query to only include submitted requests.
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to filter by project.
     */
    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    /**
     * Check if request can be submitted.
     */
    public function canBeSubmitted()
    {
        return in_array($this->status, ['draft', 'rejected'])
            && $this->items()->count() > 0
            && !$this->isPendingApproval();
    }

    /**
     * Submit the request.
     */
    public function submit()
    {
        if (!$this->canBeSubmitted()) {
            return false;
        }

        $this->update([
            'status' => 'pending',
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'approved_by' => null,
            'approved_at' => null,
            'rejected_by' => null,
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        $approval = $this->createApprovalForDirector();

        return $approval !== null;
    }

    /**
     * Create a director approval request.
     */
    public function createApprovalForDirector()
    {
        $director = User::whereHas('role', function ($query) {
            $query->where('code', 'DIRECTOR');
        })->first();

        if (!$director) {
            return null;
        }

        return $this->createApproval($director->id);
    }

    /**
     * Return the request for revision.
     */
    public function returnForRevision($reviewerId, $reason)
    {
        $this->syncApprovalRecord('rejected', 'returned', $reviewerId, $reason);

        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'rejected_by' => $reviewerId,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Check if request is approved.
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if request is pending.
     */
    public function isPending()
    {
        return in_array($this->status, ['submitted', 'pending']);
    }

    /**
     * Approve the request.
     */
    public function approve($approverId, $notes = null)
    {
        $this->syncApprovalRecord('approved', 'approved', $approverId, $notes);

        $this->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);

        // Auto-create journal entry
        try {
            $journalService = new \App\Services\JournalService();
            $journalService->createForLargeCashRequest($this, $approverId);
        } catch (\Exception $e) {
            // Log error but don't fail approval
            \Log::error('Failed to create journal for large cash request: ' . $e->getMessage());
        }
    }

    /**
     * Reject the request.
     */
    public function reject($rejecterId, $reason)
    {
        $this->syncApprovalRecord('rejected', 'rejected', $rejecterId, $reason);

        $this->update([
            'status' => 'rejected',
            'rejected_by' => $rejecterId,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }
}
