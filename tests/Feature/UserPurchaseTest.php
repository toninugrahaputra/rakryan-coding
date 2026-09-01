<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Services\XenditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserPurchaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
    }

    public function test_user_can_view_checkout_page(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        CourseContent::factory()->count(4)->create(['course_id' => $course->id]);
        $product = Product::factory()->single()->published()->create([
            'price' => 100000,
            'price_strikethrough' => 150000,
        ]);
        $product->courses()->attach($course->id);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['course' => $course->slug]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('course.contents_count', 4)
            ->where('product.courses_count', 1)
            ->where('product.price_strikethrough', 150000)
        );
    }

    public function test_checkout_page_includes_bonus_courses_in_the_product_payload(): void
    {
        $user = User::factory()->create();
        $mainCourse = Course::factory()->create(['is_published' => true]);
        $bonusCourse = Course::factory()->create(['is_published' => true, 'title' => 'Dart Fundamental']);
        $product = Product::factory()->bundle()->published()->create(['price' => 75000]);
        $product->courses()->attach($mainCourse->id, ['is_bonus' => false]);
        $product->courses()->attach($bonusCourse->id, ['is_bonus' => true]);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['course' => $mainCourse->slug]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->has('product.bonus_courses', 1)
            ->where('product.bonus_courses.0.title', 'Dart Fundamental')
        );
    }

    public function test_user_can_view_checkout_page_for_a_source_code_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create([
            'price' => 199000,
            'source_code_path' => 'products/source-code/project.zip',
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['product' => $product->slug]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('course', null)
            ->where('product.courses_count', 0)
            ->where('product.price', 199000)
        );
    }

    public function test_user_cannot_view_checkout_page_for_source_code_product_already_owned(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create(['price' => 199000]);
        $order = Order::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);
        $user->subscriptions()->create(['product_id' => $product->id, 'order_id' => $order->id]);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['product' => $product->slug]));

        $response->assertRedirect(route('source-code.show', $product->slug));
    }

    public function test_free_source_code_order_redirects_to_source_code_show_page(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->sourceCode()->published()->create(['price' => 0]);

        $response = $this->actingAs($user)
            ->post(route('orders.store'), [
                'product_id' => $product->id,
            ]);

        $response->assertRedirect(route('source-code.show', $product->slug));
        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_checkout_page_never_exposes_a_default_voucher(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        Voucher::factory()->flat(20000)->create([
            'code' => 'PROMOAKTIF',
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeek(),
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['course' => $course->slug]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->missing('defaultVoucherCode')
        );
    }

    public function test_order_is_not_discounted_unless_user_explicitly_submits_a_voucher_code(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->single()->published()->create(['price' => 100000]);

        // Voucher aktif ada di sistem, tapi user tidak pernah mengirim voucher_code
        // saat checkout — order harus dibuat dengan harga penuh, bukan otomatis didiskon.
        Voucher::factory()->flat(100000)->create([
            'code' => 'PROMOAKTIF',
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeek(),
        ]);

        $response = $this->actingAs($user)
            ->post(route('orders.store'), [
                'product_id' => $product->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'discount_amount' => 0,
            'net_amount' => 100000,
            'status' => 'pending',
        ]);
        $this->assertDatabaseMissing('user_subscriptions', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_cannot_view_checkout_page_if_already_purchased(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // Langsung daftarkan user ke subskripsi product ini
        $user->subscriptions()->create([
            'product_id' => $product->id,
            'order_id' => $order->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.create', ['course' => $course->slug]));

        $response->assertRedirect(route('courses.show', $course->slug));
    }

    public function test_user_can_place_order_and_gets_payment_url(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $response = $this->actingAs($user)
            ->post(route('orders.store'), [
                'product_id' => $product->id,
            ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals($user->id, $order->user_id);
        $this->assertEquals(OrderStatus::Pending, $order->status);
        $this->assertNotNull($order->payment_url);
        $this->assertNotNull($order->valid_until);
        $this->assertNotNull($order->payment_metadata);

        $response->assertRedirect(route('orders.show', $order->id));
    }

    public function test_order_and_voucher_redemption_roll_back_when_xendit_invoice_creation_fails(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);
        $voucher = Voucher::factory()->flat(20000)->create();

        $this->mock(XenditService::class, function ($mock) {
            $mock->shouldReceive('createInvoice')->once()->andThrow(new \Exception('Xendit sedang gangguan'));
        });

        $response = $this->actingAs($user)
            ->post(route('orders.store'), [
                'product_id' => $product->id,
                'voucher_code' => $voucher->code,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('voucher_usages', 0);
        $this->assertEquals(0, $voucher->fresh()->usage_count);
    }

    public function test_paid_order_show_page_includes_course_content_count(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        CourseContent::factory()->count(3)->create(['course_id' => $course->id]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->paid()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('orders.show', $order->id));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('order.product.courses.0.contents_count', 3)
        );
    }

    public function test_paid_order_show_page_flags_bonus_courses_via_pivot(): void
    {
        $user = User::factory()->create();
        $mainCourse = Course::factory()->create(['is_published' => true]);
        $bonusCourse = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->bundle()->published()->create(['price' => 100000]);
        $product->courses()->attach($mainCourse->id, ['is_bonus' => false]);
        $product->courses()->attach($bonusCourse->id, ['is_bonus' => true]);

        $order = Order::factory()->paid()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('orders.show', $order->id));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('order.product.courses.0.pivot.is_bonus', false)
            ->where('order.product.courses.1.pivot.is_bonus', true)
        );
    }

    public function test_order_show_page_flags_a_valid_signed_return_from_xendit(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $signedUrl = URL::temporarySignedRoute('orders.show', now()->addDays(2), ['order' => $order->id]);

        $response = $this->actingAs($user)->get($signedUrl);

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('justReturnedFromXendit', true)
        );
    }

    public function test_order_show_page_does_not_flag_a_plain_visit_as_returning_from_xendit(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('orders.show', $order->id));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('justReturnedFromXendit', false)
        );
    }

    public function test_orders_index_shows_the_actual_voucher_code_and_channel_used(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);
        $voucher = Voucher::factory()->flat(20000)->create(['code' => 'NGODING26']);

        $this->actingAs($user)->post(route('orders.store'), [
            'product_id' => $product->id,
            'voucher_code' => $voucher->code,
        ]);

        $response = $this->actingAs($user)->get(route('orders.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('orders.data.0.voucher_usage.voucher.code', 'NGODING26')
            ->where('orders.data.0.channel_name', 'Xendit Gateway')
        );
    }

    public function test_orders_index_exposes_course_cover_as_a_full_url(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'is_published' => true,
            'thumbnail' => 'courses/cover.jpg',
        ]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $this->actingAs($user)->post(route('orders.store'), [
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('orders.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where(
                'orders.data.0.product.courses.0.thumbnail',
                Storage::disk('public')->url('courses/cover.jpg'),
            )
        );
    }

    public function test_orders_index_keeps_thumbnail_correct_for_multiple_orders_of_the_same_product(): void
    {
        // Orders sharing the same product_id share the same Eloquent Product/Course
        // instance under eager loading — this guards against the thumbnail URL getting
        // mutated (and doubled up) once per order that references the same course.
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'is_published' => true,
            'thumbnail' => 'courses/cover.jpg',
        ]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        Order::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);
        Order::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);
        Order::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('orders.index'));

        $expectedUrl = Storage::disk('public')->url('courses/cover.jpg');
        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('orders.data.0.product.courses.0.thumbnail', $expectedUrl)
            ->where('orders.data.1.product.courses.0.thumbnail', $expectedUrl)
            ->where('orders.data.2.product.courses.0.thumbnail', $expectedUrl)
        );
    }

    public function test_orders_index_leaves_cover_null_when_course_has_no_thumbnail(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'is_published' => true,
            'thumbnail' => null,
        ]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $this->actingAs($user)->post(route('orders.store'), [
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('orders.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('orders.data.0.product.courses.0.thumbnail', null)
        );
    }

    public function test_user_can_apply_voucher_successfully(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);
        $voucher = Voucher::factory()->flat(20000)->create();

        $response = $this->actingAs($user)
            ->postJson(route('orders.apply-voucher'), [
                'voucher_code' => $voucher->code,
                'product_id' => $product->id,
            ]);

        $response->assertOk()
            ->assertJson([
                'valid' => true,
                'discount' => 20000,
            ]);
    }

    public function test_xendit_webhook_callback_successfully_activates_subscription(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        // Buat order pending
        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'net_amount' => 100000,
        ]);

        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
                'amount' => 100000,
            ]);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
        ]);
    }

    public function test_xendit_webhook_callback_requires_valid_token_if_configured(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        // Buat order pending
        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // Kirim tanpa token -> 401
        $response = $this->postJson(route('webhooks.xendit'), [
            'external_id' => $order->order_number,
            'status' => 'PAID',
        ]);
        $response->assertStatus(401);

        // Kirim dengan token salah -> 401
        $response = $this->withHeaders(['x-callback-token' => 'wrong-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
            ]);
        $response->assertStatus(401);

        // Kirim dengan token benar -> 200
        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
            ]);
        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
    }

    public function test_duplicate_paid_webhook_is_idempotent_and_does_not_error(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'net_amount' => 100000,
        ]);

        $payload = [
            'external_id' => $order->order_number,
            'status' => 'PAID',
            'amount' => 100000,
        ];

        // Kiriman pertama: memproses & meng-approve order seperti biasa
        $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), $payload)
            ->assertOk();

        // Kiriman kedua (retry/duplicate dari Xendit): harus tetap 200, bukan 500
        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), $payload);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
        $this->assertDatabaseCount('user_subscriptions', 1);
    }

    public function test_paid_webhook_for_already_cancelled_order_does_not_auto_approve(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'status' => OrderStatus::Cancel,
        ]);

        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'PAID',
                'amount' => 100000,
            ]);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Cancel, $order->fresh()->status);
        $this->assertDatabaseCount('user_subscriptions', 0);
    }

    public function test_expired_webhook_marks_pending_order_as_expired(): void
    {
        config(['services.xendit.callback_token' => 'secure-token']);

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->withHeaders(['x-callback-token' => 'secure-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $order->order_number,
                'status' => 'EXPIRED',
            ]);

        $response->assertOk();
        $this->assertEquals(OrderStatus::Expired, $order->fresh()->status);
    }

    public function test_order_self_approval_via_mock_pay_works_in_local_or_testing_env(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.show', [$order->id, 'mock_pay' => '1']));

        $response->assertOk();
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
    }

    public function test_order_self_approval_via_mock_pay_does_not_work_in_production_env(): void
    {
        // Mock the environment to production
        $this->app->detectEnvironment(fn () => 'production');

        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('orders.show', [$order->id, 'mock_pay' => '1']));

        $response->assertOk();
        $this->assertEquals(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_user_can_cancel_own_pending_order(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->patch(route('orders.cancel', $order->id));

        $response->assertRedirect();
        $this->assertEquals(OrderStatus::Cancel, $order->fresh()->status);
    }

    public function test_cancelling_an_order_releases_its_voucher_usage(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->single()->published()->create(['price' => 100000]);

        $voucher = Voucher::factory()->flat(20000)->create(['usage_count' => 1, 'per_user_limit' => 1]);
        $order = Order::factory()->pending()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
        $usage = $voucher->usages()->create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'discount_amount' => 20000,
        ]);

        $this->actingAs($user)->patch(route('orders.cancel', $order->id));

        $this->assertEquals(0, $voucher->fresh()->usage_count);
        $this->assertDatabaseMissing('voucher_usages', ['id' => $usage->id]);
    }

    public function test_user_cannot_cancel_another_users_order(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->pending()->create([
            'user_id' => $otherUser->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)
            ->patch(route('orders.cancel', $order->id));

        $response->assertStatus(403);
        $this->assertEquals(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_user_cannot_cancel_an_already_paid_order(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['is_published' => true]);
        $product = Product::factory()->single()->published()->create(['price' => 100000]);
        $product->courses()->attach($course->id);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'status' => OrderStatus::Paid,
        ]);

        $response = $this->actingAs($user)
            ->patch(route('orders.cancel', $order->id));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertEquals(OrderStatus::Paid, $order->fresh()->status);
    }
}
