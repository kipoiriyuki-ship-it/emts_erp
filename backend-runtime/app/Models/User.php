<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\HasPermissions;
use App\Traits\Auditable;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, Auditable;
    use HasRoles, HasPermissions {
        HasPermissions::getAllPermissions insteadof HasRoles;
        HasRoles::getAllPermissions as getSpatiePermissions;
        HasPermissions::hasAnyPermission insteadof HasRoles;
        HasRoles::hasAnyPermission as hasAnySpatiePermission;
        HasPermissions::hasAllPermissions insteadof HasRoles;
        HasRoles::hasAllPermissions as hasAllSpatiePermissions;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'status',
        'last_login_at',
        'email_verified_at',
        'license_id',
        'license_type',
        'company_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        $role = $this->role()->first();

        if (!$role && !$this->role_id) {
            $role = Role::firstOrCreate(
                ['code' => 'USER'],
                ['name' => 'User', 'description' => 'Default user role', 'level' => 1]
            );
            $this->forceFill(['role_id' => $role->id])->saveQuietly();
        }

        return [
            'role' => $role?->code ?? 'USER',
            'role_level' => $role?->level ?? 1,
            'permissions' => $this->getAllPermissions()->pluck('code')->toArray(),
        ];
    }

    /**
     * Get the role that owns the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the projects managed by the user.
     */
    public function managedProjects()
    {
        return $this->hasMany(Project::class, 'manager_id');
    }

    /**
     * Get the projects the user is a member of.
     */
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get the user's attendances.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the user's leave requests.
     */
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get the user's work schedules.
     */
    public function workSchedules()
    {
        return $this->hasMany(WorkSchedule::class);
    }

    /**
     * Get the user's reminders.
     */
    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    /**
     * Get the operational expenses created by the user.
     */
    public function operationalExpenses()
    {
        return $this->hasMany(OperationalExpense::class);
    }

    /**
     * Get the large cash requests created by the user.
     */
    public function largeCashRequests()
    {
        return $this->hasMany(LargeCashRequest::class);
    }

    /**
     * Get the journal entries created by the user.
     */
    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class, 'created_by');
    }

    /**
     * Get the project progress created by the user.
     */
    public function projectProgress()
    {
        return $this->hasMany(ProjectProgress::class, 'created_by');
    }

    /**
     * Get the refresh tokens for the user.
     */
    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Get the audit logs for the user.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the license associated with the user.
     */
    public function license()
    {
        return $this->belongsTo(License::class);
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include users with a specific role.
     */
    public function scopeWithRole($query, $roleCode)
    {
        return $query->whereHas('role', function ($q) use ($roleCode) {
            $q->where('code', $roleCode);
        });
    }

    /**
     * Check if user is director.
     */
    public function isDirector()
    {
        return $this->role?->code === 'DIRECTOR';
    }

    /**
     * Check if user is accounting.
     */
    public function isAccounting()
    {
        return $this->role?->code === 'ACCOUNTING';
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin()
    {
        return $this->role?->code === 'ADMIN';
    }

    /**
     * Check if user is project manager.
     */
    public function isProjectManager()
    {
        return $this->role?->code === 'PROJECT_MANAGER';
    }

    /**
     * Check if user is employee.
     */
    public function isEmployee()
    {
        return $this->role->code === 'EMPLOYEE';
    }

    /**
     * Get the user's full name attribute.
     */
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    /**
     * Get the user's avatar URL attribute.
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=0F172A&color=fff';
    }
}
