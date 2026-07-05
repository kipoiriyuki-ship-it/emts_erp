<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChartOfAccount extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'account_number',
        'account_name',
        'account_type',
        'parent_id',
        'level',
        'balance_type',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'level' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the parent account.
     */
    public function parent()
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_id');
    }

    /**
     * Get the child accounts.
     */
    public function children()
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_id');
    }

    /**
     * Get the journal items for the account.
     */
    public function journalItems()
    {
        return $this->hasMany(JournalItem::class);
    }

    /**
     * Get the ledger entries for the account.
     */
    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    /**
     * Get the account balances for the account.
     */
    public function balances()
    {
        return $this->hasMany(AccountBalance::class);
    }

    /**
     * Scope a query to only include active accounts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by account type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('account_type', $type);
    }

    /**
     * Scope a query to filter by balance type.
     */
    public function scopeByBalanceType($query, $balanceType)
    {
        return $query->where('balance_type', $balanceType);
    }

    /**
     * Scope a query to get root accounts (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope a query to filter by level.
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Get the current balance for a specific period.
     */
    public function getBalanceForPeriod($period)
    {
        return $this->balances()->where('period', $period)->first();
    }

    /**
     * Check if account is a debit balance account.
     */
    public function isDebitBalance()
    {
        return $this->balance_type === 'debit';
    }

    /**
     * Check if account is a credit balance account.
     */
    public function isCreditBalance()
    {
        return $this->balance_type === 'credit';
    }

    /**
     * Get the account type label.
     */
    public function getAccountTypeLabelAttribute()
    {
        return ucfirst($this->account_type);
    }
}
