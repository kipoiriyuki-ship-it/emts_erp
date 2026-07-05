<?php

namespace App\Services;

use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Support\Facades\Hash;
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
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new \Exception('Invalid credentials');
        }

        if ($user->status !== 'active') {
            throw new \Exception('Account is not active');
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Generate JWT token
        $token = JWTAuth::fromUser($user);

        // Generate refresh token
        $refreshToken = $this->createRefreshToken($user);

        return [
            'token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
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

        // Generate new JWT token
        $newToken = JWTAuth::fromUser($user);

        // Revoke old refresh token
        $tokenRecord->update(['revoked_at' => now()]);

        // Generate new refresh token
        $newRefreshToken = $this->createRefreshToken($user);

        return [
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
     * Create refresh token.
     */
    protected function createRefreshToken(User $user): string
    {
        $token = Str::random(60);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addDays(config('jwt.refresh_ttl', 14)),
        ]);

        return $token;
    }

    /**
     * Get user data for response.
     */
    protected function getUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar_url,
            'role' => [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'code' => $user->role->code,
                'level' => $user->role->level,
            ],
            'permissions' => $user->getAllPermissions()->pluck('code')->toArray(),
            'last_login_at' => $user->last_login_at,
        ];
    }
}
