<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Product\GetProductOptions;
use App\Actions\Voucher\CreateVoucher;
use App\Actions\Voucher\DeleteVoucher;
use App\Actions\Voucher\GetPaginatedVouchers;
use App\Actions\Voucher\GetVoucherByCode;
use App\Actions\Voucher\UpdateVoucher;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\VoucherRequest;
use App\Http\Resources\Voucher\VoucherListResource;
use App\Http\Resources\Voucher\VoucherShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/vouchers/index', [
            'vouchers' => VoucherListResource::collection(app(GetPaginatedVouchers::class)->handle()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/vouchers/create', [
            'products' => app(GetProductOptions::class)->handle(),
        ]);
    }

    public function store(VoucherRequest $request): RedirectResponse
    {
        app(CreateVoucher::class)->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Voucher berhasil ditambahkan.']);

        return redirect()->route('internal.vouchers.index');
    }

    public function edit(string $voucher): Response
    {
        $voucher = app(GetVoucherByCode::class)->handle($voucher);
        $voucher->load('products');

        return Inertia::render('internal/vouchers/edit', [
            'voucher' => new VoucherShowResource($voucher),
            'products' => app(GetProductOptions::class)->handle(),
        ]);
    }

    public function update(VoucherRequest $request, string $voucher): RedirectResponse
    {
        $voucher = app(GetVoucherByCode::class)->handle($voucher);
        app(UpdateVoucher::class)->handle($voucher, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Voucher berhasil diperbarui.']);

        return redirect()->route('internal.vouchers.index');
    }

    public function destroy(string $voucher): RedirectResponse
    {
        $voucher = app(GetVoucherByCode::class)->handle($voucher);
        app(DeleteVoucher::class)->handle($voucher);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Voucher berhasil dihapus.']);

        return redirect()->route('internal.vouchers.index');
    }
}
