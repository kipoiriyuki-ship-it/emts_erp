<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Employee;
use App\Models\OvertimeRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PayrollController extends Controller
{
    /**
     * Display a listing of payrolls.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payroll::with(['employee.user', 'processor', 'payer']);

        if ($request->has('period')) {
            $query->where('period', $request->period);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
        }

        $payrolls = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $payrolls,
        ]);
    }

    /**
     * Store a newly created payroll.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'period' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'insurance' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Check if payroll already exists for this employee and period
        $existing = Payroll::where('employee_id', $request->employee_id)
            ->where('period', $request->period)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Payroll already exists for this employee and period',
            ], 400);
        }

        // Calculate overtime hours and pay
        $overtimeRecords = OvertimeRecord::where('user_id', Employee::find($request->employee_id)->user_id)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->where('status', 'approved')
            ->get();

        $overtimeHours = $overtimeRecords->sum('hours');
        $overtimePay = $overtimeRecords->sum(function ($record) {
            $employee = Employee::find($request->employee_id);
            $hourlyRate = $employee->salary / 160; // Assuming 160 working hours per month
            return $record->hours * $hourlyRate * $record->rate;
        });

        $netSalary = $request->basic_salary + $overtimePay + ($request->allowances ?? 0) - ($request->deductions ?? 0) - ($request->tax ?? 0) - ($request->insurance ?? 0);

        $payroll = Payroll::create([
            'employee_id' => $request->employee_id,
            'period' => $request->period,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'basic_salary' => $request->basic_salary,
            'overtime_hours' => $overtimeHours,
            'overtime_pay' => $overtimePay,
            'allowances' => $request->allowances ?? 0,
            'deductions' => $request->deductions ?? 0,
            'tax' => $request->tax ?? 0,
            'insurance' => $request->insurance ?? 0,
            'net_salary' => $netSalary,
            'status' => 'draft',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => $payroll->load(['employee.user', 'processor', 'payer']),
            'message' => 'Payroll created successfully',
        ], 201);
    }

    /**
     * Display the specified payroll.
     */
    public function show(Payroll $payroll): JsonResponse
    {
        $payroll->load(['employee.user', 'processor', 'payer']);

        return response()->json([
            'success' => true,
            'data' => $payroll,
        ]);
    }

    /**
     * Update the specified payroll.
     */
    public function update(Request $request, Payroll $payroll): JsonResponse
    {
        $request->validate([
            'basic_salary' => 'sometimes|required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'insurance' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Only allow updating draft payrolls
        if ($payroll->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only update draft payrolls',
            ], 400);
        }

        $data = $request->only(['basic_salary', 'allowances', 'deductions', 'tax', 'insurance', 'notes']);
        
        $netSalary = $payroll->basic_salary + $payroll->overtime_pay + ($data['allowances'] ?? $payroll->allowances) - ($data['deductions'] ?? $payroll->deductions) - ($data['tax'] ?? $payroll->tax) - ($data['insurance'] ?? $payroll->insurance);
        $data['net_salary'] = $netSalary;

        $payroll->update($data);

        return response()->json([
            'success' => true,
            'data' => $payroll->load(['employee.user', 'processor', 'payer']),
            'message' => 'Payroll updated successfully',
        ]);
    }

    /**
     * Remove the specified payroll.
     */
    public function destroy(Payroll $payroll): JsonResponse
    {
        // Only allow deleting draft payrolls
        if ($payroll->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete draft payrolls',
            ], 400);
        }

        $payroll->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payroll deleted successfully',
        ]);
    }

    /**
     * Process payroll (mark as processed).
     */
    public function process(Request $request, Payroll $payroll): JsonResponse
    {
        if ($payroll->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only process draft payrolls',
            ], 400);
        }

        $payroll->update([
            'status' => 'processed',
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $payroll->load(['employee.user', 'processor', 'payer']),
            'message' => 'Payroll processed successfully',
        ]);
    }

    /**
     * Mark payroll as paid.
     */
    public function markAsPaid(Request $request, Payroll $payroll): JsonResponse
    {
        if ($payroll->status !== 'processed') {
            return response()->json([
                'success' => false,
                'message' => 'Can only mark processed payrolls as paid',
            ], 400);
        }

        $payroll->update([
            'status' => 'paid',
            'paid_by' => auth()->id(),
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $payroll->load(['employee.user', 'processor', 'payer']),
            'message' => 'Payroll marked as paid successfully',
        ]);
    }

    /**
     * Generate payroll for a period for all employees.
     */
    public function generatePeriod(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $employees = Employee::active()->get();
        $createdPayrolls = [];

        foreach ($employees as $employee) {
            // Check if payroll already exists
            $existing = Payroll::where('employee_id', $employee->id)
                ->where('period', $request->period)
                ->first();

            if (!$existing && $employee->salary) {
                // Calculate overtime
                $overtimeRecords = OvertimeRecord::where('user_id', $employee->user_id)
                    ->whereBetween('date', [$request->start_date, $request->end_date])
                    ->where('status', 'approved')
                    ->get();

                $overtimeHours = $overtimeRecords->sum('hours');
                $overtimePay = $overtimeRecords->sum(function ($record) use ($employee) {
                    $hourlyRate = $employee->salary / 160;
                    return $record->hours * $hourlyRate * $record->rate;
                });

                $netSalary = $employee->salary + $overtimePay;

                $payroll = Payroll::create([
                    'employee_id' => $employee->id,
                    'period' => $request->period,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'basic_salary' => $employee->salary,
                    'overtime_hours' => $overtimeHours,
                    'overtime_pay' => $overtimePay,
                    'allowances' => 0,
                    'deductions' => 0,
                    'tax' => 0,
                    'insurance' => 0,
                    'net_salary' => $netSalary,
                    'status' => 'draft',
                ]);

                $createdPayrolls[] = $payroll->id;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'created_count' => count($createdPayrolls),
                'payroll_ids' => $createdPayrolls,
            ],
            'message' => 'Payroll generation completed',
        ]);
    }
}
