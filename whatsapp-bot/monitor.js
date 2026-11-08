/**
 * Abu Alfaisal: WhatsApp unanswered-customer monitoring only.
 * Scope: 1:1 inbound messages and staff replies mirrored by WhatsApp Business App Coexistence.
 * No outbound messages to customers. No unofficial group messaging and no auto-replies.
 *
 * The 4-minute timer starts on the FIRST inbound message since the previous human reply.
 * Multiple customer messages do not reset the timer or create repeated alerts.
 * Alerts remain queued privately until a separately authorized delivery integration exists.
 */

export const WAIT_MINUTES = 4;
const MS_MIN = 60000;

function validPhone(raw) {
  const p = String(raw || "").replace(/[^\d]/g, "");
  return /^[1-9]\d{8,15}$/.test(p) ? p : null;
}
function displayName(name) {
  return String(name || "عميل واتساب").slice(0, 100) || "عميل واتساب";
}
function iso(ms) { return new Date(ms).toISOString(); }

export async function monitorInbound(db, rawPhone, customerName, receivedAt = Date.now()) {
  const phone = validPhone(rawPhone);
  if (!phone) return false;
  const when = iso(receivedAt);
  await db.prepare(
    "INSERT INTO monitor_chats (wa_id, customer_name, pending_since, last_inbound_at, last_human_reply_at) " +
    "VALUES (?, ?, ?, ?, NULL) ON CONFLICT (wa_id) DO UPDATE SET " +
    "customer_name = CASE WHEN excluded.customer_name = 'عميل واتساب' THEN monitor_chats.customer_name ELSE excluded.customer_name END, " +
    "pending_since = COALESCE(monitor_chats.pending_since, excluded.pending_since), " +
    "last_inbound_at = excluded.last_inbound_at"
  ).bind(phone, displayName(customerName), when, when).run();
  return true;
}

export async function monitorHumanReply(db, rawPhone, receivedAt = Date.now()) {
  const phone = validPhone(rawPhone);
  if (!phone) return false;
  const when = iso(receivedAt);
  await db.prepare(
    "UPDATE monitor_chats SET pending_since = NULL, last_human_reply_at = ? WHERE wa_id = ?"
  ).bind(when, phone).run();
  // An employee might reply at the exact minute the alert is queued.
  // Keep already-delivered notifications for audit but cancel any still pending delivery.
  await db.prepare(
    "UPDATE monitor_alerts SET status = 'cancelled' " +
    "WHERE wa_id = ? AND status = 'pending'"
  ).bind(phone).run();
  return true;
}

export function alertText(alert, minutes = WAIT_MINUTES) {
  const name = displayName(alert.customer_name);
  const phone = validPhone(alert.wa_id) || "غير متاح";
  return "🔔 تنبيه أبو الفيصل\n" +
    "العميل: " + name + "\n" +
    "الرقم: +" + phone + "\n" +
    "لم يتلقَّ ردًا من الموظفين منذ " + minutes + " دقائق.\n" +
    "يرجى المتابعة.";
}

/**
 * Called once per minute through Cloudflare Cron Triggers.
 * Safe on retries: UNIQUE(wa_id, pending_since) prevents duplicate alerts.
 * Intentionally does not dispatch any outbound message or reveal customer data publicly.
 */
export async function queueDueAlerts(db, now = Date.now()) {
  const cutoff = iso(now - WAIT_MINUTES * MS_MIN);
  const due = await db.prepare(
    "SELECT wa_id, customer_name, pending_since, last_inbound_at FROM monitor_chats " +
    "WHERE pending_since IS NOT NULL AND pending_since <= ? " +
    "ORDER BY pending_since ASC LIMIT 200"
  ).bind(cutoff).all();
  let added = 0;
  for (const chat of due.results || []) {
    const minutes = Math.max(WAIT_MINUTES, Math.floor((now - Date.parse(chat.pending_since)) / MS_MIN));
    const text = alertText(chat, minutes);
    // The conditional SELECT also suppresses an alert if the staff reply was processed meanwhile.
    const res = await db.prepare(
      "INSERT OR IGNORE INTO monitor_alerts " +
      "(id, wa_id, customer_name, pending_since, alert_text, status, created_at) " +
      "SELECT ?, ?, ?, ?, ?, 'pending', ? " +
      "WHERE EXISTS (SELECT 1 FROM monitor_chats WHERE wa_id = ? AND pending_since = ?)"
    ).bind(crypto.randomUUID(), chat.wa_id, chat.customer_name, chat.pending_since,
           text, iso(now), chat.wa_id, chat.pending_since).run();
    if ((res.meta?.changes || 0) > 0) added++;
  }
  return added;
}
