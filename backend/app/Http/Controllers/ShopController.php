<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class ShopController extends Controller
{
    /**
     * Display a listing of all shops.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        return response()->json(Shop::all());
    }

    /**
     * Store a newly created shop in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shop_name' => 'required|string|max:255',
            'location'  => 'required|string|max:255',
            'contact'   => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $shop = Shop::create($request->only(['shop_name', 'location', 'contact']));

        return response()->json([
            'message' => 'Shop created successfully',
            'shop' => $shop
        ], 201);
    }

    /**
     * Update the specified shop in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'shop_name' => 'required|string|max:255',
            'location'  => 'required|string|max:255',
            'contact'   => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $shop = Shop::findOrFail($id);
            $shop->update($request->only(['shop_name', 'location', 'contact']));

            return response()->json([
                'message' => 'Shop updated successfully',
                'shop' => $shop
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Shop not found'
            ], 404);
        }
    }

    /**
     * Remove the specified shop from the database.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $shop = Shop::findOrFail($id);
            $shop->delete();

            return response()->json([
                'message' => 'Shop deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Shop not found'
            ], 404);
        }
    }
}
