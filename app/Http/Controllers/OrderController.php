<?php

namespace App\Http\Controllers;

use App\Actions\Order\ApproveOrder;
use App\Actions\Order\CreateOrder;
use App\Actions\User\HasPurchasedCourse;
use App\Actions\Voucher\ApplyVoucher;
use App\Actions\Voucher\RedeemVoucher;
use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $courseSlug = $request->query('course');
        if (! $courseSlug) {
            return redirect()->route('courses.index')->with('error', 'Pilih course terlebih dahulu.');
        }

        $course = Course::where('slug', $courseSlug)->where('is_published', true)->firstOrFail();

        // Cek jika sudah membeli
        $hasPurchased = app(HasPurchasedCourse::class)->handle($request->user(), $course);
        if ($hasPurchased) {
            return redirect()->route('courses.show', $course->slug)->with('error', 'Anda sudah memiliki course ini.');
        }

        $product = $course->products()->where('is_published', true)->orderBy('price')->first();
        if (! $product) {
            return redirect()->route('courses.show', $course->slug)->with('error', 'Course belum tersedia untuk dibeli.');
        }

        return Inertia::render('orders/create', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail' => $course->thumbnail ? Storage::disk('public')->url($course->thumbnail) : null,
            ],
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'price' => $product->price,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'voucher_code' => 'nullable|string',
        ]);

        $product = Product::findOrFail($request->product_id);
        $user = $request->user();

        // Hitung diskon voucher
        $discount = 0;
        $voucher = null;
        if ($request->voucher_code) {
            $result = app(ApplyVoucher::class)->handle($request->voucher_code, $product, $user);
            $voucher = $result['voucher'];
            $discount = $result['discount'];
        }

        $netAmount = max(0, $product->price - $discount);

        // Buat Order
        $order = app(CreateOrder::class)->handle([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'channel_group' => 'Xendit',
            'channel_code' => 'Invoice',
            'channel_name' => 'Xendit Gateway',
            'payment_fee' => 0,
            'total_amount' => $netAmount,
        ]);

        // Simpan diskon ke order
        if ($discount > 0) {
            $order->update([
                'discount_amount' => $discount,
                'net_amount' => $netAmount,
            ]);
        }

        // Catat penggunaan voucher jika ada
        if ($voucher) {
            app(RedeemVoucher::class)->handle($voucher, $user, $discount, $order);
        }

        // Jika harga net Rp 0 (Gratis)
        if ($netAmount === 0) {
            $adminUser = User::role('admin')->first() ?? User::first();
            if ($adminUser) {
                app(ApproveOrder::class)->handle($order, $adminUser);
            }

            return redirect()->route('courses.show', $product->courses->first()->slug)
                ->with('success', 'Pendaftaran course gratis berhasil!');
        }

        // Panggil Xendit Invoice
        try {
            $xenditInvoice = app(XenditService::class)->createInvoice($order, $user->email, $product->title);
            $order->update([
                'payment_url' => $xenditInvoice['invoice_url'],
                'payment_reference' => $xenditInvoice['id'],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses pembayaran: '.$e->getMessage());
        }

        return redirect()->route('orders.show', $order->id);
    }

    public function index(Request $request): Response
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('product.courses')
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order, Request $request): Response|RedirectResponse
    {
        if ($order->user_id !== $request->user()->id && ! $request->user()->hasRole('admin')) {
            abort(403);
        }

        // Simulasi Pembayaran Mock untuk Testing / Local
        if (app()->environment('local', 'testing') && $request->query('mock_pay') == '1' && $order->status === OrderStatus::Pending) {
            $adminUser = User::role('admin')->first() ?? User::first();
            if ($adminUser) {
                app(ApproveOrder::class)->handle($order, $adminUser);
                $order->refresh();
            }
        }

        $order->load(['product.courses']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    public function applyVoucher(Request $request): JsonResponse
    {
        $request->validate([
            'voucher_code' => 'required|string',
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);

        try {
            $result = app(ApplyVoucher::class)->handle($request->voucher_code, $product, $request->user());

            return response()->json([
                'valid' => true,
                'discount' => $result['discount'],
                'message' => 'Voucher berhasil diterapkan!',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'valid' => false,
                'message' => $e->validator->errors()->first('voucher_code'),
            ], 422);
        }
    }
}
