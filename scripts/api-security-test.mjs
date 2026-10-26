// Backend API authorization test for the Boierpata edge function.
//
// This exercises the server's authorization directly (NOT the frontend route
// guards), asserting the correct HTTP status for each role against each
// protected endpoint: valid admin / seller / buyer / no auth / invalid token /
// wrong role / another user's id / another seller's product-or-order id.
//
// Usage (against the deployed edge function):
//   PROJECT_ID=xxxx ANON_KEY=xxxx ADMIN_BOOTSTRAP_SECRET=xxxx \
//     node scripts/api-security-test.mjs
//
// It provisions synthetic accounts (admin via bootstrap, two sellers, one
// buyer), seeds a product per seller, places an order, then runs the matrix.
// All data is synthetic; payments are simulated.

const PROJECT_ID = process.env.PROJECT_ID || "txwtjrdsbgjnjcdcuuvh";
const ANON_KEY = process.env.ANON_KEY || process.env.SUPABASE_ANON_KEY;
const BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET;
const SUPA = `https://${PROJECT_ID}.supabase.co`;
const BASE = `${SUPA}/functions/v1/make-server-963337f8`;

if (!ANON_KEY) {
  console.error("Set ANON_KEY (the public anon key) in the environment.");
  process.exit(1);
}

