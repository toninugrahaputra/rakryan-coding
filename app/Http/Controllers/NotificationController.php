<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->get();

        return Inertia::render('notifications/index', [
            'notifications' => $notifications->map(fn ($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'is_read'    => $n->is_read,
                'created_at' => $n->created_at->diffForHumans(),
                'raw_date'   => $n->created_at->toDateString(),
            ]),
        ]);
    }

    public function read(Request $request, Notification $notification): RedirectResponse
    {
        abort_if($notification->user_id !== $request->user()->id, 403);

        $notification->update(['is_read' => true]);

        return back()->with('success', 'Notifikasi ditandai telah dibaca.');
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->notifications()->update(['is_read' => true]);

        return back()->with('success', 'Semua notifikasi ditandai telah dibaca.');
    }
}
