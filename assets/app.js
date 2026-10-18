// Shared code for every page: data access (live Supabase or demo), cart, layout, helpers.
(function () {
  var C = window.STORE_CONFIG || {};
  var CAT = window.CATALOG || [];
  var LIVE = !!(C.supabaseUrl && C.supabaseAnonKey);
  var A = (window.A = { C: C, CAT: CAT, LIVE: LIVE });

  var ICONS = {
    laptop:'<rect x="14" y="14" width="36" height="26" rx="2"/><path d="M7 46h50l-4 6H11z"/>',
    desktop:'<rect x="8" y="10" width="48" height="32" rx="3"/><path d="M26 54h12M32 42v12"/>',
    printer:'<rect x="18" y="8" width="28" height="14"/><rect x="8" y="22" width="48" height="22" rx="3"/><rect x="18" y="36" width="28" height="20"/>',
    scanner:'<rect x="6" y="32" width="52" height="16" rx="3"/><path d="M12 32l6-12h28l6 12M14 40h8"/>',
    copier:'<rect x="8" y="26" width="48" height="26" rx="3"/><rect x="14" y="12" width="36" height="14"/><path d="M14 40h36"/>',
    projector:'<rect x="6" y="24" width="38" height="22" rx="3"/><circle cx="31" cy="35" r="7"/><path d="M48 30l10-6v22l-10-6z"/>',
    ink:'<path d="M32 8S17 27 17 38a15 15 0 0 0 30 0C47 27 32 8 32 8z"/><path d="M25 40a7 7 0 0 0 7 7"/>',
    monitor:'<rect x="6" y="10" width="52" height="34" rx="3"/><path d="M22 54h20M32 44v10"/>',
    keyboard:'<rect x="5" y="18" width="54" height="30" rx="4"/><path d="M13 27h4M23 27h4M33 27h4M43 27h8M13 34h4M23 34h4M33 34h4M43 34h8M20 41h24"/>',
    webcam:'<circle cx="32" cy="24" r="16"/><circle cx="32" cy="24" r="6"/><path d="M22 56h20M32 40v16"/>',
    hdd:'<rect x="8" y="12" width="48" height="40" rx="5"/><circle cx="30" cy="32" r="11"/><circle cx="30" cy="32" r="2"/><path d="M42 44l-6-8"/>',
    ssd:'<rect x="10" y="16" width="44" height="32" rx="4"/><rect x="18" y="24" width="12" height="16"/><rect x="36" y="24" width="10" height="16"/>',
    flash:'<rect x="21" y="22" width="22" height="34" rx="3"/><rect x="26" y="8" width="12" height="14"/><path d="M28 12v4M36 12v4M26 34h12"/>',
    router:'<rect x="6" y="36" width="52" height="14" rx="3"/><path d="M16 36L12 16M48 36l4-20M32 36V12M15 43h2M23 43h2"/>',
    switch:'<rect x="4" y="24" width="56" height="18" rx="3"/><path d="M12 31h4v4h-4zM22 31h4v4h-4zM32 31h4v4h-4zM42 31h4v4h-4z"/>',
    earbuds:'<circle cx="21" cy="22" r="8"/><path d="M21 30v22"/><circle cx="43" cy="22" r="8"/><path d="M43 30v22"/>',
    headphones:'<path d="M11 40V32a21 21 0 0 1 42 0v8"/><rect x="8" y="36" width="12" height="18" rx="4"/><rect x="44" y="36" width="12" height="18" rx="4"/>',
    speaker:'<rect x="17" y="6" width="30" height="52" rx="7"/><circle cx="32" cy="40" r="10"/><circle cx="32" cy="20" r="4"/>',
    mic:'<rect x="24" y="6" width="16" height="30" rx="8"/><path d="M15 30a17 17 0 0 0 34 0M32 47v9M23 56h18"/>',
    ups:'<rect x="10" y="10" width="44" height="44" rx="5"/><path d="M35 18l-9 15h11l-7 14M18 18h4M18 24h4"/>',
    power:'<rect x="17" y="6" width="30" height="52" rx="6"/><path d="M34 20l-7 12h9l-6 12"/>',
    cable:'<path d="M6 46c12 0 6-26 20-26s8 26 22 26"/><rect x="48" y="40" width="10" height="12" rx="2"/><rect x="6" y="14" width="10" height="12" rx="2"/>',
    bag:'<rect x="9" y="22" width="46" height="32" rx="6"/><path d="M24 22v-6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6M9 38h46M28 38v4h8v-4"/>'
  };

  var STATUS = {
    placed: "Order placed", confirmed: "Confirmed", processing: "Being prepared",
    out_for_delivery: "Out for delivery", ready_for_pickup: "Ready for pickup",
    delivered: "Delivered", cancelled: "Cancelled"
  };
  A.STATUS = STATUS;

  // ---------- helpers ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  A.$ = $; A.$$ = $$;
  A.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  A.money = function (n) { return (C.currency || "₦") + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 }); };
  A.slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  A.cat = function (slug) { return CAT.filter(function (c) { return c.slug === slug; })[0]; };
  A.hue = function (slug) {
    for (var i = 0; i < CAT.length; i++) if (CAT[i].slug === slug) return Math.round(i * 360 / CAT.length + 14);
    return 210;
  };
  A.iconSvg = function (slug) {
    var c = A.cat(slug);
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' + (c ? ICONS[c.icon] : ICONS.laptop) + "</svg>";
  };
  A.iconInner = function (slug) { return A.iconSvg(slug).replace(/^<svg[^>]*>|<\/svg>$/g, ""); };
  function wikiTitleFor(p) {
    var c = A.cat(p.category); if (!c || !c.wiki || !c.wiki.length) return "";
    var i = Math.max(0, c.brands.indexOf(p.brand));
    return c.wiki[i % c.wiki.length];
  }
  // A product shows its own image_url if the owner set one. Otherwise a free-licensed
  // photo from Wikipedia is loaded in the visitor's browser, and a category icon stays if that fails.
  A.mediaFor = function (cat, title, alt, first) {
    return '<div class="media" style="--h:' + A.hue(cat) + '"' + (title ? ' data-wiki="' + A.esc(title) + '" data-wiki2="' + A.esc(first || title) + '" data-alt="' + A.esc(alt) + '"' : "") + ">" + A.iconSvg(cat) + "</div>";
  };
  A.media = function (p) {
    if (p.image_url) return '<div class="media has-img" style="--h:' + A.hue(p.category) + '"><img src="' + A.esc(p.image_url) + '" alt="' + A.esc(p.name) + '" loading="lazy" data-cat="' + A.esc(p.category) + '"></div>';
    var c = A.cat(p.category);
    return A.mediaFor(p.category, wikiTitleFor(p), p.name, c && c.wiki ? c.wiki[0] : "");
  };
  var IMGKEY = "asdw_wiki_v1", imgCache = {}, pending = {};
  try { imgCache = JSON.parse(localStorage.getItem(IMGKEY)) || {}; } catch (e) {}
  function wikiUrl(title) {
    if (Object.prototype.hasOwnProperty.call(imgCache, title)) return Promise.resolve(imgCache[title]);
    if (pending[title]) return pending[title];
    pending[title] = fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var u = (j && j.thumbnail && j.thumbnail.source) || "";
        imgCache[title] = u;
        try { localStorage.setItem(IMGKEY, JSON.stringify(imgCache)); } catch (e) {}
        return u;
      })
      .catch(function () { return ""; });
    return pending[title];
  }
  function hydrate() {
    Array.prototype.slice.call(document.querySelectorAll("[data-wiki]")).forEach(function (el) {
      var t = el.getAttribute("data-wiki"), t2 = el.getAttribute("data-wiki2");
      el.removeAttribute("data-wiki");
      wikiUrl(t).then(function (u) { return u || (t2 && t2 !== t ? wikiUrl(t2) : ""); }).then(function (u) {
        if (!u) return;
        var img = new Image(); img.alt = el.getAttribute("data-alt") || "";
        img.onload = function () { el.innerHTML = ""; el.appendChild(img); el.classList.add("has-img"); };
        img.src = u;
      });
    });
  }
  var hydT;
  new MutationObserver(function () { clearTimeout(hydT); hydT = setTimeout(hydrate, 30); }).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(hydrate, 0);
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.dataset.cat) t.parentNode.innerHTML = A.iconSvg(t.dataset.cat);
  }, true);

  A.toast = function (text) {
    var el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = text; el.hidden = false;
    clearTimeout(A.toast.t); A.toast.t = setTimeout(function () { el.hidden = true; }, 2000);
  };

  // ---------- cart ----------
  A.cart = {
    get: function () { try { return JSON.parse(localStorage.getItem("asdw_cart")) || {}; } catch (e) { return {}; } },
    set: function (c) { try { localStorage.setItem("asdw_cart", JSON.stringify(c)); } catch (e) {} A.badge(); },
    add: function (id, q) { var c = A.cart.get(); c[id] = Math.min(50, (c[id] || 0) + (q || 1)); A.cart.set(c); },
    setQty: function (id, q) { var c = A.cart.get(); if (q <= 0) delete c[id]; else c[id] = Math.min(50, q); A.cart.set(c); },
    clear: function () { A.cart.set({}); },
    count: function () { var c = A.cart.get(); return Object.keys(c).reduce(function (n, k) { return n + c[k]; }, 0); }
  };
  A.badge = function () { var n = A.cart.count(); $$("[data-cc]").forEach(function (b) { b.textContent = n; b.hidden = !n; }); };

  // ---------- Supabase (live) ----------
  function sb(path, o) {
    o = o || {};
    var headers = {
      apikey: C.supabaseAnonKey,
      Authorization: "Bearer " + (o.token || C.supabaseAnonKey),
      "Content-Type": "application/json"
    };
    if (o.prefer) headers.Prefer = o.prefer;
    return fetch(C.supabaseUrl.replace(/\/$/, "") + path, {
      method: o.method || "GET", headers: headers, body: o.body ? JSON.stringify(o.body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
        if (!r.ok) throw new Error((j && (j.message || j.msg || j.error_description)) || "Something went wrong. Please try again.");
        return j;
      });
    });
  }

  // ---------- demo backend (browser only) ----------
  var DEMO_BASE = {laptops:650000,desktops:520000,printers:180000,scanners:150000,photocopiers:900000,projectors:450000,"ink-toner":25000,monitors:120000,"keyboards-mice":15000,webcams:35000,hdd:55000,ssd:45000,"flash-memory":8000,routers:25000,switches:30000,earbuds:15000,headphones:30000,speakers:40000,microphones:25000,"ups-stabilizers":85000,"power-banks":20000,"cables-chargers":6000,"laptop-bags":15000};
  function demoProducts() {
    var out = [];
    CAT.forEach(function (c) {
      c.brands.forEach(function (b, i) {
        out.push({ id: c.slug + "-" + A.slug(b), category: c.slug, brand: b, name: b + " " + c.singular, description: c.blurb,
          price: Math.round((DEMO_BASE[c.slug] || 20000) * (1 + i * 0.12) / 500) * 500, stock: null, image_url: "", active: true });
      });
    });
    return out;
  }
  function demoOrders() { try { return JSON.parse(localStorage.getItem("asdw_demo_orders")) || []; } catch (e) { return []; } }
  function saveDemoOrders(o) { try { localStorage.setItem("asdw_demo_orders", JSON.stringify(o)); } catch (e) {} }

  function auth_token() { return A.auth.token(); }

  // ---------- public data API ----------
  var _products, _settings;
  A.getProducts = function () {
    if (_products) return _products;
    _products = LIVE
      ? sb("/rest/v1/products?active=eq.true&select=*&order=category.asc,brand.asc").then(function (r) { return r || []; })
      : Promise.resolve(demoProducts());
    return _products;
  };
  A.getSettings = function () {
    if (_settings) return _settings;
    _settings = LIVE
      ? sb("/rest/v1/settings?select=*").then(function (rows) {
          var m = {}; (rows || []).forEach(function (r) { m[r.key] = r.value; }); return m;
        }).catch(function () { return {}; })
      : Promise.resolve({ delivery_fee: "3000", pickup_address: "Demo pickup address" });
    return _settings;
  };
  A.deliveryFee = function (s) { return Number((s && s.delivery_fee) || 0) || 0; };

  A.createOrder = function (payload) {
    if (LIVE) return auth_token().then(function (t) { return sb("/rest/v1/rpc/create_order", { method: "POST", body: { p: payload }, token: t || undefined }); });
    return Promise.all([A.getProducts(), A.getSettings()]).then(function (r) {
      var prods = r[0], fee = payload.delivery_method === "delivery" ? A.deliveryFee(r[1]) : 0, sub = 0, lines = [];
      payload.items.forEach(function (it) {
        var p = prods.filter(function (x) { return x.id === it.id; })[0];
        if (!p) throw new Error("An item in your cart is no longer available.");
        var q = Math.max(1, Math.min(50, it.qty | 0));
        sub += p.price * q; lines.push({ id: p.id, name: p.name, brand: p.brand, price: p.price, qty: q });
      });
      var ref = "ASDW-" + Math.random().toString(16).slice(2, 8).toUpperCase();
      var now = new Date().toISOString();
      var orders = demoOrders();
      orders.push({ ref: ref, customer_name: payload.customer_name, phone: payload.phone, email: payload.email, status: "placed",
        payment_status: "pending", payment_method: payload.payment_method, delivery_method: payload.delivery_method,
        address: payload.address, city: payload.city, state: payload.state, items: lines, subtotal: sub, delivery_fee: fee,
        total: sub + fee, created_at: now, user: (A.auth.user() || {}).email || "", events: [{ status: "placed", note: "Order received", created_at: now }] });
      saveDemoOrders(orders);
      return { ref: ref, total: sub + fee };
    });
  };
  A.trackOrder = function (ref, phone) {
    ref = String(ref || "").trim().toUpperCase();
    if (LIVE) return sb("/rest/v1/rpc/track_order", { method: "POST", body: { p_ref: ref, p_phone: phone } });
    var d = function (s) { return String(s).replace(/\D/g, "").slice(-10); };
    var o = demoOrders().filter(function (x) { return x.ref === ref && d(x.phone) === d(phone); })[0];
    return Promise.resolve(o || null);
  };
  A.verifyPayment = function (ref) {
    if (LIVE) {
      return fetch(C.supabaseUrl.replace(/\/$/, "") + "/functions/v1/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: C.supabaseAnonKey, Authorization: "Bearer " + C.supabaseAnonKey },
        body: JSON.stringify({ ref: ref })
      }).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; });
    }
    var orders = demoOrders();
    orders.forEach(function (o) {
      if (o.ref === ref && o.payment_status !== "paid") {
        o.payment_status = "paid"; if (o.status === "placed") o.status = "confirmed";
        o.events.push({ status: "confirmed", note: "Payment received (demo)", created_at: new Date().toISOString() });
      }
    });
    saveDemoOrders(orders);
    return Promise.resolve({ ok: true });
  };

  A.loadPaystack = function () {
    return new Promise(function (res, rej) {
      if (window.PaystackPop) return res();
      var s = document.createElement("script"); s.src = "https://js.paystack.co/v1/inline.js";
      s.onload = res; s.onerror = function () { rej(new Error("Could not load Paystack. Check your internet connection.")); };
      document.head.appendChild(s);
    });
  };
  A.canPayOnline = function () { return !LIVE || !!C.paystackPublicKey; };
  A.payOnline = function (o) {
    // o: {ref,email,total,onDone,onClose}
    if (!LIVE) { return A.verifyPayment(o.ref).then(function () { o.onDone(); }); }
    return A.loadPaystack().then(function () {
      var h = window.PaystackPop.setup({
        key: C.paystackPublicKey, email: o.email, amount: Math.round(o.total * 100), currency: "NGN", ref: o.ref,
        callback: function () { o.onDone(); }, onClose: function () { o.onClose(); }
      });
      h.openIframe();
    });
  };

  // ---------- customer accounts ----------
  A.STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
  var SKEY = "asdw_session";
  function getSess() { try { return JSON.parse(localStorage.getItem(SKEY)) || null; } catch (e) { return null; } }
  function setSess(x) { try { if (x) localStorage.setItem(SKEY, JSON.stringify(x)); else localStorage.removeItem(SKEY); } catch (e) {} }
  function toSess(r) {
    return { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: Date.now() + ((r.expires_in || 3600) - 60) * 1000,
      user: { id: r.user.id, email: r.user.email, name: (r.user.user_metadata || {}).full_name || "" } };
  }
  function demoUsers() { try { return JSON.parse(localStorage.getItem("asdw_demo_users")) || {}; } catch (e) { return {}; } }
  var auth = (A.auth = {}), _admin;
  auth.user = function () { var x = getSess(); return x && x.user ? x.user : null; };
  auth.token = function () {
    var x = getSess();
    if (!x) return Promise.resolve("");
    if (!LIVE || Date.now() < x.expires_at) return Promise.resolve(x.access_token || "");
    return sb("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: x.refresh_token } })
      .then(function (r) { var n = toSess(r); setSess(n); return n.access_token; })
      .catch(function () { setSess(null); return ""; });
  };
  auth.signUp = function (email, password, name) {
    email = email.trim().toLowerCase();
    if (!LIVE) {
      var u = demoUsers();
      if (u[email]) return Promise.reject(new Error("That email already has an account. Sign in instead."));
      u[email] = { password: password, name: name };
      try { localStorage.setItem("asdw_demo_users", JSON.stringify(u)); } catch (e) {}
      setSess({ access_token: "demo", expires_at: 9e15, user: { id: email, email: email, name: name } });
      return Promise.resolve({ signedIn: true });
    }
    return sb("/auth/v1/signup", { method: "POST", body: { email: email, password: password, data: { full_name: name } } }).then(function (r) {
      if (r && r.access_token) { setSess(toSess(r)); return { signedIn: true }; }
      return { signedIn: false };
    });
  };
  auth.signIn = function (email, password) {
    email = email.trim().toLowerCase();
    if (!LIVE) {
      var u = demoUsers()[email];
      if (!u || u.password !== password) return Promise.reject(new Error("Wrong email or password."));
      setSess({ access_token: "demo", expires_at: 9e15, user: { id: email, email: email, name: u.name } });
      return Promise.resolve();
    }
    return sb("/auth/v1/token?grant_type=password", { method: "POST", body: { email: email, password: password } }).then(function (r) { _admin = null; setSess(toSess(r)); });
  };
  auth.signOut = function () { _admin = null; setSess(null); };
  auth.isAdmin = function () {
    if (!LIVE || !auth.user()) return Promise.resolve(false);
    if (!_admin) _admin = auth.token().then(function (t) { return t ? sb("/rest/v1/rpc/is_admin", { method: "POST", body: {}, token: t }) : false; }).then(function (v) { return v === true; }).catch(function () { return false; });
    return _admin;
  };
  auth.getProfile = function () {
    var u = auth.user(); if (!u) return Promise.resolve({});
    if (!LIVE) { try { return Promise.resolve(JSON.parse(localStorage.getItem("asdw_demo_profile_" + u.email)) || {}); } catch (e) { return Promise.resolve({}); } }
    return auth.token().then(function (t) { return sb("/rest/v1/profiles?id=eq." + encodeURIComponent(u.id) + "&select=*", { token: t }); }).then(function (r) { return (r && r[0]) || {}; });
  };
  auth.saveProfile = function (p) {
    var u = auth.user();
    if (!LIVE) { try { localStorage.setItem("asdw_demo_profile_" + u.email, JSON.stringify(p)); } catch (e) {} return Promise.resolve(); }
    var row = Object.assign({}, p, { id: u.id });
    return auth.token().then(function (t) { return sb("/rest/v1/profiles", { method: "POST", body: row, token: t, prefer: "resolution=merge-duplicates,return=minimal" }); });
  };
  auth.myOrders = function () {
    var u = auth.user(); if (!u) return Promise.resolve([]);
    if (!LIVE) return Promise.resolve(demoOrders().filter(function (o) { return o.user === u.email; }).reverse());
    return auth.token().then(function (t) {
      return sb("/rest/v1/orders?user_id=eq." + encodeURIComponent(u.id) + "&select=ref,phone,status,payment_status,total,created_at,items&order=created_at.desc&limit=50", { token: t });
    });
  };

  // ---------- admin API (owner only; enforced by database rules) ----------
  var admin = (A.admin = {});
  function ad(path, o) { o = o || {}; return auth.token().then(function (t) { o.token = t; return sb(path, o); }); }
  admin.orders = function () { return ad("/rest/v1/orders?select=*&order=created_at.desc&limit=300"); };
  admin.events = function (id) { return ad("/rest/v1/order_events?order_id=eq." + encodeURIComponent(id) + "&order=created_at.asc"); };
  admin.setStatus = function (id, status, note) {
    return ad("/rest/v1/orders?id=eq." + encodeURIComponent(id), { method: "PATCH", body: { status: status }, prefer: "return=minimal" })
      .then(function () { return ad("/rest/v1/order_events", { method: "POST", body: { order_id: id, status: status, note: note || STATUS[status] }, prefer: "return=minimal" }); });
  };
  admin.markPaid = function (id) {
    return ad("/rest/v1/orders?id=eq." + encodeURIComponent(id), { method: "PATCH", body: { payment_status: "paid" }, prefer: "return=minimal" })
      .then(function () { return ad("/rest/v1/order_events", { method: "POST", body: { order_id: id, status: "confirmed", note: "Payment confirmed by the store" }, prefer: "return=minimal" }); });
  };
  admin.products = function () { return ad("/rest/v1/products?select=*&order=category.asc,brand.asc,name.asc"); };
  admin.saveProduct = function (p) { return ad("/rest/v1/products", { method: "POST", body: p, prefer: "resolution=merge-duplicates,return=minimal" }); };
  admin.deleteProduct = function (id) { return ad("/rest/v1/products?id=eq." + encodeURIComponent(id), { method: "DELETE", prefer: "return=minimal" }); };
  admin.saveSetting = function (key, value) { return ad("/rest/v1/settings", { method: "POST", body: { key: key, value: String(value) }, prefer: "resolution=merge-duplicates,return=minimal" }); };

  // ---------- product card ----------
  A.inStock = function (p) { return p.stock == null || p.stock > 0; };
  A.productCard = function (p) {
    var link = "product.html?id=" + encodeURIComponent(p.id);
    var buy = p.price != null && A.inStock(p);
    var price = p.price != null ? '<div class="price">' + A.money(p.price) + "</div>" : '<div class="price ask">Price on request</div>';
    var action;
    if (buy) action = '<button class="cbtn" data-add="' + A.esc(p.id) + '">Add to cart</button>';
    else if (p.price != null) action = '<span class="tag bad" style="margin-top:8px;align-self:flex-start">Out of stock</span>';
    else if (C.whatsapp) action = '<a class="cbtn alt" target="_blank" rel="noopener" href="https://wa.me/' + A.esc(C.whatsapp) + "?text=" + encodeURIComponent("Hello, please send me the price for " + p.name) + '">Ask price</a>';
    else action = '<a class="cbtn alt" href="' + link + '">View details</a>';
    return '<article class="card"><a class="mlink" href="' + link + '" aria-label="' + A.esc(p.name) + '">' + A.media(p) + "</a>" +
      '<div class="body"><h3><a href="' + link + '">' + A.esc(p.name) + '</a></h3><span class="brand">' + A.esc(p.brand) + "</span>" + price + action + "</div></article>";
  };
  A.catStrip = function (active) {
    return '<nav class="catstrip" aria-label="Categories"><div class="wrap"><div class="strip">' +
      '<a class="sc' + (!active ? " on" : "") + '" href="shop.html"><span class="ic all"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span><span class="t">All</span></a>' +
      A.CAT.map(function (c) {
        return '<a class="sc' + (active === c.slug ? " on" : "") + '" href="shop.html?cat=' + c.slug + '"><span class="ic" style="--h:' + A.hue(c.slug) + '"><svg viewBox="0 0 64 64" aria-hidden="true">' + A.iconInner(c.slug) + '</svg></span><span class="t">' + A.esc(c.name) + "</span></a>";
      }).join("") + "</div></div></nav>";
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-add]");
    if (!b) return;
    A.cart.add(b.getAttribute("data-add"), 1); A.toast("Added to your cart");
  });

  // ---------- layout ----------
  var TAB = {
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    categories: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    cart: '<path d="M3 4h2l2.4 11h10.2l2-8H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  A.layout = function (active, opts) {
    opts = opts || {};
    var h = $("#site-header"), f = $("#site-footer");
    if (h) {
      h.innerHTML =
        (LIVE ? "" : '<div class="demo">Demo mode: add your Supabase and Paystack keys in config.js to go live.</div>') +
        '<header class="site"><div class="wrap">' +
        '<a class="logo" href="index.html"><svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#fff"/><path d="M6 27h28" stroke="#12284a" stroke-width="2.5" stroke-linecap="round"/><path d="M11 27a9 9 0 0 1 18 0" fill="#ffb347"/><path d="M20 8v4M9 13l3 3M31 13l-3 3" stroke="#ffb347" stroke-width="2.5" stroke-linecap="round"/></svg>' +
        "<div><b>Arise and Shine</b><small>Digital World</small></div></a>" +
        '<form class="searchbar" action="shop.html" role="search"><input name="q" type="search" placeholder="Search products and brands" aria-label="Search products and brands" value="' + A.esc(opts.q || "") + '"><button aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg></button></form>' +
        '<a class="hcart" href="cart.html" aria-label="Cart"><svg viewBox="0 0 24 24" aria-hidden="true">' + TAB.cart + '</svg><span class="badge" data-cc hidden>0</span></a>' +
        "</div></header>" + (opts.strip ? A.catStrip(opts.strip === true ? "" : opts.strip) : "");
    }
    if (f) {
      var contact = "";
      if (C.phone) contact += "<p>Call: " + A.esc(C.phone) + "</p>";
      if (C.whatsapp) contact += '<a target="_blank" rel="noopener" href="https://wa.me/' + A.esc(C.whatsapp) + '">WhatsApp us</a>';
      if (C.email) contact += "<p>" + A.esc(C.email) + "</p>";
      if (C.address) contact += "<p>" + A.esc(C.address) + "</p>";
      if (!contact) contact = "<p>Contact details coming soon.</p>";
      f.innerHTML = '<footer class="site"><div class="wrap">' +
        "<div><h3>" + A.esc(C.name) + "</h3><p>Computers, printers, networking, audio and power accessories from trusted brands.</p></div>" +
        '<div><h3>Orders</h3><a href="track.html">Track your order</a><a href="profile.html">My account</a></div>' +
        "<div><h3>Contact</h3>" + contact + "</div></div></footer>" +
        '<div class="copy">© ' + new Date().getFullYear() + " " + A.esc(C.name) + "</div>";
    }
    var old = $("#tabbar"); if (old) old.remove();
    var tabs = [["home", "Home", "index.html"], ["categories", "Categories", "categories.html"], ["cart", "Cart", "cart.html"], ["profile", "Profile", "profile.html"]];
    var nav = document.createElement("nav");
    nav.id = "tabbar"; nav.className = "tabbar"; nav.setAttribute("aria-label", "App");
    nav.innerHTML = tabs.map(function (t) {
      return '<a href="' + t[2] + '"' + (active === t[0] ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true">' + TAB[t[0]] + "</svg>" + t[1] +
        (t[0] === "cart" ? '<span class="badge" data-cc hidden>0</span>' : "") + "</a>";
    }).join("");
    document.body.appendChild(nav);
    A.badge();
  };
})();
