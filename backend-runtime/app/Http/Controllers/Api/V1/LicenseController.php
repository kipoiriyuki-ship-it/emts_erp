<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\LicenseCodeIssued;
use App\Models\Company;
use App\Models\License;
use App\Services\LicenseActivationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class LicenseController extends Controller
{
    public function __construct(
        protected LicenseActivationService $licenseActivationService
    ) {
    }

    /**
     * Public account activation with license code.
     */
    public function activate(Request $request): JsonResponse
    {
        $request->validate([
            'activation_code' => 'required_without:code|string',
            'code' => 'required_without:activation_code|string',
        ]);

        try {
            if ($request->filled('activation_code')) {
                $data = $this->licenseActivationService->activate([
                    'activation_code' => strtoupper($request->activation_code),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Account activated successfully',
                    'data' => $data,
                ], 201);
            }

            return response()->json([
                'success' => false,
                'message' => 'Legacy activation requires authentication. Use full account activation form.',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function myLicense(Request $request): JsonResponse
    {
        try {
            $user = auth()->user()->load('license');

            if (!$user->license_id) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'has_license' => false,
                        'license' => null,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'has_license' => true,
                    'license' => [
                        'code' => $user->license->code,
                        'type' => $user->license->type,
                        'max_users' => $user->license->max_users,
                        'max_projects' => $user->license->max_projects,
                        'valid_from' => $user->license->valid_from,
                        'valid_until' => $user->license->valid_until,
                        'modules_enabled' => $user->license->modules_enabled,
                        'device_limit' => $user->license->device_limit,
                        'status' => $user->license->status,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get license info: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:TRIAL,MONTHLY,PREMIUM,STANDARD,ENTERPRISE',
            'company_id' => 'nullable|exists:companies,id',
            'max_users' => 'nullable|integer|min:1',
            'max_projects' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'modules_enabled' => 'nullable|array',
            'device_limit' => 'nullable|integer|min:1',
        ]);

        try {
            $validFrom = $request->filled('valid_from') ? $request->valid_from : now()->startOfDay();
            $validUntil = $request->filled('valid_until') ? $request->valid_until : $this->resolveDefaultValidUntil($request->type);
            $code = License::generateCode($request->type);

            $license = License::create([
                'code' => $code,
                'license_code' => $code,
                'type' => $request->type,
                'license_type' => $request->type,
                'max_users' => $request->max_users ?? 5,
                'max_projects' => $request->max_projects ?? 10,
                'modules_enabled' => $request->modules_enabled ?? $this->defaultModules($request->type),
                'device_limit' => $request->device_limit ?? 1,
                'valid_from' => $validFrom,
                'valid_until' => $validUntil,
                'is_active' => true,
                'is_used' => false,
                'issued_at' => now(),
                'company_id' => $request->company_id,
                'status' => 'available',
                'generated_by' => auth()->id(),
            ]);

            if ($request->filled('company_id')) {
                $company = Company::find($request->company_id);
                if ($company && $company->email) {
                    try {
                        Mail::to($company->email)->send(new LicenseCodeIssued($company, $license));
                    } catch (\Throwable $e) {
                        // Email failure should not break license generation.
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'License generated successfully',
                'data' => [
                    'license' => $license,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate license: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $licenses = License::with(['user', 'company'])->latest()->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'licenses' => $licenses,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get licenses: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deactivate(Request $request, $id): JsonResponse
    {
        try {
            $license = License::findOrFail($id);

            if ($license->used_by_user_id) {
                $user = \App\Models\User::find($license->used_by_user_id);
                if ($user) {
                    $user->update([
                        'license_id' => null,
                        'license_type' => null,
                    ]);
                }
            }

            $license->update([
                'is_active' => false,
                'is_used' => false,
                'used_by_user_id' => null,
                'used_at' => null,
                'status' => 'inactive',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'License deactivated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate license: ' . $e->getMessage(),
            ], 500);
        }
    }

    protected function defaultModules(string $type): array
    {
        return match ($type) {
            'TRIAL' => ['dashboard', 'projects', 'attendance'],
            'MONTHLY' => ['dashboard', 'projects', 'attendance', 'finance', 'hr'],
            'PREMIUM' => ['dashboard', 'projects', 'attendance', 'finance', 'hr', 'accounting', 'approvals'],
            'STANDARD' => ['dashboard', 'projects', 'attendance', 'finance', 'hr'],
            'ENTERPRISE' => ['dashboard', 'projects', 'attendance', 'finance', 'hr', 'accounting', 'approvals', 'audit', 'settings'],
            default => ['dashboard', 'projects'],
        };
    }

    protected function resolveDefaultValidUntil(string $type)
    {
        return match ($type) {
            'TRIAL' => now()->addDays(7)->endOfDay(),
            'MONTHLY' => now()->addDays(30)->endOfDay(),
            'PREMIUM' => now()->addDays(365)->endOfDay(),
            default => now()->addDays(30)->endOfDay(),
        };
    }
}
