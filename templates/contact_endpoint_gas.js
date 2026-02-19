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

const DESTINATION_EMAIL = "support@misemaru.cloud";
const CC_EMAIL = "contact@nakayamaworks.jp";
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
    return jsonOutput({ ok: false, error: "Invalid payload" });
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_) {
    return jsonOutput({ ok: false, error: "Invalid JSON" });
  }

  if (sanitize(body.website)) {
    // Honeypot filled: return success silently.
    return jsonOutput({ ok: true });
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
    return jsonOutput({ ok: false, error: "Invalid email" });
  }
  if (!subject || ALLOWED_SUBJECTS.indexOf(subject) === -1) {
    return jsonOutput({ ok: false, error: "Invalid subject" });
  }
  if (!message) {
    return jsonOutput({ ok: false, error: "Message required" });
  }
  if (!privacyAccepted) {
    return jsonOutput({ ok: false, error: "Privacy consent required" });
  }

  const mailSubject = "[Nakayama Works] " + subject + " / " + email;
  const mailBody = formatEmail({
    subject: subject,
    name: name,
    salon: salon,
    email: email,
    lang: lang,
    source: source,
    message: message,
  });
  const mailHtml = formatEmailHtml({
    subject: subject,
    name: name,
    salon: salon,
    email: email,
    lang: lang,
    source: source,
    message: message,
  });

  const sendOptions = {
    to: DESTINATION_EMAIL,
    subject: mailSubject,
    replyTo: email,
    name: "Nakayama Works Contact",
    body: mailBody,
    htmlBody: mailHtml,
  };
  if (CC_EMAIL) {
    sendOptions.cc = CC_EMAIL;
  }

  MailApp.sendEmail(sendOptions);
  return jsonOutput({ ok: true });
}

function doGet(e) {
  return jsonOutput({ ok: true, message: "Healthy" });
}

function doOptions(e) {
  return jsonOutput({ ok: true });
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
    "言語       : " + payload.lang + "\n" +
    "送信元     : " + payload.source + "\n" +
    "受信時刻   : " + new Date().toISOString() + "\n" +
    "------------------------------\n" +
    payload.message + "\n" +
    "------------------------------\n"
  );
}

function formatEmailHtml(payload) {
  const lines = [
    ["件名", payload.subject],
    ["お名前", payload.name || "(未入力)"],
    ["店舗名", payload.salon || "(未入力)"],
    ["メール", payload.email],
    ["言語", payload.lang],
    ["送信元", payload.source],
    ["受信時刻", new Date().toISOString()],
  ];

  const rows = lines
    .map(function (pair) {
      return (
        '<tr>' +
        '<th style="padding:6px 10px;text-align:left;white-space:nowrap;font-weight:700;color:#111111;border-bottom:1px solid #e5e7eb;">' +
        escapeHtml(pair[0]) +
        '</th>' +
        '<td style="padding:6px 10px;color:#111111;border-bottom:1px solid #e5e7eb;">' +
        escapeHtml(pair[1]) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    '<div style="margin:0;padding:18px;background:#ffffff;color:#111111;font-family:\'Noto Sans JP\',\'Hiragino Kaku Gothic ProN\',\'Yu Gothic\',sans-serif;line-height:1.7;">' +
    '<h2 style="margin:0 0 12px 0;font-size:18px;color:#111111;">Nakayama Works お問い合わせ</h2>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:760px;background:#ffffff;color:#111111;">' +
    rows +
    "</table>" +
    '<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;background:#ffffff;color:#111111;white-space:pre-wrap;">' +
    escapeHtml(payload.message) +
    "</div>" +
    "</div>"
  );
}

function sanitize(value) {
  return String(value || "").replace(/[\u0000-\u001f]/g, "").trim();
}

function isValidEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || ""));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
