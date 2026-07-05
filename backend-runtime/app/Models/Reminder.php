<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'remind_at',
        'frequency',
        'is_completed',
        'completed_at',
        'related_type',
        'related_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'remind_at' => 'datetime',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user who owns the reminder.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related model for the reminder.
     */
    public function related()
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include pending reminders.
     */
    public function scopePending($query)
    {
        return $query->where('is_completed', false);
    }

    /**
     * Scope a query to only include completed reminders.
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by upcoming reminders.
     */
    public function scopeUpcoming($query, $days = 7)
    {
        return $query->where('remind_at', '<=', now()->addDays($days))
                     ->where('remind_at', '>=', now());
    }

    /**
     * Scope a query to filter by overdue reminders.
     */
    public function scopeOverdue($query)
    {
        return $query->where('remind_at', '<', now())
                     ->where('is_completed', false);
    }

    /**
     * Mark the reminder as completed.
     */
    public function markAsCompleted()
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the reminder as incomplete.
     */
    public function markAsIncomplete()
    {
        $this->update([
            'is_completed' => false,
            'completed_at' => null,
        ]);
    }
}
