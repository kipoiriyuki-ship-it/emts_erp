<?php

namespace App\Traits;

use App\Models\Approval;
use App\Models\User;

trait HasApprovals
{
    /**
     * Get the approvals for the model.
     */
    public function approvals()
    {
        return $this->morphMany(Approval::class, 'approvable');
    }

    /**
     * Get the current approval.
     */
    public function currentApproval()
    {
        return $this->approvals()->where('status', 'pending')->first();
    }

    /**
     * Synchronize approval record and history.
     */
    protected function syncApprovalRecord(string $status, string $action, int $actorId, ?string $notes = null)
    {
        $approval = $this->approvals()->latest()->first();

        if (!$approval) {
            return null;
        }

        $approval->update([
            'status' => $status,
            'action_at' => now(),
            'notes' => $notes,
        ]);

        $approval->histories()->create([
            'action' => $action,
            'actor_id' => $actorId,
            'notes' => $notes,
        ]);

        return $approval;
    }

    /**
     * Create an approval request.
     */
    public function createApproval($approverId, $requiredLevel = 1)
    {
        $modelId = $this->getKey();

        if (empty($modelId)) {
            return null;
        }

        return Approval::create([
            'approvable_type' => static::class,
            'approvable_id' => $modelId,
            'approver_id' => $approverId,
            'status' => 'pending',
            'current_level' => 1,
            'required_level' => $requiredLevel,
        ]);
    }

    /**
     * Create an approval request for a director.
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
     * Approve the model.
     */
    public function approve($approverId, $notes = null)
    {
        $approval = $this->currentApproval();
        
        if (!$approval) {
            return false;
        }

        $approval->update([
            'status' => 'approved',
            'action_at' => now(),
            'notes' => $notes,
        ]);

        // Create approval history
        $approval->histories()->create([
            'action' => 'approved',
            'actor_id' => $approverId,
            'notes' => $notes,
        ]);

        return true;
    }

    /**
     * Reject the model.
     */
    public function reject($rejecterId, $notes = null)
    {
        $approval = $this->currentApproval();
        
        if (!$approval) {
            return false;
        }

        $approval->update([
            'status' => 'rejected',
            'action_at' => now(),
            'notes' => $notes,
        ]);

        // Create approval history
        $approval->histories()->create([
            'action' => 'rejected',
            'actor_id' => $rejecterId,
            'notes' => $notes,
        ]);

        return true;
    }

    /**
     * Check if model is approved.
     */
    public function isApproved()
    {
        return $this->approvals()->where('status', 'approved')->exists();
    }

    /**
     * Check if model is rejected.
     */
    public function isRejected()
    {
        return $this->approvals()->where('status', 'rejected')->exists();
    }

    /**
     * Check if model is pending approval.
     */
    public function isPendingApproval()
    {
        return $this->approvals()->where('status', 'pending')->exists();
    }

    /**
     * Scope a query to only include approved models.
     */
    public function scopeApproved($query)
    {
        return $query->whereHas('approvals', function ($q) {
            $q->where('status', 'approved');
        });
    }

    /**
     * Scope a query to only include pending models.
     */
    public function scopePendingApproval($query)
    {
        return $query->whereHas('approvals', function ($q) {
            $q->where('status', 'pending');
        });
    }

    /**
     * Scope a query to only include rejected models.
     */
    public function scopeRejected($query)
    {
        return $query->whereHas('approvals', function ($q) {
            $q->where('status', 'rejected');
        });
    }
}
