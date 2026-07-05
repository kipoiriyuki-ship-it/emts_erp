<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    /**
     * Check in.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'photo_url' => 'nullable|string',
        ]);

        $today = now()->toDateString();
        $existing = Attendance::where('user_id', auth()->id())
            ->where('date', $today)
            ->first();

        if ($existing && $existing->check_in_time) {
            return response()->json([
                'success' => false,
                'message' => 'Already checked in today',
            ], 400);
        }

        // Save photo if provided
        $photoPath = null;
        if ($request->photo_url) {
            $photoData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->photo_url));
            if ($photoData) {
                $fileName = 'checkin_' . auth()->id() . '_' . $today . '_' . time() . '.jpg';
                $photoPath = 'attendance/' . $fileName;
                \Storage::disk('public')->put($photoPath, $photoData);
            }
        }

        $attendance = Attendance::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'date' => $today,
            ],
            [
                'check_in_time' => now()->toTimeString(),
                'check_in_lat' => $request->lat,
                'check_in_lng' => $request->lng,
                'check_in_photo' => $photoPath,
                'status' => $this->determineStatus(now()->toTimeString()),
            ]
        );

        // Audit log
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'CHECK_IN',
            'module' => 'Attendance',
            'description' => "Checked in at {$request->lat}, {$request->lng}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'new_values' => [
                'check_in_time' => $attendance->check_in_time,
                'check_in_lat' => $request->lat,
                'check_in_lng' => $request->lng,
                'status' => $attendance->status,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $attendance,
            'message' => 'Checked in successfully',
        ], 201);
    }

    /**
     * Check out.
     */
    public function checkOut(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'photo_url' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $today = now()->toDateString();
        $attendance = Attendance::where('user_id', auth()->id())
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No check-in record found for today',
            ], 404);
        }

        if ($attendance->check_out_time) {
            return response()->json([
                'success' => false,
                'message' => 'Already checked out today',
            ], 400);
        }

        // Save photo if provided
        $photoPath = null;
        if ($request->photo_url) {
            $photoData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->photo_url));
            if ($photoData) {
                $fileName = 'checkout_' . auth()->id() . '_' . $today . '_' . time() . '.jpg';
                $photoPath = 'attendance/' . $fileName;
                \Storage::disk('public')->put($photoPath, $photoData);
            }
        }

        $attendance->update([
            'check_out_time' => now()->toTimeString(),
            'check_out_lat' => $request->lat,
            'check_out_lng' => $request->lng,
            'check_out_photo' => $photoPath,
            'notes' => $request->notes,
            'work_hours' => $this->calculateWorkHours($attendance->check_in_time, now()->toTimeString()),
        ]);

        // Audit log
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'CHECK_OUT',
            'module' => 'Attendance',
            'description' => "Checked out after {$attendance->work_hours} hours",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'new_values' => [
                'check_out_time' => $attendance->check_out_time,
                'check_out_lat' => $request->lat,
                'check_out_lng' => $request->lng,
                'work_hours' => $attendance->work_hours,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $attendance,
            'message' => 'Checked out successfully',
        ]);
    }

    /**
     * Get my attendance.
     */
    public function myAttendance(Request $request): JsonResponse
    {
        $query = Attendance::where('user_id', auth()->id());

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $attendance = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    /**
     * Get all attendance (admin only).
     */
    public function allAttendance(Request $request): JsonResponse
    {
        $query = Attendance::with('user.role');

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $attendance = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    /**
     * Request leave.
     */
    public function requestLeave(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:annual,sick,personal,unpaid,maternity,paternity',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $leave = LeaveRequest::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $leave,
            'message' => 'Leave request submitted successfully',
        ], 201);
    }

    /**
     * Determine attendance status based on check-in time.
     */
    protected function determineStatus(string $checkInTime): string
    {
        $checkIn = \Carbon\Carbon::parse($checkInTime);
        $standardTime = \Carbon\Carbon::parse('09:00:00');

        return $checkIn->gt($standardTime) ? 'late' : 'present';
    }

    /**
     * Calculate work hours.
     */
    protected function calculateWorkHours(string $checkIn, string $checkOut): float
    {
        $in = \Carbon\Carbon::parse($checkIn);
        $out = \Carbon\Carbon::parse($checkOut);
        return $in->diffInMinutes($out) / 60;
    }
}
