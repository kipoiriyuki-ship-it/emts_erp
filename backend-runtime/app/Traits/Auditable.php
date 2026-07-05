<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    /**
     * Boot the auditable trait.
     */
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->auditLog('CREATE');
        });

        static::updated(function ($model) {
            $model->auditLog('UPDATE');
        });

        static::deleted(function ($model) {
            $model->auditLog('DELETE');
        });
    }

    /**
     * Create an audit log entry.
     */
    protected function auditLog($action)
    {
        $user = Auth::user();
        
        AuditLog::create([
            'user_id' => $user ? $user->id : null,
            'action' => $action,
            'module' => $this->getAuditModule(),
            'description' => $this->getAuditDescription($action),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'old_values' => $action === 'UPDATE' ? $this->getOriginal() : null,
            'new_values' => $action !== 'DELETE' ? $this->getAttributes() : null,
        ]);
    }

    /**
     * Get the module name for audit log.
     */
    protected function getAuditModule()
    {
        return class_basename($this);
    }

    /**
     * Get the description for audit log.
     */
    protected function getAuditDescription($action)
    {
        $modelName = class_basename($this);
        $identifier = $this->getAuditIdentifier();
        
        return "{$action} {$modelName} {$identifier}";
    }

    /**
     * Get the identifier for audit log.
     */
    protected function getAuditIdentifier()
    {
        if (isset($this->name)) {
            return $this->name;
        }
        if (isset($this->title)) {
            return $this->title;
        }
        if (isset($this->email)) {
            return $this->email;
        }
        return "#{$this->id}";
    }
}
