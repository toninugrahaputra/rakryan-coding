<?php

namespace App\Actions\Dashboard;

use App\Models\Category;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Enums\OrderStatus;

class GetDashboardStats
{
    public function handle(): array
    {
        $totalPendapatan = (int) Order::where('status', OrderStatus::Paid)->sum('net_amount');

        // Best selling packages (Product)
        $bestSelling = Product::withCount('userSubscriptions')
            ->orderByDesc('user_subscriptions_count')
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'title' => $p->title,
                'sales_count' => $p->user_subscriptions_count,
                'price' => (int) $p->price,
            ]);

        // Latest users
        $latestUsers = User::latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'created_at' => $u->created_at->translatedFormat('d M Y, H:i'),
            ]);

        // Latest orders
        $latestOrders = Order::with(['user', 'product'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'user_name' => $o->user?->name ?? 'User Terhapus',
                'product_title' => $o->product?->title ?? 'Produk Terhapus',
                'net_amount' => (int) $o->net_amount,
                'status' => $o->status->value ?? $o->status,
                'created_at' => $o->created_at->translatedFormat('d M Y, H:i'),
            ]);

        // Database-agnostic historical chart data (last 6 months)
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $months->put($monthDate->format('Y-m'), [
                'label' => $monthDate->translatedFormat('M Y'),
                'sales' => 0,
                'registrations' => 0,
            ]);
        }

        // Aggregate sales
        $salesData = Order::where('status', OrderStatus::Paid)
            ->where('paid_at', '>=', now()->subMonths(5)->startOfMonth())
            ->get(['net_amount', 'paid_at']);

        foreach ($salesData as $order) {
            if ($order->paid_at) {
                $key = $order->paid_at->format('Y-m');
                if ($months->has($key)) {
                    $current = $months->get($key);
                    $current['sales'] += (int) $order->net_amount;
                    $months->put($key, $current);
                }
            }
        }

        // Aggregate registrations
        $usersData = User::where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->get(['created_at']);

        foreach ($usersData as $u) {
            $key = $u->created_at->format('Y-m');
            if ($months->has($key)) {
                $current = $months->get($key);
                $current['registrations'] += 1;
                $months->put($key, $current);
            }
        }

        return [
            'users' => User::count(),
            'courses' => Course::count(),
            'products' => Product::count(),
            'categories' => Category::count(),
            'vouchers' => Voucher::count(),
            'orders' => Order::count(),
            'paid_orders' => Order::where('status', OrderStatus::Paid)->count(),
            'pending_orders' => Order::where('status', OrderStatus::Pending)->count(),
            'total_materi' => CourseContent::count(),
            'total_pendapatan' => $totalPendapatan,
            'best_selling' => $bestSelling->all(),
            'latest_users' => $latestUsers->all(),
            'latest_orders' => $latestOrders->all(),
            'chart_data' => $months->values()->all(),
        ];
    }
}

