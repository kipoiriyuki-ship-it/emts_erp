<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPolicy extends Model
{
    use HasFactory;

    protected $table = 'financial_policies';

    protected $fillable = [
        'petty_cash_approval_limit',
        'large_cash_always_require_approval',
        'maximum_petty_cash_per_day',
        'maximum_petty_cash_per_employee',
        'maximum_cash_request_per_project',
    ];

    protected $casts = [
        'petty_cash_approval_limit' => 'decimal:2',
        'large_cash_always_require_approval' => 'boolean',
        'maximum_petty_cash_per_day' => 'decimal:2',
        'maximum_petty_cash_per_employee' => 'decimal:2',
        'maximum_cash_request_per_project' => 'decimal:2',
    ];
}
