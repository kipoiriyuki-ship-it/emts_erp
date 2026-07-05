<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Attendance extends Model
{
    use HasFactory, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'date',
        'check_in_time',
        'check_out_time',
        'check_in_lat',
        'check_in_lng',
        'check_in_photo',
        'check_out_lat',
        'check_out_lng',
        'check_out_photo',
        'work_hours',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'check_in_time' => 'datetime:H:i:s',
        'check_out_time' => 'datetime:H:i:s',
        'check_in_lat' => 'decimal:8',
        'check_in_lng' => 'decimal:8',
        'check_out_lat' => 'decimal:8',
        'check_out_lng' => 'decimal:8',
        'work_hours' => 'decimal:2',
    ];

    /**
     * Get the user who owns the attendance.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attendance logs for the attendance.
     */
    public function logs()
    {
        return $this->hasMany(AttendanceLog::class);
    }

    /**
     * Get the overtime records for the attendance.
     */
    public function overtimeRecords()
    {
        return $this->hasMany(OvertimeRecord::class);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include present attendances.
     */
    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    /**
     * Scope a query to only include absent attendances.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    /**
     * Scope a query to only include late attendances.
     */
    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }

    /**
     * Check if user is late.
     */
    public function isLate()
    {
        return $this->status === 'late';
    }

    /**
     * Check if user has checked in.
     */
    public function hasCheckedIn()
    {
        return !is_null($this->check_in_time);
    }

    /**
     * Check if user has checked out.
     */
    public function hasCheckedOut()
    {
        return !is_null($this->check_out_time);
    }

    /**
     * Get the check-in location.
     */
    public function getCheckInLocationAttribute()
    {
        if ($this->check_in_lat && $this->check_in_lng) {
            return "{$this->check_in_lat}, {$this->check_in_lng}";
        }
        return null;
    }

    /**
     * Get the check-out location.
     */
    public function getCheckOutLocationAttribute()
    {
        if ($this->check_out_lat && $this->check_out_lng) {
            return "{$this->check_out_lat}, {$this->check_out_lng}";
        }
        return null;
    }
}
