<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetDetail extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_id',
        'account_id',
        'description',
        'planned_amount',
        'actual_amount',
        'variance',
        'variance_type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'planned_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
        'variance' => 'decimal:2',
    ];

    /**
     * Get the budget.
     */
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Get the chart of account.
     */
    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    /**
     * Calculate variance.
     */
    public function calculateVariance()
    {
        $this->variance = $this->planned_amount - $this->actual_amount;
        $this->variance_type = $this->variance >= 0 ? 'favorable' : 'unfavorable';
        $this->save();
    }
}
