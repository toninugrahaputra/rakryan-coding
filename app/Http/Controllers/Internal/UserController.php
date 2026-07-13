<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Role\GetRoleOptions;
use App\Actions\User\CreateUser;
use App\Actions\User\DeleteUser;
use App\Actions\User\GetPaginatedUsers;
use App\Actions\User\GetUserById;
use App\Actions\User\UpdateUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\UserRequest;
use App\Http\Resources\User\UserListResource;
use App\Http\Resources\User\UserShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/users/index', [
            'users' => UserListResource::collection(app(GetPaginatedUsers::class)->handle()),
            'roles' => app(GetRoleOptions::class)->handle(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/users/create', [
            'roles' => app(GetRoleOptions::class)->handle(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        app(CreateUser::class)->handle([
            ...$request->safe()->only(['name', 'email', 'password']),
            'role' => $request->role,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil ditambahkan.']);

        return redirect()->route('internal.users.index');
    }

    public function edit(int $user): Response
    {
        $user = app(GetUserById::class)->handle($user);

        return Inertia::render('internal/users/edit', [
            'user' => new UserShowResource($user),
            'roles' => app(GetRoleOptions::class)->handle(),
        ]);
    }

    public function update(UserRequest $request, int $user): RedirectResponse
    {
        $user = app(GetUserById::class)->handle($user);
        app(UpdateUser::class)->handle($user, [
            ...$request->safe()->only(['name', 'email', 'password']),
            'role' => $request->role,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil diperbarui.']);

        return redirect()->route('internal.users.index');
    }

    public function destroy(int $user): RedirectResponse
    {
        $user = app(GetUserById::class)->handle($user);
        app(DeleteUser::class)->handle($user);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil dihapus.']);

        return redirect()->route('internal.users.index');
    }
}
