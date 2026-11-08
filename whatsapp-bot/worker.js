// Abu Alfaisal WhatsApp intake service for Cloudflare Workers.
// Credentials and customer messages are NEVER stored in the public GitHub repository.
// This service receives and records official WhatsApp Cloud API webhooks.
// By design it NEVER sends messages automatically until a separately reviewed reply mode is implemented.

const ACTIVE_STATES = ["جديد", "قيد المراجعة", "بانتظار العميل", "بانتظار مزود الخدمة"];
const ALLOWED_STATES = [...ACTIVE_STATES, "مكتمل", "ملغي"];
const ASSIGNEES = ["زيد العودي", "موسى باعباد"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health" && request.method === "GET") {
        return json({ ok: true, application: "Abu Alfaisal WhatsApp Intake", mode: "receive-only" });
      }
      if (url.pathname === "/webhook" && request.method === "GET") {
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        if (env.WEBHOOK_VERIFY_TOKEN && mode === "subscribe" && token === env.WEBHOOK_VERIFY_TOKEN && challenge) {
          return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
        return new Response("Forbidden", { status: 403 });
      }
      if (url.pathname === "/webhook" && request.method === "POST") {
        if (!env.META_APP_SECRET || !env.DB || !env.PHONE_NUMBER_ID) return new Response("Not configured", { status: 503 });
        const body = await request.text();
        if (body.length > 1048576) return new Response("Payload too large", { status: 413 });
        if (!(await checkSignature(body, request.headers.get("x-hub-signature-256"), env.META_APP_SECRET))) {
          return new Response("Invalid signature", { status: 403 });
        }
        let payload;
        try { payload = JSON.parse(body); }
        catch { return new Response("Invalid JSON", { status: 400 }); }
        await ingest(payload, env);
        return new Response("EVENT_RECEIVED", { status: 200 });
      }
      if (url.pathname === "/api/requests" && request.method === "GET") {
        if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });
        const rows = await env.DB.prepare("SELECT id, wa_id, customer_name, service, status, assigned_to, details, created_at, updated_at, last_inbound_at FROM requests ORDER BY updated_at DESC LIMIT 200").all();
        return json({ requests: rows.results });
      }
      if (url.pathname.startsWith("/api/requests/") && request.method === "PATCH") {
        if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });
        const id = decodeURIComponent(url.pathname.slice("/api/requests/".length));
        if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Invalid ID", { status: 400 });
        const input = await request.json();
        const current = await env.DB.prepare("SELECT * FROM requests WHERE id = ?").bind(id).first();
        if (!current) return new Response("Not found", { status: 404 });
        const status = ALLOWED_STATES.includes(input.status) ? input.status : current.status;
        const assignee = input.assigned_to === "" || ASSIGNEES.includes(input.assigned_to) ? input.assigned_to : current.assigned_to;
        await env.DB.prepare("UPDATE requests SET status = ?, assigned_to = ?, updated_at = ? WHERE id = ?")
          .bind(status, assignee, new Date().toISOString(), id).run();
        return json({ ok: true });
      }
      return new Response("Not found", { status: 404 });
    } catch (error) {
      // Do not log webhook bodies, customer phone numbers, secrets, or message text.
      return new Response("Processing error", { status: 500 });
    }
  }
};

function authorized(req, env) {
  const key = env.ADMIN_API_KEY;
  const provided = req.headers.get("Authorization") || "";
  return !!key && key.length >= 32 && provided === "Bearer " + key;
}

async function checkSignature(body, header, secret) {
  if (!header || !/^sha256=[a-f0-9]{64}$/i.test(header)) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  const received = header.slice(7).toLowerCase();
  // Constant-time comparison for equal-length ASCII hex strings.
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ received.charCodeAt(i);
  return diff === 0;
}

