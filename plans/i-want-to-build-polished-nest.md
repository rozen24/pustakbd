# QA & Hardening — Admin / Seller Management Subsystem (Boierpata)

## Context

The attached QA prompt asks for a complete, no-assumptions test of the **Admin and Seller
management system**: authentication, authorization, roles, product management, seller order
management, backend API security, an end-to-end workflow, and a PASS/FAIL report with
vulnerabilities and fixes — and "do not mark PASS until Admin, Seller, Product, Order, Role,
and Permission workflows all pass."

This project is the **Boierpata bookstore** (Vite React SPA + a single Supabase KV-backed Hono
edge function; roles: `customer` / `seller` / `admin`). There is **no Node/Express/Prisma
backend and no test runner installed** (only `vite build`). So "the backend" = the edge
function `supabase/functions/server/index.tsx`, and "the database" = the `kv_store_963337f8`
table of namespaced records.

A static audit of the current code (read during planning) already reveals that most
authorization is **not** enforced server-side and several required admin capabilities do not
exist. This plan (a) records those findings as the QA report seed, (b) fixes them so the
workflows actually pass, and (c) adds a lightweight automated API-security test plus a manual
matrix and the required E2E workflow, then produces the final PASS/FAIL report.

## Confirmed findings from the static audit (pre-fix = FAIL)

**Critical — broken access control / IDOR (backend, `supabase/functions/server/index.tsx`):**
- `POST /books`, `PUT /books/:id`, `DELETE /books/:id` only call `requireUserId` — **any**
  authenticated user (a buyer) can create/edit/delete **any** book; Seller A can edit/delete
  Seller B's books by changing the id. No role or ownership check.
- `PUT /orders/:id/status` only calls `requireUserId` — any logged-in user can change any
  order's status (buyer included). No admin/seller-ownership check.
- `GET /orders/:id` has **no auth at all** — anyone (even anonymous) can read any order,
  exposing buyer PII (name, phone, full address).
- `POST /signup` accepts a client-supplied `role` — **privilege escalation**: anyone can
  register `{ role: "admin" }` and become an admin.

**High — missing required admin capabilities (feature gaps):**
- No way for Admin to **create users, create seller accounts, change roles, deactivate /
  delete / reactivate accounts, or list all users**. No endpoints; `AdminCustomers`
  (`admin.tsx:133`) only derives names from orders.
- `AdminCoupons.create` (`admin.tsx:275`) posts to `POST /coupons` which **does not exist** →
  coupon creation 404s.
- `AdminProducts` (`admin.tsx:96`) is read-only — Admin cannot create/edit/delete/publish any
  product as the prompt requires.
- No **publish/unpublish** concept (`Book` has no status field) and no **account
  active/suspended** concept (`Profile` has none), so "suspended supplier cannot sell" is
  unenforceable.
- No secure **initial admin** account and no mechanism to mint one safely.

**High — functional bug (seller product create):**
- `SellerProducts` → `BookFormDialog.save` sends only `{title,price,oldPrice,stock,description,pages}`.
  `POST /books` never sets `sellerId`, `slug`, `authorIds`, `publisherId`, `categoryIds`, so
  the created book (a) never appears in the seller's own filtered list, and (b) has no slug →
  breaks the product detail route and catalog rendering.

**Medium:**
- Single status per order shared across sellers (no per-seller suborders): a seller advancing
  status on a multi-seller order mutates the whole order. Document as design limitation.
- Role changes don't take effect until the affected user re-authenticates (profile is loaded
  at session start). Document + mitigate.
- Frontend guards only (`ProtectedRoute`, `dashboards.tsx`) are correct but must not be the
  only line of defense — backend must enforce (see fixes).

## Fixes to implement (make the workflows pass)

All backend changes are in `supabase/functions/server/index.tsx`; add a small role/ownership
helper set and apply it. Reuse the existing `currentUserId`, `requireUserId`, `loadProfile`,
`isAdmin`, `HttpError`, and `handler` utilities already in that file.

1. **AuthZ helpers + book authorization.** Add `requireRole(c, roles[])` and
   `requireAdmin(c)`. In `POST /books`, force `sellerId` from the caller's profile
   (`sellerId` for sellers; admins may pass one) and generate `slug`, defaulting
   `authorIds/categoryIds/publisherId/images`. In `PUT`/`DELETE /books/:id`, allow only an
   **admin** or the **owning seller** (`book.sellerId === profile.sellerId`); else 403.
2. **Order authorization.** `GET /orders/:id`: require auth; allow only the order's `userId`,
   an admin, or a seller who owns an item in the order. `PUT /orders/:id/status`: allow only
   admin or an owning seller; validate status transitions against the existing flow array
   (reject illegal jumps like `delivered → pending`).
