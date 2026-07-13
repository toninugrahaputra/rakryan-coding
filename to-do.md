# Implementation Plan: Free Preview Modules & Course Access Control (Revised)

We want to implement a flexible free preview mechanism and access control rules for courses based on their price:
1. **Free Course Preview (Pure Free Course):**
   - A course is "pure free" if it is associated with a product of price = 0.
   - For a pure free course, guest users (unauthenticated) can preview/read the first 3 published modules.
   - Guests will be prompted to login to read the remaining modules (4+).
   - Once logged in, any user gets full access to all modules of a free course.
2. **Paid Course Access (Course with price > 0):**
   - Paid courses are fully locked for non-purchased users (from module 1 onwards).
   - Guests will be prompted to login, and logged-in users must have purchased the course (have `UserSubscription`) to access any content.

---

## User Review Required

> [!IMPORTANT]
> - Paid courses will remain 100% locked for anyone who has not purchased them.
> - Only courses with a price of 0 will allow previewing the first 3 modules without login.

---

## Proposed Changes

### Backend Route changes

#### [MODIFY] [web.php](file:///Users/macbookairm12020/Rakryan/rakryan-coding-2/routes/web.php)
- Move the `courses.contents.show` route out of the `auth` middleware group so guests can access the preview modules. Keep the `courses.contents.complete` route protected inside `auth`.

### Controller & Action updates

#### [MODIFY] [CourseContentController.php](file:///Users/macbookairm12020/Rakryan/rakryan-coding-2/app/Http/Controllers/CourseContentController.php)
- Update `show` method:
  - Determine if the course is free (`isFreeCourse`) and if the content is a free preview (first 3 modules).
  - Enforce access rules: allow access if free course + preview, or free course + logged in, or paid course + purchased.
  - Pass `isPurchased` and `isFree` status to the Inertia page.
  - Safely handle progress calculation so it doesn't query progress for guest users.
- Update `complete` method:
  - Safely check if the user is authorized before saving progress.

#### [MODIFY] [HasPurchasedCourse.php](file:///Users/macbookairm12020/Rakryan/rakryan-coding-2/app/Actions/User/HasPurchasedCourse.php)
- Support nullable `$user` parameter and return `true` immediately if the course is free (associated with a product of price 0) for logged-in users.

### Frontend updates

#### [MODIFY] [courses/show.tsx](file:///Users/macbookairm12020/Rakryan/rakryan-coding-2/resources/js/pages/courses/show.tsx)
- Render the `Mulai Belajar` link button for modules:
  - If `isPurchased` is true.
  - If it is a free course and user is logged in.
  - If it is a free course and the module is within the first 3 modules (index < 3) (guest preview).
- Otherwise, render the lock icon.

#### [MODIFY] [courses/contents/show.tsx](file:///Users/macbookairm12020/Rakryan/rakryan-coding-2/resources/js/pages/courses/contents/show.tsx)
- Detect user login status (`isLoggedIn`).
- Render "Mode Preview" or hide progress indicator for guest users.
- Hide or replace the complete button:
  - If guest: show "Login untuk melanjutkan belajar ➔" button linking to `/login`.
  - If logged in but hasn't purchased (and it's a paid course): show "Beli Kelas Ini untuk Mengakses Semua Materi ➔" button.
- Lock lessons in the sidebar that the user does not have access to (showing lock icon instead of order badge).

---

## Verification Plan

### Automated Tests
- Run `php artisan test` to check that existing tests continue to pass.
- Write new feature test cases verifying:
  - Guest user can read modules 1-3 of a free course, but gets redirected on module 4.
  - Guest user gets redirected on module 1 of a paid course.
  - Logged-in user without purchase can read modules 1-3 of a free course, and all modules of a free course.
  - Logged-in user without purchase gets blocked on module 1 of a paid course.

### Manual Verification
- Compile assets (`npm run build`).
- Verify guest user experience: opening a free course, seeing first 3 modules unlocked, clicking one to preview, seeing others locked. Opening a paid course, seeing all modules locked.