let passed = 0, failed = 0;
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name} — ${detail}`); }
}

// Assert an API call returns one of the expected statuses.
async function expect(name, { method = "GET", path, token, body, anon = true }, expected) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (anon) headers.Authorization = `Bearer ${ANON_KEY}`;
  let status = 0, text = "";
  try {
    const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    status = res.status;
    text = await res.text();
  } catch (err) {
    record(name, false, `request error: ${err.message}`);
    return { status: 0, text: "" };
  }
  const list = Array.isArray(expected) ? expected : [expected];
  record(name, list.includes(status), `expected ${list.join("/")}, got ${status} ${text.slice(0, 120)}`);
  return { status, text };
}

// Supabase password sign-in -> access token.
async function signIn(email, password) {
  const res = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`sign-in failed for ${email}: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function api(path, { method = "POST", token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ANON_KEY}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

const stamp = Date.now();
const accounts = {
  admin: { name: "QA Admin", email: `qa.admin.${stamp}@example.com`, password: "Passw0rd!123", role: "customer" },
  sellerA: { name: "QA Seller A", email: `qa.sellerA.${stamp}@example.com`, password: "Passw0rd!123", role: "seller" },
  sellerB: { name: "QA Seller B", email: `qa.sellerB.${stamp}@example.com`, password: "Passw0rd!123", role: "seller" },
  buyer: { name: "QA Buyer", email: `qa.buyer.${stamp}@example.com`, password: "Passw0rd!123", role: "customer" },
};

async function main() {
  console.log(`\nBoierpata API security test\nBASE=${BASE}\n`);

  // --- Provision accounts via public signup (customer/seller only) ---
  console.log("Provisioning synthetic accounts...");
  for (const key of Object.keys(accounts)) {
    const a = accounts[key];
    const r = await api("/signup", { body: a });
    if (r.status !== 200 && !(r.json?.error || "").includes("already")) {
      console.log(`  note: signup ${a.email} -> ${r.status} ${JSON.stringify(r.json).slice(0, 100)}`);
    }
  }

  // --- Privilege-escalation check: signup must NOT grant admin ---
  const escEmail = `qa.escalate.${stamp}@example.com`;
  await api("/signup", { body: { name: "Escalator", email: escEmail, password: "Passw0rd!123", role: "admin" } });
  const escToken = await signIn(escEmail, "Passw0rd!123").catch(() => null);
  if (escToken) {
    const prof = await api("/profile/ensure", { token: escToken });
    record("signup cannot self-grant admin", prof.json?.role !== "admin", `role was ${prof.json?.role}`);
  }

  // --- Bootstrap the admin (requires the secret) ---
  if (BOOTSTRAP_SECRET) {
    const b = await api("/admin/bootstrap", { body: { email: accounts.admin.email, secret: BOOTSTRAP_SECRET } });
    record("admin bootstrap with valid secret", b.status === 200, `got ${b.status} ${JSON.stringify(b.json).slice(0, 120)}`);
    const bad = await api("/admin/bootstrap", { body: { email: accounts.admin.email, secret: "wrong" } });
    record("admin bootstrap rejects bad secret", bad.status === 403, `got ${bad.status}`);
  } else {
    console.log("  (skip bootstrap: no ADMIN_BOOTSTRAP_SECRET provided)");
  }

  // --- Sign in everyone ---
  const tok = {};
  for (const key of Object.keys(accounts)) {
    tok[key] = await signIn(accounts[key].email, accounts[key].password).catch((e) => { console.log("  " + e.message); return null; });
  }
  // Ensure profiles exist.
  for (const key of Object.keys(tok)) if (tok[key]) await api("/profile/ensure", { token: tok[key] });

  const adminOk = BOOTSTRAP_SECRET && tok.admin;

  // --- Seed one product per seller ---
  const pA = await api("/books", { token: tok.sellerA, body: { title: `QA Book A ${stamp}`, price: 100, stock: 5 } });
  const pB = await api("/books", { token: tok.sellerB, body: { title: `QA Book B ${stamp}`, price: 200, stock: 5 } });
  const bookA = pA.json, bookB = pB.json;
  record("seller can create own product", pA.status === 200 && !!bookA.id, `got ${pA.status}`);
  record("created product gets slug + sellerId", !!bookA.slug && !!bookA.sellerId, JSON.stringify(bookA).slice(0, 120));

  console.log("\n[1] Product authorization");
  await expect("buyer CANNOT create product", { method: "POST", path: "/books", token: tok.buyer, body: { title: "x", price: 1 } }, 403);
  await expect("no-auth CANNOT create product", { method: "POST", path: "/books", token: null, body: { title: "x", price: 1 } }, [401, 403]);
  await expect("invalid token CANNOT create product", { method: "POST", path: "/books", token: "not.a.jwt", body: { title: "x", price: 1 } }, [401, 403]);
  if (bookB.id) {
    await expect("Seller A CANNOT edit Seller B product (IDOR)", { method: "PUT", path: `/books/${bookB.id}`, token: tok.sellerA, body: { price: 1 } }, 403);
    await expect("Seller A CANNOT delete Seller B product (IDOR)", { method: "DELETE", path: `/books/${bookB.id}`, token: tok.sellerA }, 403);
  }
  if (bookA.id) {
    await expect("Seller A CAN edit own product", { method: "PUT", path: `/books/${bookA.id}`, token: tok.sellerA, body: { price: 111 } }, 200);
    if (adminOk) await expect("Admin CAN edit any product", { method: "PUT", path: `/books/${bookB.id}`, token: tok.admin, body: { price: 222 } }, 200);
  }

  console.log("\n[2] Order authorization");
  const ord = await api("/orders", { token: tok.buyer, body: {
    items: [{ bookId: bookA.id, title: bookA.title, coverUrl: "", price: 100, quantity: 1 }],
    subtotal: 100, shipping: 0, discount: 0, total: 100, paymentMethod: "cod",
    address: { id: "a1", label: "Home", fullName: "QA Buyer", phone: "0000", district: "D", area: "A", street: "S", isDefault: true },
  } });
  const orderId = ord.json?.id;
  record("buyer can place order", ord.status === 200 && !!orderId, `got ${ord.status}`);
  if (orderId) {
    await expect("no-auth CANNOT read order (PII)", { path: `/orders/${orderId}`, token: null }, [401, 403]);
    await expect("unrelated seller CANNOT read order", { path: `/orders/${orderId}`, token: tok.sellerB }, 403);
    await expect("buyer CAN read own order", { path: `/orders/${orderId}`, token: tok.buyer }, 200);
    await expect("owning seller CAN read order", { path: `/orders/${orderId}`, token: tok.sellerA }, 200);
    await expect("buyer CANNOT change order status", { method: "PUT", path: `/orders/${orderId}/status`, token: tok.buyer, body: { status: "confirmed" } }, 403);
    await expect("unrelated seller CANNOT change status", { method: "PUT", path: `/orders/${orderId}/status`, token: tok.sellerB, body: { status: "confirmed" } }, 403);
    await expect("owning seller CAN advance status", { method: "PUT", path: `/orders/${orderId}/status`, token: tok.sellerA, body: { status: "confirmed" } }, 200);
    await expect("illegal status jump rejected", { method: "PUT", path: `/orders/${orderId}/status`, token: tok.sellerA, body: { status: "pending" } }, 400);
  }

  console.log("\n[3] Admin-only endpoints");
  await expect("buyer CANNOT list all orders", { path: "/orders", token: tok.buyer }, 403);
  await expect("buyer CANNOT list users", { path: "/admin/users", token: tok.buyer }, 403);
  await expect("seller CANNOT list users", { path: "/admin/users", token: tok.sellerA }, 403);
  await expect("no-auth CANNOT list users", { path: "/admin/users", token: null }, [401, 403]);
  await expect("buyer CANNOT create coupon", { method: "POST", path: "/coupons", token: tok.buyer, body: { code: "X", value: 5 } }, 403);
  if (adminOk) {
    await expect("admin CAN list users", { path: "/admin/users", token: tok.admin }, 200);
    await expect("admin CAN list all orders", { path: "/orders", token: tok.admin }, 200);
    await expect("admin CAN create coupon", { method: "POST", path: "/coupons", token: tok.admin, body: { code: `QA${stamp}`, type: "percent", value: 10 } }, 200);
    await expect("admin CANNOT change own role", { method: "PUT", path: `/admin/users/${ord.json?.userId || "self"}/role`, token: tok.admin, body: { role: "customer" } }, [400, 404]);
  }

  console.log(`\n=== ${passed} passed, ${failed} failed ===`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
