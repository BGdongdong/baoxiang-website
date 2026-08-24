/* ============================================================
   i18n.js — 中英文切换：URL 参数 + localStorage 记忆 + 无刷新重渲染
   语言状态：BX.lang ('zh' | 'en')
   ============================================================ */
(function () {
  var PARAM_KEY = "lang";
  var STORE_KEY = "bx_lang";

  function detect() {
    var m = /[?&]lang=(zh|en)/.exec(location.search);
    if (m) return m[1];
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (e) { /* 隐私模式忽略 */ }
    return "zh";
  }

  BX.lang = detect();

  BX.setLang = function (lang) {
    if (lang !== "zh" && lang !== "en") return;
    if (BX.lang === lang) return;
    BX.lang = lang;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    /* 同步 URL 参数，便于分享与抓取区分 */
    try {
      var url = new URL(location.href);
      url.searchParams.set(PARAM_KEY, lang);
      history.replaceState(null, "", url.toString());
    } catch (e) {}
    if (typeof BX.rerender === "function") BX.rerender();
  };

  /* 按 data-page 标识更新 <title>、meta description 与 html lang */
  BX.applyMeta = function () {
    var pageId = document.body.getAttribute("data-page") || "home";
    var meta = (BX.data.meta && BX.data.meta[pageId]) || null;
    document.documentElement.lang = BX.lang === "en" ? "en" : "zh-CN";
    if (meta) {
      if (meta.title) document.title = BX.t(meta.title);
      var desc = document.querySelector('meta[name="description"]');
      if (desc && meta.description) desc.setAttribute("content", BX.t(meta.description));
    }
  };
})();
