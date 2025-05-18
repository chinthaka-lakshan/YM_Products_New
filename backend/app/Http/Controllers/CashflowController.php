<?php

namespace App\Http\Controllers;

use App\Models\BadReturn;
use App\Models\Item;
use Illuminate\Http\Request;
use App\Models\Cashflow;
use App\Models\Order; // ✅ Import Order model
use Illuminate\Support\Facades\Validator;
use PhpParser\Node\Expr\Cast\Double;
use Ramsey\Uuid\Type\Decimal;

class CashflowController extends Controller
{
    public function index()
    {
        return response()->json(Cashflow::all(), 200);
    }

    public function store(Request $request)
    {
        // get the total expenses from the badreturn table
        $BadreturnExpenses = BadReturn::sum('return_cost');
        $itemExpenses = Item::all()->sum(function ($item) {
        return $item->quantity * $item->itemCost;
        });

        $transport = (Double) $request->input('transport');
        $other = (Double) $request->input('other');
        //   Get the total income from the orders table
        $totalIncome = Order::sum('total_price');
        $totalExpenses = $BadreturnExpenses + $itemExpenses + $transport + $other;
        $totalProfit = $totalIncome - $totalExpenses;

        //  Replace income in the request with $totalIncome
        $request->merge(['income' => $totalIncome]);
        $request->merge(['expenses' => $totalExpenses]);
        $request->merge(['profit' => $totalProfit]);


        // replace expenses in the request with $totalExpenses
        // $request->merge(['expenses' => $totalExpenses]);

        // Validate the rest of the fields (no need to validate income anymore)
        $validator = Validator::make($request->all(), [
            'transport' => 'required|double|max:225',
            'other' => 'required|double|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cashflow = Cashflow::create($request->only(['income', 'transport', 'other', 'expenses', 'profit']));

            return response()->json([
                'message' => 'Cashflow created successfully',
                'cashflow' => $cashflow
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $cashflow = Cashflow::find($id);

        if (!$cashflow) {
            return response()->json(['message' => 'Cashflow not found'], 404);
        }

        return response()->json($cashflow, 200);
    }
}
