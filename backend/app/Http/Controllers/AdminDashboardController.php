<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SalesRepCredentials;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function registerRep(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
                'nic' => 'required|string|max:20|unique:users',
                'contact_number' => 'required|string|max:20'
            ]);

            $salesRep = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'nic' => $validated['nic'],
                'contact_number' => $validated['contact_number'],
                'role' => 'sales_rep'
            ]);

            // Send email (queued)
            Mail::to($validated['email'])
                ->queue(new SalesRepCredentials(
                    $validated['name'],
                    $validated['email'],
                    $validated['password']
                ));

            return response()->json([
                'success' => true,
                'message' => 'Sales rep created successfully',
                'data' => $salesRep
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Registration failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Account created but email failed to send',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500); // Changed from 201 to 500 for error case
        }
    }

    public function getSalesReps()
{
    $reps = User::where('role', 'sales_rep')
        ->select('id', 'name', 'email', 'nic', 'contact_number', 'created_at')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $reps,
        'message' => 'Sales representatives retrieved successfully'
    ]);
}



public function editRep(Request $request, $id)
{
    try {
        $salesRep = User::where('role', 'sales_rep')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$id,
            'password' => 'sometimes|string|min:6',
            'nic' => 'sometimes|string|max:20|unique:users,nic,'.$id,
            'contact_number' => 'sometimes|string|max:20'
        ]);

        // Only update fields that were provided
        if (isset($validated['name'])) {
            $salesRep->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $salesRep->email = $validated['email'];
        }
        if (isset($validated['password'])) {
            $salesRep->password = Hash::make($validated['password']);
        }
        if (isset($validated['nic'])) {
            $salesRep->nic = $validated['nic'];
        }
        if (isset($validated['contact_number'])) {
            $salesRep->contact_number = $validated['contact_number'];
        }

        $salesRep->save();

        return response()->json([
            'success' => true,
            'message' => 'Sales rep updated successfully',
            'data' => $salesRep
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Sales representative not found'
        ], 404);
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('Edit failed: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to update sales rep',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}

/**
 * Delete sales representative
 */
public function deleteRep($id)
{
    try {
        $salesRep = User::where('role', 'sales_rep')->findOrFail($id);
        $salesRep->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sales rep deleted successfully'
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Sales representative not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Delete failed: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete sales rep',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}

public function getRepById($id)
{
    try {
        $rep = User::where('role', 'sales_rep')
            ->select('id', 'name', 'email', 'nic', 'contact_number', 'created_at')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rep,
            'message' => 'Sales representative retrieved successfully'
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Sales representative not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Failed to fetch sales rep: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch sales representative',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}



    public function index()
    {
        return response()->json([
            'message' => 'Welcome to Admin Dashboard',
            'data' => 'Admin specific data here'
        ]);
    }
}