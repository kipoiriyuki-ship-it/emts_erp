<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LargeCashRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LargeCashController extends Controller
{
    /**
     * Display a listing of large cash requests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LargeCashRequest::with(['project', 'user', 'reviewer', 'approver', 'items']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('request_number', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $requests = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Store a newly created large cash request.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'type' => 'required|in:material,vendor,subcontractor,asset,project_payment',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'evidence_image' => 'nullable|string|max:5000000', // Max 5MB base64
        ]);

        $evidenceImagePath = null;
        if ($request->evidence_image) {
            $validationResult = $this->validateAndStoreImage($request->evidence_image, 'large-cash/evidence');
            if (!$validationResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $validationResult['message'],
                ], 400);
            }
            $evidenceImagePath = $validationResult['path'];
        }

        $requestNumber = 'LCR-' . date('Ymd') . '-' . str_pad(LargeCashRequest::count() + 1, 4, '0', STR_PAD_LEFT);

        $totalAmount = collect($request->items)->sum(function ($item) {
            return $item['quantity'] * $item['unit_price'];
        });

        $largeCashRequest = LargeCashRequest::create([
            'request_number' => $requestNumber,
            'project_id' => $request->project_id,
            'user_id' => auth()->id(),
            'type' => $request->type,
            'total_amount' => $totalAmount,
            'description' => $request->description,
            'status' => 'draft',
            'evidence_image' => $evidenceImagePath,
        ]);

        // Create items
        foreach ($request->items as $item) {
            $largeCashRequest->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $item['quantity'] * $item['unit_price'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load(['project', 'user', 'items']),
            'message' => 'Large cash request created successfully',
        ], 201);
    }

    /**
     * Display the specified large cash request.
     */
    public function show(LargeCashRequest $largeCashRequest): JsonResponse
    {
        $largeCashRequest->load(['project', 'user', 'reviewer', 'approver', 'items']);

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest,
        ]);
    }

    /**
     * Update the specified large cash request.
     */
    public function update(Request $request, LargeCashRequest $largeCashRequest): JsonResponse
    {
        // Only allow updating draft requests
        if ($largeCashRequest->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only update draft requests',
            ], 400);
        }

        // Only the requester can update
        if ($largeCashRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'type' => 'sometimes|required|in:material,vendor,subcontractor,asset,project_payment',
            'description' => 'nullable|string',
            'items' => 'sometimes|required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'evidence_image' => 'nullable|string|max:5000000', // Max 5MB base64
        ]);

        $evidenceImagePath = $largeCashRequest->evidence_image;
        if ($request->evidence_image) {
            $validationResult = $this->validateAndStoreImage($request->evidence_image, 'large-cash/evidence');
            if (!$validationResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $validationResult['message'],
                ], 400);
            }
            $evidenceImagePath = $validationResult['path'];
        }

        $data = $request->only(['project_id', 'type', 'description']);
        $data['evidence_image'] = $evidenceImagePath;

        if ($request->has('items')) {
            // Delete existing items
            $largeCashRequest->items()->delete();

            $totalAmount = collect($request->items)->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $data['total_amount'] = $totalAmount;

            // Create new items
            foreach ($request->items as $item) {
                $largeCashRequest->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        }

        $largeCashRequest->update($data);

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load(['project', 'user', 'items']),
            'message' => 'Large cash request updated successfully',
        ]);
    }

    /**
     * Validate and store evidence image.
     */
    protected function validateAndStoreImage(string $base64Image, string $directory): array
    {
        if (!preg_match('#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $base64Image)) {
            return [
                'success' => false,
                'message' => 'Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed.',
            ];
        }

        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));
        if (!$imageData) {
            return [
                'success' => false,
                'message' => 'Failed to decode image data.',
            ];
        }

        if (strlen($imageData) > 5 * 1024 * 1024) {
            return [
                'success' => false,
                'message' => 'Image size exceeds 5MB limit.',
            ];
        }

        if (!$this->isValidImage($imageData)) {
            return [
                'success' => false,
                'message' => 'Invalid image data.',
            ];
        }

        $fileName = uniqid() . '_' . time() . '.jpg';
        $path = $directory . '/' . $fileName;
        \Storage::disk('public')->put($path, $imageData);

        return [
            'success' => true,
            'path' => $path,
        ];
    }

    /**
     * Validate image data.
     */
    protected function isValidImage(string $data): bool
    {
        $signatures = [
            'jpeg' => "\xFF\xD8\xFF",
            'png' => "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A",
            'gif' => "GIF87a",
            'gif2' => "GIF89a",
            'webp' => "RIFF",
        ];

        foreach ($signatures as $sig) {
            if (strpos($data, $sig) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Remove the specified large cash request.
     */
    public function destroy(LargeCashRequest $largeCashRequest): JsonResponse
    {
        // Only allow deleting draft or rejected requests
        if (!in_array($largeCashRequest->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete draft or rejected requests',
            ], 400);
        }

        // Only the requester can delete
        if ($largeCashRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $largeCashRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Large cash request deleted successfully',
        ]);
    }

    /**
     * Submit a large cash request.
     */
    public function submit(Request $request, LargeCashRequest $largeCashRequest): JsonResponse
    {
        if ($largeCashRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$largeCashRequest->canBeSubmitted()) {
            return response()->json([
                'success' => false,
                'message' => 'Request cannot be submitted',
            ], 400);
        }

        if (!$largeCashRequest->submit()) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to create approval request. Ensure a director is configured.',
            ], 500);
        }

        $directors = User::whereHas('role', function ($query) {
            $query->where('code', 'DIRECTOR');
        })->get();

        foreach ($directors as $director) {
            Notification::create([
                'user_id' => $director->id,
                'title' => 'Large Cash Request Needs Approval',
                'message' => "Request {$largeCashRequest->request_number} requires your approval.",
                'type' => 'approval',
                'link' => '/approval-center',
                'data' => [
                    'request_id' => $largeCashRequest->id,
                    'request_type' => 'large_cash',
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load(['project', 'user', 'items']),
            'message' => 'Large cash request submitted successfully',
        ]);
    }

    /**
     * Approve a large cash request.
     */
    public function approve(Request $request, LargeCashRequest $largeCashRequest): JsonResponse
    {
        if (!$largeCashRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Can only approve pending requests',
            ], 400);
        }

        $largeCashRequest->approve(auth()->id());

        Notification::create([
            'user_id' => $largeCashRequest->user_id,
            'title' => 'Large Cash Request Approved',
            'message' => "Your request {$largeCashRequest->request_number} has been approved.",
            'type' => 'approval',
            'link' => '/finance/large-cash',
            'data' => [
                'request_id' => $largeCashRequest->id,
                'status' => 'approved',
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load(['project', 'user', 'reviewer', 'approver', 'items']),
            'message' => 'Large cash request approved successfully',
        ]);
    }

    /**
     * Reject a large cash request.
     */
    public function reject(Request $request, LargeCashRequest $largeCashRequest): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        if (!$largeCashRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Can only reject pending requests',
            ], 400);
        }

        $largeCashRequest->reject(auth()->id(), $request->reason);

        Notification::create([
            'user_id' => $largeCashRequest->user_id,
            'title' => 'Large Cash Request Rejected',
            'message' => "Your request {$largeCashRequest->request_number} was rejected.",
            'type' => 'approval',
            'link' => '/finance/large-cash',
            'data' => [
                'request_id' => $largeCashRequest->id,
                'status' => 'rejected',
                'reason' => $request->reason,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load(['project', 'user', 'reviewer', 'approver', 'items']),
            'message' => 'Large cash request rejected successfully',
        ]);
    }
}