3. **Secure signup + role management.** `POST /signup`: ignore client `role` except allow
   self-select `customer`/`seller`; never allow `admin`. Add admin-only endpoints:
   `GET /admin/users`, `POST /admin/users` (create buyer/seller/admin), `PUT /admin/users/:id/role`,
   `PUT /admin/users/:id/status` (active/suspended), `DELETE /admin/users/:id` — each guarded by
   `requireAdmin`, using `admin.auth.admin.*` for the auth user and a `profile:{id}` record.
4. **Initial admin bootstrap (needs a secret you provide).** Add `POST /admin/bootstrap`
   that promotes a given email to `admin` only when the request carries a matching
   `ADMIN_BOOTSTRAP_SECRET` (stored via the Supabase secret tool). One-time, secure. (I will
   request the secret value from you during implementation — it is the only blocking input.)
5. **Coupons.** Add `POST /coupons` (admin-only) so `AdminCoupons` works.
6. **Account status enforcement.** Add `status: "active" | "suspended"` to `Profile`
   (`src/types/index.ts`, default active). Block suspended sellers from `POST/PUT/DELETE /books`
   and suspended users from order/status writes.
7. **Frontend management UI.** Convert `AdminCustomers` → **AdminUsers** (list users, create
   user/seller, change role, suspend/reactivate/delete) using the new endpoints; add a nav
   item in `dashboards.tsx` (`AdminLayout`). Add create/edit/delete to `AdminProducts` (reuse
   `BookFormDialog` + `services.books`). Fix `BookFormDialog` create to send a complete payload.
   Add admin user-endpoint methods in `src/services/repositories.ts` +
   `src/services/supabase-repositories.ts` (keep the abstraction; single swap point in
   `src/services/index.ts`).
8. **Immediate permission effect.** Surface a "changes take effect on next login" note on
   role/status change, and reuse `AuthContext.refresh()` so the current admin's own view
   updates immediately.

## Test deliverables

- **Automated API-security test** `scripts/api-security-test.mjs` (Node `fetch`, dev-only run):
  for each protected endpoint, assert the correct status for valid admin / valid seller /
  valid buyer / no auth / invalid token / wrong role / another seller's product-or-order id.
  Runs against the deployed edge function using three seeded test accounts. Add
  `npm run test:api`.
- **Manual test matrix** (in the final report) covering the prompt's sections 1–6 with
  positive/negative/permission/boundary cases in the `TC-…` format the prompt specifies.
- **Required E2E workflow**, executed and recorded step-by-step:
  Admin login → create seller → seller login → create product → admin reviews product →
  buyer purchases → seller views order → seller updates status → admin views order — verifying
  UI, permission, KV record, and status change at each step.

## Verification

1. Redeploy the edge function from the Make settings page (required after server edits).
2. Bootstrap the initial admin via `POST /admin/bootstrap` with the provided secret; confirm
   login lands on `/admin` and non-admins are bounced by both the route guard and the API.
3. Run `node scripts/api-security-test.mjs`; all authorization assertions must pass
   (403/401 where expected, 200 only for the authorized role).
4. Walk the E2E workflow in the preview; confirm the seller's new product appears only under
   their account, renders at its slug, and that Seller B cannot touch Seller A's product/order
   via direct id (checked through the API script, not just the UI).
5. Produce the **Final Report**: PASS/FAIL per feature, remaining vulnerabilities (with exact
   reproduction steps), API/DB/permission problems, recommended fixes, and a clear
   **PRODUCTION READY / NOT PRODUCTION READY** verdict per the prompt's quality gate.

## Key files

- `supabase/functions/server/index.tsx` — authz helpers; book/order/coupon/user/bootstrap routes.
- `src/types/index.ts` — `Profile.status` (+ book status if publish/unpublish is added).
- `src/services/repositories.ts`, `src/services/supabase-repositories.ts`, `src/services/index.ts`
  — admin user-management repository methods (preserve abstraction).
- `src/app/components/pages/admin.tsx` — AdminUsers, AdminProducts CRUD, coupon fix.
- `src/app/components/pages/seller.tsx` — complete create payload in `BookFormDialog`.
- `src/app/components/layout/dashboards.tsx` — Admin "Users" nav item.
- `scripts/api-security-test.mjs` (new) + `package.json` script.

## Notes / constraints

- Authorization is enforced in the edge function (single KV table; no SQL RLS available here).
- Edge-function changes require a redeploy from Make settings to take effect.
- The initial-admin bootstrap secret is the only input that must come from you.
- Make is not for real PII/secrets; test accounts use synthetic data and payments stay simulated.
