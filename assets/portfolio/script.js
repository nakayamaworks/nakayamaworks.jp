(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");

  const closeMenu = () => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "メニューを開く");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const opening = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(opening));
      menuToggle.setAttribute("aria-label", opening ? "メニューを閉じる" : "メニューを開く");
      siteNav.classList.toggle("is-open", opening);
      document.body.classList.toggle("menu-open", opening);
    });
    siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  }

  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach((item) => observer.observe(item));
  }

  const form = document.getElementById("portfolioContactForm");
  const submit = document.getElementById("portfolioContactSubmit");
  const status = document.getElementById("portfolioContactStatus");
  const endpoint = window.NAKAYAMA_WORKS && window.NAKAYAMA_WORKS.CONTACT_ENDPOINT;

  if (!form || !submit || !status) return;

  const showStatus = (message, kind) => {
    status.textContent = message;
    status.className = "form-status" + (kind ? ` is-${kind}` : "");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showStatus("", "");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const website = String(data.get("website") || "").trim();
    if (website) return;

    const subject = String(data.get("subject") || "").trim();
    const name = String(data.get("name") || "").trim();
    const organization = String(data.get("organization") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const typeMap = {
      "Webアプリ開発のご相談": "service",
      "既存システム改善のご相談": "service",
      "AI機能の導入・検証": "service",
      "QA・テスト設計のご相談": "service",
      "みせまるクラウド導入のご相談": "setup",
      "その他": "other"
    };
    const payload = {
      type: typeMap[subject] || "other",
      subject,
      name,
      salon: organization,
      email,
      message,
      privacyAccepted: true,
      lang: "ja",
      source: "nakayama_works_lp/index-portfolio.html",
      website
    };

    submit.disabled = true;
    submit.innerHTML = "送信しています…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      if (!(response.ok || response.type === "opaque")) throw new Error("send_failed");
      form.reset();
      showStatus("送信しました。通常1〜2営業日以内にご連絡します。", "success");
    } catch (_) {
      showStatus("送信できませんでした。LINEまたは contact@nakayamaworks.jp へご連絡ください。", "error");
    } finally {
      submit.disabled = false;
      submit.innerHTML = "相談内容を送信する <span aria-hidden=\"true\">→</span>";
    }
  });
})();
