<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasApprovals;
use App\Traits\Auditable;

class OperationalExpense extends Model
{
    use HasFactory, HasApprovals, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'user_id',
        'date',
        'amount',
        'description',
        'receipt_url',
        'approved_by',
        'approved_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the category for the expense.
     */
    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    /**
     * Get the user who created the expense.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who approved the expense.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include pending expenses.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved expenses.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected expenses.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Approve the expense.
     */
    public function approve($approverId, $notes = null)
    {
        if (!$this->approvals()->exists()) {
            $this->createApprovalForDirector();
        }

        $this->syncApprovalRecord('approved', 'approved', $approverId, $notes);

        $this->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);

        // Auto-create journal entry
        try {
            $journalService = new \App\Services\JournalService();
            $journalService->createForOperationalExpense($this, $approverId);
        } catch (\Exception $e) {
            // Log error but don't fail approval
            \Log::error('Failed to create journal for operational expense: ' . $e->getMessage());
        }
    }

    /**
     * Reject the expense.
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
