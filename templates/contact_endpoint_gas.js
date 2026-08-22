/**
 * Nakayama Works LP contact endpoint (Google Apps Script / Web App)
 *
 * Deploy:
 * 1) Paste this entire file into the Apps Script project used by the site.
 * 2) Deploy a new Web app version:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3) Copy deployed URL and set it in LP:
 *    window.NAKAYAMA_WORKS = { CONTACT_ENDPOINT: "https://script.google.com/macros/s/xxx/exec" };
 *
 * Expected JSON payload from nakayama_works_lp/index.html:
 * {
 *   type: "service" | "setup" | "other",
 *   subject: "Webアプリ開発のご相談" | "既存システム改善のご相談" |
 *            "AI機能の導入・検証" | "QA・テスト設計のご相談" |
 *            "みせまるクラウド導入のご相談" | "その他",
 *   name: "required",
 *   organization: "optional",
 *   email: "required",
 *   message: "required",
 *   privacyAccepted: true,
 *   lang: "ja",
 *   source: "nakayama_works_lp/index.html",
 *   website: "" // honeypot (must be empty)
 * }
 */

const DESTINATION_EMAIL = "contact@nakayamaworks.jp";
const CC_EMAIL = "";
const TIME_ZONE = "Asia/Tokyo";
const MAX_MESSAGE_LENGTH = 1600;
const DUPLICATE_WINDOW_SECONDS = 300;

const ALLOWED_SUBJECTS = [
  "Webアプリ開発のご相談",
  "既存システム改善のご相談",
  "AI機能の導入・検証",
  "QA・テスト設計のご相談",
  "みせまるクラウド導入のご相談",
  "その他",
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput({ ok: false, error: "Invalid payload" });
    }

    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (_) {
      return jsonOutput({ ok: false, error: "Invalid JSON" });
    }

    if (sanitizeSingleLine(body.website, 200)) {
      // Honeypot filled: pretend success without sending mail.
      return jsonOutput({ ok: true });
    }

    const email = sanitizeSingleLine(body.email, 254).toLowerCase();
    const subject = sanitizeSingleLine(body.subject, 100);
    const name = sanitizeSingleLine(body.name, 100);
    // Accept the old `salon` key during the deployment transition.
    const organization = sanitizeSingleLine(body.organization || body.salon, 160);
    const message = sanitizeMessage(body.message, MAX_MESSAGE_LENGTH);
    const source = sanitizeSingleLine(body.source || "nakayama_works_lp/index.html", 200);
    const lang = sanitizeSingleLine(body.lang || "ja", 12);
    const privacyAccepted = body.privacyAccepted === true;

    if (!name) {
      return jsonOutput({ ok: false, error: "Name required" });
    }
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
    if (MailApp.getRemainingDailyQuota() < 1) {
      return jsonOutput({ ok: false, error: "Mail quota exceeded" });
    }

    const duplicateKey = createDuplicateKey(email, subject, message);
    const cache = CacheService.getScriptCache();
    if (cache.get(duplicateKey)) {
      return jsonOutput({ ok: true, duplicate: true });
    }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) {
      return jsonOutput({ ok: false, error: "Server busy" });
    }

    try {
      // Check again after taking the lock to prevent simultaneous duplicate sends.
      if (cache.get(duplicateKey)) {
        return jsonOutput({ ok: true, duplicate: true });
      }

      const requestId = Utilities.getUuid();
      const receivedAt = Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd HH:mm:ss");
      const payload = {
        requestId: requestId,
        receivedAt: receivedAt,
        subject: subject,
        name: name,
        organization: organization,
        email: email,
        lang: lang,
        source: source,
        message: message,
      };
      const sendOptions = {
        to: DESTINATION_EMAIL,
        subject: "[Nakayama Works] " + subject + " / " + email,
        replyTo: email,
        name: "Nakayama Works Contact",
        body: formatEmail(payload),
        htmlBody: formatEmailHtml(payload),
      };
      if (CC_EMAIL) {
        sendOptions.cc = CC_EMAIL;
      }

      MailApp.sendEmail(sendOptions);
      cache.put(duplicateKey, "1", DUPLICATE_WINDOW_SECONDS);
      return jsonOutput({ ok: true, requestId: requestId });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonOutput({ ok: false, error: "Send failed" });
  }
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
    "受付番号   : " + payload.requestId + "\n" +
    "件名       : " + payload.subject + "\n" +
    "お名前     : " + payload.name + "\n" +
    "会社・組織名: " + (payload.organization || "(未入力)") + "\n" +
    "メール     : " + payload.email + "\n" +
    "言語       : " + payload.lang + "\n" +
    "送信元     : " + payload.source + "\n" +
    "受信時刻   : " + payload.receivedAt + "\n" +
    "------------------------------\n" +
    payload.message + "\n" +
    "------------------------------\n"
  );
}

function formatEmailHtml(payload) {
  const lines = [
    ["受付番号", payload.requestId],
    ["件名", payload.subject],
    ["お名前", payload.name],
    ["会社・組織名", payload.organization || "(未入力)"],
    ["メール", payload.email],
    ["言語", payload.lang],
    ["送信元", payload.source],
    ["受信時刻", payload.receivedAt],
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

function sanitizeSingleLine(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMessage(value, maxLength) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
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

function createDuplicateKey(email, subject, message) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email + "\n" + subject + "\n" + message,
    Utilities.Charset.UTF_8
  );
  return "contact:" + Utilities.base64EncodeWebSafe(digest).slice(0, 64);
}
