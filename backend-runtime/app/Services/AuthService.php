<?php

namespace App\Services;

use App\Mail\RegistrationReceived;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Login user and generate tokens.
     */
    public function login(array $credentials): array
    {
        Log::info('LOGIN ATTEMPT', [
            'credentials' => $credentials,
        ]);

        $user = User::where('email', $credentials['email'])->first();

        Log::info('LOGIN USER', [
            'user_found' => $user ? true : false,
            'email' => $user?->email,
            'status' => $user?->status,
            'password_match' => $user ? Hash::check($credentials['password'], $user->password) : false,
        ]);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new \Exception('Invalid credentials');
        }

        $status = strtoupper((string) $user->status);
        $isWaitingLicense = $status === 'PENDING_LICENSE';

        // Bypass license requirement for specific personal admin accounts
        $bypassLicenseFor = [
            'admin@elynpro.com',
        ];
        $isBypassAccount = in_array(strtolower($user->email), array_map('strtolower', $bypassLicenseFor), true);

        if (in_array($status, ['DISABLED', 'DELETED'], true)) {
            throw new \Exception('Account is not active');
        }

        $user = $this->ensureRole($user);

        // If this is a bypass account, ensure it has SUPER_ADMIN role (full access)
        if ($isBypassAccount) {
            $superAdminRole = Role::firstOrCreate(
                ['code' => 'SUPER_ADMIN'],
                ['name' => 'Super Admin', 'level' => 1, 'description' => 'Super Administrator']
            );
            $user->forceFill(['role_id' => $superAdminRole->id])->saveQuietly();
            $user->setRelation('role', $superAdminRole);
        }

        if (!$isWaitingLicense && !$isBypassAccount) {
            $license = $user->license()->first();
            if (!$license || !$license->isUsable()) {
                if ($license && $license->isExpired()) {
                    $license->update(['status' => 'expired']);
                    throw new \Exception('License has expired');
                }

                throw new \Exception('License is not active');
            }
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Generate JWT token
        $token = JWTAuth::fromUser($user);

        // Generate refresh token
        $refreshToken = $this->createRefreshToken($user);

        return [
            'access_token' => $token,
            'token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'license_status' => ($isWaitingLicense && !$isBypassAccount) ? 'waiting' : 'active',
            'user' => $this->getUserData($user),
        ];
    }

    /**
     * Logout user and revoke tokens.
     */
    public function logout(): void
    {
        $user = auth()->user();

        // Revoke current refresh token
        RefreshToken::where('user_id', $user->id)
            ->where('token', request()->refresh_token)
            ->update(['revoked_at' => now()]);

        // Invalidate JWT token
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    /**
     * Refresh access token.
     */
    public function refresh(string $refreshToken): array
    {
        $tokenRecord = RefreshToken::where('token', $refreshToken)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$tokenRecord) {
            throw new \Exception('Invalid or expired refresh token');
        }

        $user = User::find($tokenRecord->user_id);

        if (!$user) {
            throw new \Exception('User not found');
        }

        $user = $this->ensureRole($user);

        // Generate new JWT token
        $newToken = JWTAuth::fromUser($user);

        // Revoke old refresh token
        $tokenRecord->update(['revoked_at' => now()]);

        // Generate new refresh token
        $newRefreshToken = $this->createRefreshToken($user);

        return [
            'access_token' => $newToken,
            'token' => $newToken,
            'refresh_token' => $newRefreshToken,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => $this->getUserData($user),
        ];
    }

    /**
     * Get authenticated user data.
     */
    public function me(): array
    {
        $user = auth()->user();
        return $this->getUserData($user);
    }

    /**
     * Change password.
     */
    public function changePassword(array $data): void
    {
        $user = auth()->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            throw new \Exception('Current password is incorrect');
        }

        $user->update([
            'password' => Hash::make($data['new_password']),
        ]);
    }

    /**
     * Request password reset.
     */
    public function forgotPassword(string $email): string
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User not found');
        }

        $token = Str::random(60);

        \DB::table('password_resets')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => now(),
            'expires_at' => now()->addHours(1),
        ]);

        // In production, send email with reset link
        // For now, return the token for testing
        return $token;
    }

    /**
     * Reset password.
     */
    public function resetPassword(array $data): void
    {
        $resetRecord = \DB::table('password_resets')
            ->where('email', $data['email'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$resetRecord || !Hash::check($data['token'], $resetRecord->token)) {
            throw new \Exception('Invalid or expired reset token');
        }

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            throw new \Exception('User not found');
        }

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        // Delete the reset record
        \DB::table('password_resets')
            ->where('email', $data['email'])
            ->delete();
    }

    /**
     * Register new user (pending approval).
     */
    public function register(array $data): array
    {
        $role = $this->resolveRole($data['role_code'] ?? null);

        $company = Company::create([
            'name' => $data['company_name'] ?? $data['name'] ?? 'Pending Company',
            'pic' => $data['pic'] ?? $data['name'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'settings' => ['registration_status' => 'PENDING_LICENSE'],
        ]);

        $user = User::create([
            'role_id' => $role->id,
            'name' => $data['pic'] ?? $data['name'] ?? 'Pending PIC',
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'status' => 'PENDING_LICENSE',
            'company_id' => $company->id,
        ]);

        $this->notifyAdminAboutRegistration($company, $user);

        return [
            'id' => $user->id,
            'company_id' => $company->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
        ];
    }

    /**
     * Create refresh token.
     */
    protected function createRefreshToken(User $user): string
    {
        return $this->createRefreshTokenPublic($user);
    }

    public function createRefreshTokenPublic(User $user): string
    {
        $token = Str::random(60);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addDays(config('jwt.refresh_ttl', 14)),
        ]);

        return $token;
    }

    protected function ensureRole(User $user): User
    {
        if ($user->role_id) {
            $role = $user->role()->first();
            if ($role) {
                $user->setRelation('role', $role);
                return $user;
            }
        }

        $role = $this->resolveRole();
        $user->forceFill(['role_id' => $role->id])->saveQuietly();
        $user->setRelation('role', $role);

        return $user;
    }

    protected function notifyAdminAboutRegistration(Company $company, User $user): void
    {
        $adminEmail = config('services.emts.admin_email', 'kipoiriyuki@gmail.com');

        try {
            Mail::to($adminEmail)->send(new RegistrationReceived($company, $user));
        } catch (\Throwable $e) {
            // Do not block registration if email fails.
        }
    }

    protected function defaultModules(string $type): array
    {
        return match ($type) {
            'TRIAL' => ['dashboard', 'projects', 'attendance'],
            'MONTHLY' => ['dashboard', 'projects', 'attendance', 'finance', 'hr'],
            'PREMIUM' => ['dashboard', 'projects', 'attendance', 'finance', 'hr', 'accounting', 'approvals'],
            default => ['dashboard', 'projects'],
        };
    }

    protected function resolveRole(?string $roleCode = null): Role
    {
        $normalizedRoleCode = $roleCode ? strtoupper($roleCode) : null;

        if ($normalizedRoleCode) {
            $role = Role::where('code', $normalizedRoleCode)->first();
            if ($role) {
                return $role;
            }
        }

        return Role::firstOrCreate(
            ['code' => 'SUPER_ADMIN'],
            ['name' => 'Super Admin', 'description' => 'Super administrator', 'level' => 1]
        );
    }

    /**
     * Get user data for response.
     */
    protected function getUserData(User $user): array
    {
        $user = $this->ensureRole($user);
        $role = $user->role;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'role' => [
                'id' => $role?->id,
                'name' => $role?->name ?? 'User',
                'code' => $role?->code ?? 'USER',
                'level' => $role?->level ?? 1,
            ],
            'permissions' => $user->getAllPermissions()->pluck('code')->toArray(),
            'last_login_at' => $user->last_login_at,
        ];
    }
}
