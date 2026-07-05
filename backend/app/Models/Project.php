<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Project extends Model
{
    use HasFactory, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_number',
        'name',
        'client_name',
        'location',
        'contract_value',
        'start_date',
        'end_date',
        'manager_id',
        'status',
        'progress',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contract_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'progress' => 'integer',
    ];

    /**
     * Get the manager of the project.
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the members of the project.
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks()
    {
        return $this->hasMany(ProjectTask::class);
    }

    /**
     * Get the progress records for the project.
     */
    public function progress()
    {
        return $this->hasMany(ProjectProgress::class)->orderBy('date', 'desc');
    }

    /**
     * Get the reports for the project.
     */
    public function reports()
    {
        return $this->hasMany(ProjectReport::class);
    }

    /**
     * Get the documents for the project.
     */
    public function documents()
    {
        return $this->hasMany(ProjectDoc::class);
    }

    /**
     * Get the milestones for the project.
     */
    public function milestones()
    {
        return $this->hasMany(ProjectMilestone::class);
    }

    /**
     * Get the large cash requests for the project.
     */
    public function largeCashRequests()
    {
        return $this->hasMany(LargeCashRequest::class);
    }

    /**
     * Get the meetings for the project.
     */
    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }

    /**
     * Scope a query to only include active projects.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['planning', 'running']);
    }

    /**
     * Scope a query to only include completed projects.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to filter by manager.
     */
    public function scopeByManager($query, $managerId)
    {
        return $query->where('manager_id', $managerId);
    }

    /**
     * Get the project duration in days.
     */
    public function getDurationDaysAttribute()
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->diffInDays($this->end_date);
        }
        return null;
    }

    /**
     * Get the project duration in months.
     */
    public function getDurationMonthsAttribute()
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->diffInMonths($this->end_date);
        }
        return null;
    }

    /**
     * Check if project is on schedule.
     */
    public function isOnSchedule()
    {
        if (!$this->end_date) {
            return true;
        }
        return now()->lte($this->end_date);
    }

    /**
     * Check if project is overdue.
     */
    public function isOverdue()
    {
        if (!$this->end_date) {
            return false;
        }
        return now()->gt($this->end_date) && $this->status !== 'completed';
    }
}
