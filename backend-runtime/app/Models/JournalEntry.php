<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class JournalEntry extends Model
{
    use HasFactory, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'journal_number',
        'date',
        'description',
        'period',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user who created the journal entry.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved the journal entry.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the items for the journal entry.
     */
    public function items()
    {
        return $this->hasMany(JournalItem::class, 'journal_id');
    }

    /**
     * Scope a query to only include posted journals.
     */
    public function scopePosted($query)
    {
        return $query->where('status', 'posted');
    }

    /**
     * Scope a query to only include draft journals.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope a query to filter by period.
     */
    public function scopeByPeriod($query, $period)
    {
        return $query->where('period', $period);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Check if journal is balanced.
     */
    public function isBalanced()
    {
        $totalDebit = (float) $this->items()->sum('debit');
        $totalCredit = (float) $this->items()->sum('credit');

        return abs($totalDebit - $totalCredit) < 0.01 && $totalDebit > 0;
    }

    /**
     * Get total debit.
     */
    public function getTotalDebitAttribute()
    {
        return $this->items()->sum('debit');
    }

    /**
     * Get total credit.
     */
    public function getTotalCreditAttribute()
    {
        return $this->items()->sum('credit');
    }

    /**
     * Post the journal entry.
     */
    public function post($approverId)
    {
        if (!$this->isBalanced()) {
            throw new \Exception('Journal entry is not balanced');
        }

        $this->update([
            'status' => 'posted',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);

        // Create ledger entries
        foreach ($this->items as $item) {
            LedgerEntry::create([
                'account_id' => $item->account_id,
                'journal_item_id' => $item->id,
                'date' => $this->date,
                'debit' => $item->debit,
                'credit' => $item->credit,
                'description' => $item->description,
            ]);
        }

        // Update account balances
        try {
            $journalService = new \App\Services\JournalService();
            $journalService->updateAccountBalances($this);
        } catch (\Exception $e) {
            \Log::error('Failed to update account balances: ' . $e->getMessage());
        }
    }

    /**
     * Cancel the journal entry.
     */
    public function cancel()
    {
        if ($this->status === 'posted') {
            // Delete associated ledger entries
            LedgerEntry::whereIn('journal_item_id', $this->items->pluck('id'))->delete();
        }

        $this->update(['status' => 'cancelled']);
    }
}
