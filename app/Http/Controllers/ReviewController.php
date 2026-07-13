<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Course $course): RedirectResponse
    {
        $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'tags'    => ['nullable', 'array'],
            'comment' => ['nullable', 'string', 'max:500'],
        ]);

        // Cek jika user sudah pernah mengulas course ini
        $existing = Review::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            $existing->update([
                'rating'  => $request->rating,
                'tags'    => $request->tags,
                'comment' => $request->comment,
            ]);
        } else {
            Review::create([
                'user_id'   => $request->user()->id,
                'course_id' => $course->id,
                'rating'    => $request->rating,
                'tags'      => $request->tags,
                'comment'   => $request->comment,
            ]);
        }

        \Inertia\Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ulasan Anda berhasil disimpan!',
        ]);

        return back();
    }
}
