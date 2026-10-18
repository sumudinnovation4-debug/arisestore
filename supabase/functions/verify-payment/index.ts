// Confirms a Paystack payment on the server, then marks the order as paid.
// The browser cannot mark an order as paid by itself: this function asks Paystack
// and checks that the amount paid equals the order total.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { ref } = await req.json();
    if (!ref) return json({ ok: false, error: "Missing reference" }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order } = await sb.from("orders").select("*").eq("ref", ref).maybeSingle();
    if (!order) return json({ ok: false, error: "Order not found" }, 404);
    if (order.payment_status === "paid") return json({ ok: true });

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}` },
    });
    const body = await res.json();
    const paid = body?.status === true &&
      body?.data?.status === "success" &&
      body?.data?.currency === "NGN" &&
      body?.data?.amount === Math.round(Number(order.total) * 100);

    if (paid) {
      await sb.from("orders").update({
        payment_status: "paid",
        status: order.status === "placed" ? "confirmed" : order.status,
      }).eq("id", order.id);
      await sb.from("order_events").insert({ order_id: order.id, status: "confirmed", note: "Payment received" });
    }
    return json({ ok: paid });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
