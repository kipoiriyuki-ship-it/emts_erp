<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'account_id',
        'journal_item_id',
        'date',
        'debit',
        'credit',
        'description',
        'reference_type',
        'reference_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /**
     * Get the chart of account for the ledger entry.
     */
    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    /**
     * Get the journal item for the ledger entry.
     */
    public function journalItem()
    {
        return $this->belongsTo(JournalItem::class);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by account.
     */
    public function scopeByAccount($query, $accountId)
    {
        return $query->where('account_id', $accountId);
    }

    /**
     * Scope a query to only include debit entries.
     */
    public function scopeDebit($query)
    {
        return $query->where('debit', '>', 0);
    }

    /**
     * Scope a query to only include credit entries.
     */
    public function scopeCredit($query)
    {
        return $query->where('credit', '>', 0);
    }
}