function classify(text) {
  if (/(تأشير|فيز[اە]|visa|سفار[ةات])/i.test(text)) return "التأشيرات";
  if (/(عمر[ةه]|مك[ةه]|مدين[ةه])/i.test(text)) return "العمرة";
  if (/(فندق|سكن|حجز غرف|hotel)/i.test(text)) return "الفنادق";
  if (/(موافق[ةه] أمنية|مخابرات|أمن وطني)/i.test(text)) return "الموافقات الأمنية";
  if (/(تذكر[ةه]|طيران|رحل[ةه]|حجز|مطار|سفر|ticket|flight)/i.test(text)) return "تذاكر الطيران";
  if (/(استفسار|متابع[ةه]|حالة|تعديل|استرجاع|الغاء)/i.test(text)) return "المتابعات";
  return "غير محدد";
}

function textFromMessage(message) {
  if (message.type === "text") return String(message.text?.body || "").slice(0, 6000);
  if (message.type === "interactive") return String(message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "").slice(0, 6000);
  if (message.type === "button") return String(message.button?.text || "").slice(0, 6000);
  // Do not fetch/download customer voice notes, documents, or pictures automatically.
  return "مرفق من نوع " + String(message.type || "غير معروف").slice(0, 40) + " (يلزم الاطلاع عليه يدويًا)";
}

async function ingest(payload, env) {
  if (payload?.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) return;
  for (const entry of payload.entry) {
    for (const change of (entry.changes || [])) {
      if (change.field !== "messages") continue;
      const data = change.value || {};
      if (env.PHONE_NUMBER_ID && String(data.metadata?.phone_number_id) !== String(env.PHONE_NUMBER_ID)) continue;
      const names = new Map((data.contacts || []).map(contact => [contact.wa_id, String(contact.profile?.name || "").slice(0, 120)]));
      for (const message of (data.messages || [])) {
        const waId = String(message.from || "");
        const externalMessageId = String(message.id || "");
        if (!/^[0-9]{9,16}$/.test(waId) || !externalMessageId.startsWith("wamid.")) continue;
        const text = textFromMessage(message);
        const now = new Date().toISOString();
        const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM requests").first();
        const assignee = ASSIGNEES[Number(count?.total || 0) % ASSIGNEES.length];
        const name = names.get(waId) || "عميل واتساب";
        let active = await env.DB.prepare("SELECT id, service FROM requests WHERE wa_id = ? AND status NOT IN ('مكتمل', 'ملغي') LIMIT 1").bind(waId).first();
        if (!active) {
          const id = crypto.randomUUID();
          await env.DB.prepare("INSERT OR IGNORE INTO requests (id,wa_id,customer_name,service,status,assigned_to,details,created_at,updated_at,last_inbound_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
            .bind(id, waId, name, classify(text), "جديد", assignee, "", now, now, now).run();
          active = await env.DB.prepare("SELECT id, service FROM requests WHERE wa_id = ? AND status NOT IN ('مكتمل','ملغي') LIMIT 1").bind(waId).first();
        }
        if (!active) continue;
        const msgResult = await env.DB.prepare("INSERT OR IGNORE INTO inbound_messages (wa_message_id,request_id,body,received_at) VALUES (?,?,?,?)")
          .bind(externalMessageId, active.id, text, now).run();
        // Avoid processing duplicate webhook deliveries.
        if (msgResult.meta?.changes === 0) continue;
        const category = classify(text);
        const nextCategory = active.service === "غير محدد" && category !== "غير محدد" ? category : active.service;
        await env.DB.prepare("UPDATE requests SET service = ?, customer_name = CASE WHEN customer_name = 'عميل واتساب' THEN ? ELSE customer_name END, details = CASE WHEN LENGTH(details) < 28000 THEN details || ? ELSE details END, updated_at = ?, last_inbound_at = ? WHERE id = ?")
          .bind(nextCategory, name, (text ? (text + "\n") : ""), now, now, active.id).run();
        // No automatic WhatsApp replies, payment prompts, invented prices, or ticket confirmations.
      }
    }
  }
}

function json(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}