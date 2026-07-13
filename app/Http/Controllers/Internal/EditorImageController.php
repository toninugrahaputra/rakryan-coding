<?php

namespace App\Http\Controllers\Internal;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EditorImageController extends Controller
{
    public function store(Request $request, string $context, string $identifier): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:4096'],
        ]);

        $file = $request->file('image');
        $path = $file->storeAs(
            "{$context}/{$identifier}",
            Str::uuid().'.'.$file->getClientOriginalExtension(),
            'public',
        );

        return response()->json([
            'success' => 1,
            'file' => ['url' => asset("storage/{$path}")],
        ]);
    }
}
