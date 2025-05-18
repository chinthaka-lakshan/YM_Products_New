<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use App\Models\Item;

class ItemController extends Controller
{
    public function index()
    {
        return response()->json(Item::all());
    }
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item' => 'required|string|max:255',
            'unitPrice' => [
                'required',
                'numeric',
                'regex:/^\d+(\.\d{1,2})?$/'
            ],
            'quantity' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try{
            $unitPrice = number_format((float) $request->unitPrice, 2, '.', '');
            $quantity = $request->quantity;
            
            $item = Item::create([
                'item' => $request->item,
                'unitPrice' => $unitPrice,
                'quantity' => $quantity
            ]);

            return response()->json([
                'message'=> 'Item Added Successfully',
                'item'=>$item
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message'=> 'Error when Adding Item',
                'error'=>$e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request,$id)
    {
        $item = Item::find($id);

        if(!$item) {
            return response()->json(['message'=>'Item not found'], 404);
        }
        
        $validator = Validator::make($request->all(),[
            'item' => 'sometimes|string|max:255',
            'unitPrice' => [
                'sometimes',
                'numeric',
                'regex:/^\d+(\.\d{1,2})?$/'
            ],
            'quantity' => 'sometimes|integer'
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validation failed',
                'errors'=>$validator->errors()
            ], 422);
        }

        try{
            $updateData = $request->only(['item','unitPrice','quantity']);

            if (isset($updateData['unitPrice'])) {
                $updateData['unitPrice'] = number_format((float) $updateData['unitPrice'], 2, '.', '');
            }

            $item->update($updateData);

            return response()->json([
                'message'=>'Item Updated Successfully',
                'item'=> $item
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message'=>'Error when Updating Item',
                'error'=>$e->getMessage()
            ], 500);
        }
    }


    public function destroy($id)
    {
        $item = Item::find($id);

        if(!$item){
            return response()->json(['message' => 'Item not found'], 404);
        }

        try{
            $item->delete();
            return response()->json(['message' => 'Item Deleted Successfully'], 200);
        } catch(\Exception $e) {
            return response()->json([
                'message' => 'Error when deleting Item',
                'error'=> $e->getMessage()
            ], 500);
        }
    }

    
    public function show($id)
    {
        \Log::info("Fetching item with ID: $id");

        $item = Item::find($id);
        if(!$item){
            return response()->json(['message'=>'Item not found'],404);
        }

        return response()->json($item);
    }

    public function addStock(Request $request, $id)
    {
        $item = Item::find($id);

        if(!$item) {
            return response()->json(['message'=>'Item not found'], 404);
        }
        
        $validator = Validator::make($request->all(),[
            'quantity' => 'required|integer|min:1'
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validation failed',
                'errors'=>$validator->errors()
            ], 422);
        }

        try{
            $quantityToAdd = $request->quantity;
            $item->quantity += $quantityToAdd;
            $item->save();

            return response()->json([
                'message'=>'Stock added successfully',
                'quantity'=> $item->quantity
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message'=>'Error when adding stock',
                'error'=>$e->getMessage()
            ], 500);
        }
    }
}