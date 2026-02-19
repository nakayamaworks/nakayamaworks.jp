/**
 * Nakayama Works LP contact endpoint (Google Apps Script / Web App)
 *
 * Deploy:
 * 1) Create a new Apps Script project and paste this file.
 * 2) Deploy as Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3) Copy deployed URL and set it in LP:
 *    window.NAKAYAMA_WORKS = { CONTACT_ENDPOINT: "https://script.google.com/macros/s/xxx/exec" };
 *
 * Expected JSON payload from nakayama_works_lp/index.html:
 * {
 *   type: "service" | "setup" | "pricing" | "other",
 *   subject: "公式サイト制作のご相談" | "予約システム導入のご相談" | "運用・改善のご相談" |
 *            "料金・見積もり・納期について" | "その他",
 *   name: "optional",
 *   salon: "optional",
 *   email: "required",
 *   message: "required",
 *   privacyAccepted: true,
 *   lang: "ja",
 *   source: "nakayama_works_lp/index.html",
 *   website: "" // honeypot (must be empty)
 * }
 */

const DESTINATION_EMAIL = "contact@nakayamaworks.jp";
const CC_EMAIL = ""; // Optional: e.g. "support@misemaru.cloud"
const DEFAULT_ALLOWED_ORIGIN = "https://nakayamaworks.jp";
const ALLOWED_ORIGINS = [
  "https://nakayamaworks.jp",
  "https://www.nakayamaworks.jp",
  "https://nakayamaworks.github.io",
];

const ALLOWED_SUBJECTS = [
  "公式サイト制作のご相談",
  "予約システム導入のご相談",
  "運用・改善のご相談",
  "料金・見積もり・納期について",
  "その他",
];

function doPost(e) {
  const origin = extractOrigin(e);

  if (!e || !e.postData || !e.postData.contents) {
    return withCors(jsonOutput({ ok: false, error: "Invalid payload" }), origin, 400);
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_) {
    return withCors(jsonOutput({ ok: false, error: "Invalid JSON" }), origin, 400);
  }

  if (sanitize(body.website)) {
    // Honeypot filled: return success silently.
    return withCors(jsonOutput({ ok: true }), origin);
  }

  const email = sanitize(body.email);
  const subject = sanitize(body.subject);
  const name = sanitize(body.name);
  const salon = sanitize(body.salon);
  const message = sanitize(body.message).slice(0, 1200);
  const source = sanitize(body.source || "nakayama_works_lp/index.html");
  const type = sanitize(body.type || "other");
  const lang = sanitize(body.lang || "ja");
  const privacyAccepted = Boolean(body.privacyAccepted);

  if (!email || !isValidEmail(email)) {
    return withCors(jsonOutput({ ok: false, error: "Invalid email" }), origin, 400);
  }
  if (!subject || ALLOWED_SUBJECTS.indexOf(subject) === -1) {
    return withCors(jsonOutput({ ok: false, error: "Invalid subject" }), origin, 400);
  }
  if (!message) {
    return withCors(jsonOutput({ ok: false, error: "Message required" }), origin, 400);
  }
  if (!privacyAccepted) {
    return withCors(jsonOutput({ ok: false, error: "Privacy consent required" }), origin, 400);
  }

  const mailSubject = "[Nakayama Works] " + subject + " / " + email;
  const mailBody = formatEmail({
    subject: subject,
    name: name,
    salon: salon,
    email: email,
    type: type,
    lang: lang,
    source: source,
    message: message,
  });

  const sendOptions = {
    to: DESTINATION_EMAIL,
    subject: mailSubject,
    replyTo: email,
    name: name || "Nakayama Works Contact",
    body: mailBody,
  };
  if (CC_EMAIL) {
    sendOptions.cc = CC_EMAIL;
  }

  MailApp.sendEmail(sendOptions);
  return withCors(jsonOutput({ ok: true }), origin);
}

function doGet(e) {
  const origin = extractOrigin(e);
  return withCors(jsonOutput({ ok: true, message: "Healthy" }), origin);
}

function doOptions(e) {
  const origin = extractOrigin(e);
  return withCors(jsonOutput({ ok: true }), origin);
}

function formatEmail(payload) {
  return (
    "==============================\n" +
    "Nakayama Works お問い合わせ\n" +
    "==============================\n" +
    "件名       : " + payload.subject + "\n" +
    "お名前     : " + (payload.name || "(未入力)") + "\n" +
    "店舗名     : " + (payload.salon || "(未入力)") + "\n" +
    "メール     : " + payload.email + "\n" +
    "種別(type) : " + payload.type + "\n" +
    "言語       : " + payload.lang + "\n" +
    "送信元     : " + payload.source + "\n" +
    "受信時刻   : " + new Date().toISOString() + "\n" +
    "------------------------------\n" +
    payload.message + "\n" +
    "------------------------------\n"
  );
}

function sanitize(value) {
  return String(value || "").replace(/[\u0000-\u001f]/g, "").trim();
}

function isValidEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || ""));
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function extractOrigin(e) {
  const origin =
    (e && e.parameter && e.parameter.origin) ||
    DEFAULT_ALLOWED_ORIGIN;
  return ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : DEFAULT_ALLOWED_ORIGIN;
}

function withCors(output, origin, status) {
  if (typeof status === "number") {
    output.setHeader("X-Status-Code", String(status));
  }
  output.setHeader("Access-Control-Allow-Origin", origin || DEFAULT_ALLOWED_ORIGIN);
  output.setHeader("Access-Control-Allow-Headers", "Content-Type");
  output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  return output;
}
