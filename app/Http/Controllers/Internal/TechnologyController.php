<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Technology\CreateTechnology;
use App\Actions\Technology\DeleteTechnology;
use App\Actions\Technology\GetPaginatedTechnologies;
use App\Actions\Technology\GetTechnologyBySlug;
use App\Actions\Technology\UpdateTechnology;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\TechnologyRequest;
use App\Http\Resources\Technology\TechnologyListResource;
use App\Http\Resources\Technology\TechnologyShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TechnologyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/technologies/index', [
            'technologies' => TechnologyListResource::collection(app(GetPaginatedTechnologies::class)->handle()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/technologies/create');
    }

    public function store(TechnologyRequest $request): RedirectResponse
    {
        app(CreateTechnology::class)->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tool berhasil ditambahkan.']);

        return redirect()->route('internal.technologies.index');
    }

    public function edit(string $technology): Response
    {
        $technology = app(GetTechnologyBySlug::class)->handle($technology);

        return Inertia::render('internal/technologies/edit', [
            'technology' => new TechnologyShowResource($technology),
        ]);
    }

    public function update(TechnologyRequest $request, string $technology): RedirectResponse
    {
        $technology = app(GetTechnologyBySlug::class)->handle($technology);
        app(UpdateTechnology::class)->handle($technology, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tool berhasil diperbarui.']);

        return redirect()->route('internal.technologies.index');
    }

    public function destroy(string $technology): RedirectResponse
    {
        $technology = app(GetTechnologyBySlug::class)->handle($technology);
        app(DeleteTechnology::class)->handle($technology);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tool berhasil dihapus.']);

        return redirect()->route('internal.technologies.index');
    }
}
