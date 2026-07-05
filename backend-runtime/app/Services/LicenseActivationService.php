<?php

namespace App\Services;

use App\Models\Company;
use App\Models\License;
use App\Models\Role;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class LicenseActivationService
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    public function activate(array $data): array
    {
        $license = License::where('license_code', $data['activation_code'])
            ->orWhere('code', $data['activation_code'])
            ->first();

        if (!$license) {
            throw new \Exception('Invalid activation code');
        }

        if (!$license->isActivationCandidate()) {
            if ($license->isExpired()) {
                throw new \Exception('Activation code has expired');
            }

            throw new \Exception('Activation code has already been used');
        }

        $company = $license->company()->first();
        if (!$company) {
            throw new \Exception('No company is associated with this activation code');
        }

        $user = User::where('company_id', $company->id)
            ->whereIn('status', ['PENDING_LICENSE', 'ACTIVE'])
            ->first();

        if (!$user) {
            $user = User::create([
                'role_id' => 1,
                'company_id' => $company->id,
                'name' => $company->pic ?? $company->name,
                'email' => $company->email,
                'password' => bcrypt(Str::random(16)),
                'status' => 'PENDING_LICENSE',
            ]);
        }

        $adminRole = Role::firstOrCreate(
            ['code' => 'SUPER_ADMIN'],
            ['name' => 'Super Admin', 'description' => 'Super administrator', 'level' => 100]
        );

        return DB::transaction(function () use ($license, $company, $user, $adminRole) {
            $validUntil = now()->addDays(match ($license->license_type ?? $license->type) {
                'TRIAL' => 7,
                'MONTHLY' => 30,
                'PREMIUM' => 365,
                default => 30,
            })->endOfDay();

            $license->update([
                'is_used' => true,
                'used_by_user_id' => $user->id,
                'used_at' => now(),
                'used_by' => $user->id,
                'activated_at' => now(),
                'company_id' => $company->id,
                'status' => 'used',
                'is_active' => true,
                'valid_from' => now()->startOfDay(),
                'valid_until' => $validUntil,
            ]);

            $company->update(['license_id' => $license->id]);

            $user->update([
                'role_id' => $adminRole->id,
                'company_id' => $company->id,
                'status' => 'ACTIVE',
                'license_id' => $license->id,
                'license_type' => $license->license_type ?? $license->type,
                'email_verified_at' => now(),
            ]);

            $token = JWTAuth::fromUser($user);
            $refreshToken = $this->authService->createRefreshTokenPublic($user);

            return [
                'token' => $token,
                'refresh_token' => $refreshToken,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => [
                        'id' => $adminRole->id,
                        'name' => $adminRole->name,
                        'code' => $adminRole->code,
                        'level' => $adminRole->level,
                    ],
                    'permissions' => $user->getAllPermissions()->pluck('code')->toArray(),
                ],
                'company' => $company,
                'license' => [
                    'code' => $license->license_code,
                    'type' => $license->license_type ?? $license->type,
                    'valid_from' => $license->valid_from,
                    'valid_until' => $license->valid_until,
                    'modules_enabled' => $license->modules_enabled,
                    'device_limit' => $license->device_limit,
                    'status' => $license->status,
                ],
            ];
        });
    }
}
