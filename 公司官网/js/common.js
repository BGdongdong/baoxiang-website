/* ============================================================
   common.js — 公共组件：页头导航、页脚、语言/主题切换器、重渲染入口
   页面使用方式：
     <body data-page="home">，页面 JS 设置 BX.pageRender = fn
     initCommon() 渲染页头页脚；切换语言时自动调用 BX.rerender()
   ============================================================ */
(function () {

  /* ---------- SVG 图标库 ---------- */
  var ICONS = {
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2"/><path d="M8.5 2h7"/><path d="M7 15h10"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="14" height="11" rx="1"/><path d="M15 9h4l4 4v3h-3"/><circle cx="6" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.41 1.41M18.36 18.36l1.41 1.41M1 12h2M21 12h2M4.22 19.78l1.41-1.41M18.36 5.64l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="13" width="4" height="7" rx="2"/><rect x="18" y="13" width="4" height="7" rx="2"/><path d="M21 19a3 3 0 0 1-3 3h-3"/><circle cx="12" cy="9" r="1.2" fill="currentColor" stroke="none"/></svg>',
    wechat: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66l-.7 2.1 2.45-1.23c.63.18 1.3.3 1.97.33a5.9 5.9 0 0 1-.25-1.66c0-3.14 3.02-5.7 6.75-5.7.23 0 .46.01.69.03C15.02 5.89 12.5 4 9.5 4z"/><path d="M22 14.2c0-2.6-2.46-4.7-5.5-4.7s-5.5 2.1-5.5 4.7 2.46 4.7 5.5 4.7c.62 0 1.22-.09 1.78-.25l2.22.9-.6-1.8A4.53 4.53 0 0 0 22 14.2z"/></svg>'
  };
  BX.icon = function (name) { return ICONS[name] || ICONS.gear; };

  /* ---------- 页头 ---------- */
  function renderHeader() {
    var d = BX.data;
    var pageId = document.body.getAttribute("data-page") || "home";
    var navHtml = (d.nav || []).map(function (item) {
      var active = item.id === pageId ? " active" : "";
      return '<a class="nav-link' + active + '" href="' + BX.esc(item.href) + '">' + BX.esc(BX.t(item.label)) + "</a>";
    }).join("");

    document.getElementById("site-header").innerHTML =
      '<div class="container">' +
        '<a class="brand" href="index.html">' +
          '<img src="' + BX.esc(d.site.logo) + '" alt="logo" class="brand-logo">' +
          '<span class="brand-name">' + BX.esc(BX.t(d.site.companyName)) + "</span>" +
        "</a>" +
        '<nav class="main-nav" id="main-nav">' + navHtml + "</nav>" +
        '<div class="header-tools">' +
          '<div class="lang-switch">' +
            '<button type="button" class="lang-btn" aria-label="Switch language" title="Switch language">' +
              (BX.lang === "zh" ? "中" : "EN") +
            "</button>" +
          "</div>" +
          '<div class="theme-switch">' +
            '<button type="button" aria-label="theme" title="">' +
              BX.icon("moon") +
            "</button>" +
          "</div>" +
          '<button class="menu-toggle" id="menu-toggle" aria-label="menu"><span></span><span></span><span></span></button>' +
        "</div>" +
      "</div>";

    /* 事件绑定 */
    var langBtn = document.querySelector(".lang-switch .lang-btn");
    if (langBtn) {
      langBtn.addEventListener("click", function () { BX.setLang(BX.lang === "zh" ? "en" : "zh"); });
    }
    var mt = document.getElementById("menu-toggle");
    var nav = document.getElementById("main-nav");
    mt.addEventListener("click", function () {
      mt.classList.toggle("open");
      nav.classList.toggle("open");
    });
    BX.initThemeSwitcher();
  }

  /* ---------- 页脚 ---------- */
  function renderFooter() {
    var d = BX.data;
    var year = new Date().getFullYear();
    var links = (d.nav || []).map(function (item) {
      return '<li><a href="' + BX.esc(item.href) + '">' + BX.esc(BX.t(item.label)) + "</a></li>";
    }).join("");

    var intro = BX.lang === "zh"
      ? "成立于 2018 年，位于江西省上饶市经济开发区，主营汽车冲压件、焊接总成件及再生资源回收。"
      : "Founded in 2018 in Shangrao Economic Development Zone, Jiangxi, specializing in auto stamping parts, welding assemblies and recycling services.";

    document.getElementById("site-footer").innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          "<div>" +
            '<div class="footer-logo"><img src="' + BX.esc(d.site.logo) + '" alt="logo"><span>' + BX.esc(BX.t(d.site.companyName)) + "</span></div>" +
            "<p>" + BX.esc(BX.t(d.site.slogan)) + "</p>" +
            "<p class=\"footer-intro\">" + BX.esc(intro) + "</p>" +
          "</div>" +
          "<div><h4>" + (BX.lang === "zh" ? "快速导航" : "Quick Links") + "</h4><ul>" + links + "</ul></div>" +
          "<div><h4>" + (BX.lang === "zh" ? "联系方式" : "Contact") + "</h4>" +
            "<p class=\"footer-contact\">" + BX.icon("pin") + "<span>" + BX.esc(BX.t(d.contact.address)) + "</span></p>" +
            "<p class=\"footer-contact\">☎ <span>" + BX.esc(d.contact.phone) + "</span></p>" +
            "<p class=\"footer-contact\">✉ <span>" + BX.esc(d.contact.email) + "</span></p>" +
          "</div>" +
        "</div>" +
        '<div class="footer-bottom">© ' + year + " " + BX.esc(BX.t(d.site.companyName)) +
        (BX.t(d.site.icp) ? ' · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">' + BX.esc(BX.t(d.site.icp)) + "</a>" : "") +
        "</div>" +
      "</div>";
  }

  /* ---------- 右侧联系浮窗 ---------- */
  function renderFloatContact() {
    var d = BX.data;
    var c = d.contact || {};
    var old = document.getElementById("float-contact");
    if (old && old.parentNode && old.parentNode.removeChild) old.parentNode.removeChild(old);

    var telHref = "tel:" + String(c.phone || "").replace(/[^+\d]/g, "");
    var el = document.createElement("div");
    el.className = "float-contact";
    el.id = "float-contact";
    el.innerHTML =
      '<button type="button" class="fc-trigger" aria-label="contact">' +
        '<span class="fc-icon">' + BX.icon("headset") + "</span>" +
      "</button>" +
      '<div class="fc-panel">' +
        '<div class="fc-arrow"></div>' +
        '<div class="fc-row">' +
          '<span class="fc-row-icon">' + BX.icon("phone") + "</span>" +
          "<div><h5>" + (BX.lang === "zh" ? "联系电话" : "Phone") + "</h5>" +
            '<a href="' + BX.esc(telHref) + '">' + BX.esc(c.phone || "") + "</a></div>" +
        "</div>" +
        '<div class="fc-divider"></div>' +
        '<div class="fc-row fc-row-qr">' +
          '<div class="fc-qr"><img src="' + BX.esc(c.wechatQr || "") + '" alt="WeChat QR"></div>' +
          "<div><h5>" + (BX.lang === "zh" ? "微信咨询" : "WeChat") + "</h5>" +
            "<p>" + BX.esc(BX.t(c.wechat)) + "</p></div>" +
        "</div>" +
      "</div>";

    document.body.appendChild(el);

    /* 触屏设备：点击图标切换展开 */
    var trigger = el.querySelector(".fc-trigger");
    if (trigger) {
      trigger.addEventListener("click", function () {
        el.classList.toggle("open");
      });
    }
    /* 点击页面其他区域收起（仅绑定一次） */
    if (!renderFloatContact._bound) {
      renderFloatContact._bound = true;
      document.addEventListener("click", function (e) {
        var fc = document.getElementById("float-contact");
        if (fc && fc.contains && !fc.contains(e.target)) fc.classList.remove("open");
      });
    }
  }

  /* ---------- 总渲染入口 ---------- */
  BX.rerender = function () {
    renderHeader();
    renderFooter();
    renderFloatContact();
    BX.applyMeta();
    if (typeof BX.pageRender === "function") BX.pageRender();
  };

  BX.initCommon = function () {
    BX.rerender();
  };
})();
