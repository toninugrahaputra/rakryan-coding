<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Order\ApproveOrder;
use App\Actions\Order\CancelOrder;
use App\Actions\Order\CreateOrder;
use App\Actions\Order\DeleteOrder;
use App\Actions\Order\GetOrderByNumber;
use App\Actions\Order\GetPaginatedOrders;
use App\Actions\Order\UpdateOrder;
use App\Actions\Product\GetProductOptions;
use App\Actions\User\GetUserOptions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\OrderRequest;
use App\Http\Requests\Internal\UpdateOrderRequest;
use App\Http\Resources\Order\OrderListResource;
use App\Http\Resources\Order\OrderShowResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'channel_group']);

        return Inertia::render('internal/orders/index', [
            'orders' => OrderListResource::collection(app(GetPaginatedOrders::class)->handle($filters)),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/orders/create', [
            'users' => app(GetUserOptions::class)->handle(),
            'products' => app(GetProductOptions::class)->handle(),
        ]);
    }

    public function store(OrderRequest $request): RedirectResponse
    {
        app(CreateOrder::class)->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order berhasil dibuat.']);

        return redirect()->route('internal.orders.index');
    }

    public function show(string $order): Response
    {
        $order = app(GetOrderByNumber::class)->handle($order);
        $order->load(['user', 'product', 'approvedBy']);

        return Inertia::render('internal/orders/show', [
            'order' => new OrderShowResource($order),
        ]);
    }

    public function approve(string $order): RedirectResponse
    {
        $order = app(GetOrderByNumber::class)->handle($order);
        app(ApproveOrder::class)->handle($order, auth()->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order berhasil disetujui. Akses user telah diberikan.']);

        return redirect()->route('internal.orders.show', $order->order_number);
    }

    public function cancel(string $order): RedirectResponse
    {
        $order = app(GetOrderByNumber::class)->handle($order);
        app(CancelOrder::class)->handle($order);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order berhasil dibatalkan.']);

        return redirect()->route('internal.orders.show', $order->order_number);
    }

    public function edit(string $order): Response
    {
        $order = app(GetOrderByNumber::class)->handle($order);
        abort_if($order->status->value !== 'pending', 403);
        $order->load(['user', 'product']);

        return Inertia::render('internal/orders/edit', [
            'order' => new OrderShowResource($order),
        ]);
    }

    public function update(UpdateOrderRequest $request, string $order): RedirectResponse
    {
        $order = app(GetOrderByNumber::class)->handle($order);
        app(UpdateOrder::class)->handle($order, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order berhasil diperbarui.']);

        return redirect()->route('internal.orders.show', $order->order_number);
    }

    public function destroy(string $order): RedirectResponse
    {
        $order = app(GetOrderByNumber::class)->handle($order);
        app(DeleteOrder::class)->handle($order);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order berhasil dihapus.']);

        return redirect()->route('internal.orders.index');
    }
}
