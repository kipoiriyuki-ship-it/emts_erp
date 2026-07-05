<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FieldMonitoring extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'area',
        'location',
        'workers',
        'supervisors',
        'monitoring_date',
        'latitude',
        'longitude',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'workers' => 'array',
        'supervisors' => 'array',
        'monitoring_date' => 'date',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function media()
    {
        return $this->hasMany(FieldMonitoringMedia::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
