<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SalesRepDashboardController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\PurchaseStockController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/reset-password-with-otp', [AuthController::class, 'resetPasswordWithOtp']);
Route::apiResource('purchase_stock', PurchaseStockController::class);
Route::get('/purchase-stock/low', [PurchaseStockController::class, 'lowStock']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::apiResource('shops', ShopController::class);
    Route::get('/auth/verify', function () {
        return response()->json(['message' => 'Authenticated']);
    });
    

    
    // Route::get('/selses-rep', [AuthController::class, 'getSalesReps']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Admin routes

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Admin routes here

        Route::put('/sales-reps/{id}', [AdminDashboardController::class, 'editRep']);
        Route::delete('/sales-reps/{id}', [AdminDashboardController::class, 'deleteRep']);
        Route::get('/sales-reps/{id}', [AdminDashboardController::class, 'getRepById']);
        Route::post('/register-rep', [AdminDashboardController::class, 'registerRep']);
        Route::get('/sales-reps', [AdminDashboardController::class, 'getSalesReps']);
    });
    // Route::prefix('admin')->middleware('admin')->group(function () {
        
    // });
    
    // Sales rep routes
    Route::prefix('sales-rep')->group(function () {
        Route::get('/dashboard', [SalesRepDashboardController::class, 'index']);
    });
});

Route::get('/test-email', function() {
    try {
        Mail::raw('Test email content', function($message) {
            $message->to('diluklakshan01@gmail.com')
                    ->subject('Test Email');
        });
        return 'Email sent successfully';
    } catch (\Exception $e) {
        return 'Error: '.$e->getMessage();
    }
});