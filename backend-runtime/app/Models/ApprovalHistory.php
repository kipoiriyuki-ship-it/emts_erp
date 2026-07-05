<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalHistory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'approval_id',
        'actor_id',
        'action',
        'notes',
    ];

    /**
     * Get the approval that owns this history entry.
     */
    public function approval()
    {
        return $this->belongsTo(Approval::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
