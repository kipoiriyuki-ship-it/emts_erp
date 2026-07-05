<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FieldMonitoringMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'field_monitoring_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'uploaded_by',
    ];

    public function fieldMonitoring()
    {
        return $this->belongsTo(FieldMonitoring::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
