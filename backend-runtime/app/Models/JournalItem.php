<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'journal_id',
        'account_id',
        'debit',
        'credit',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /**
     * Get the journal entry that owns the item.
     */
    public function journal()
    {
        return $this->belongsTo(JournalEntry::class, 'journal_id');
    }

    /**
     * Get the chart of account for the item.
     */
    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    /**
     * Get the ledger entries for this item.
     */
    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    /**
     * Scope a query to only include debit items.
     */
    public function scopeDebit($query)
    {
        return $query->where('debit', '>', 0);
    }

    /**
     * Scope a query to only include credit items.
     */
    public function scopeCredit($query)
    {
        return $query->where('credit', '>', 0);
    }
}
