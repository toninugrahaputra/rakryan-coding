<?php

namespace App\Http\Controllers;

use App\Actions\User\CompleteOnboarding;
use App\Enums\OnboardingStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->onboarded_at !== null) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding/show');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'region' => ['required', 'string', 'max:255'],
            'info_source' => ['required', 'string', 'max:255'],
            'status' => ['required', new Enum(OnboardingStatus::class)],
            'additional_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        app(CompleteOnboarding::class)->handle($request->user(), $request->only([
            'region', 'info_source', 'status', 'additional_notes',
        ]));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Terima kasih! Data kamu sudah tersimpan.',
        ]);

        return redirect()->intended(route('dashboard'));
    }
}
