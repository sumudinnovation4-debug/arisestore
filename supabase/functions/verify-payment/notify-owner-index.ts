// Sends the owner a WhatsApp message on BOTH owner numbers whenever an order is placed.
//
// Uses CallMeBot (free). One-time setup, done from a phone:
//  1. On EACH owner number (09134487573 and 08167956341), send this WhatsApp message to +34 644 51 95 23:
//        I allow callmebot to send me messages
//     CallMeBot replies with an API key for that number.
//  2. In Supabase > Edge Functions > notify-owner > Secrets, add:
//        OWNER_WHATSAPP_KEYS = 2349134487573:KEY1,2348167956341:KEY2
//     (replace KEY1 and KEY2 with the keys CallMeBot sent to each number)
//  3. Deploy this function. The site calls it with the anon key, so leave "Verify JWT" on.
//
// The browser only sends the order number. The order details are read from the database here,
// so nobody can use this function to send custom text to the owner.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const naira = (n: unknown) => "₦" + Number(n || 0).toLocaleString("en-NG");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { ref } = await req.json();
    if (!ref) return json({ ok: false, error: "Missing reference" }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: o } = await sb.from("orders").select("*").eq("ref", String(ref)).maybeSingle();
    if (!o) return json({ ok: false, error: "Order not found" }, 404);
    // Only brand-new orders, so the function cannot be used to re-send old ones.
    if (Date.now() - new Date(o.created_at).getTime() > 10 * 60 * 1000) return json({ ok: false, error: "Order is not new" }, 400);

    const items = (Array.isArray(o.items) ? o.items : [])
      .map((i: any) => `- ${i.qty} x ${i.name} (${naira(i.price * i.qty)})`).join("\n");
    const where = o.delivery_method === "delivery"
      ? `Delivery: ${[o.address, o.city, o.state].filter(Boolean).join(", ")}`
      : "Pickup";
    const text =
      `NEW ORDER ${o.ref}\n` +
      `Customer: ${o.customer_name}\nPhone: ${o.phone}\nEmail: ${o.email}\n` +
      `${items}\n` +
      `Total: ${naira(o.total)}\n` +
      `Payment: ${o.payment_method === "transfer" ? "Bank transfer" : "Paystack"} (${o.payment_status})\n` +
      `${where}`;

    const pairs = (Deno.env.get("OWNER_WHATSAPP_KEYS") || "")
      .split(",").map((x) => x.trim().split(":")).filter((x) => x[0] && x[1]);
    if (!pairs.length) return json({ ok: false, error: "OWNER_WHATSAPP_KEYS is not set" }, 500);

    const results = await Promise.all(pairs.map(async ([phone, key]) => {
      try {
        const r = await fetch(
          `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`,
        );
        return { phone, sent: r.ok };
      } catch (_) {
        return { phone, sent: false };
      }
    }));
    return json({ ok: results.some((r) => r.sent), results });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
