<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_number',
        'name',
        'description',
        'department_id',
        'project_id',
        'account_id',
        'start_date',
        'end_date',
        'total_budget',
        'actual_amount',
        'remaining_amount',
        'status',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_budget' => 'decimal:2',
        'actual_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the department.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the project.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the chart of account.
     */
    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    /**
     * Get the budget details.
     */
    public function details()
    {
        return $this->hasMany(BudgetDetail::class);
    }

    /**
     * Get the user who approved the budget.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who created the budget.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active budgets.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include budgets for a specific period.
     */
    public function scopePeriod($query, $startDate, $endDate)
    {
        return $query->where('start_date', '>=', $startDate)
            ->where('end_date', '<=', $endDate);
    }

    /**
     * Calculate the remaining amount.
     */
    public function calculateRemaining()
    {
        $this->remaining_amount = $this->total_budget - $this->actual_amount;
        $this->save();
    }

    /**
     * Approve the budget.
     */
    public function approve($userId)
    {
        $this->update([
            'status' => 'active',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Cancel the budget.
     */
    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }
}
