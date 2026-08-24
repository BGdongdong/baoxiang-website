/* ============================================================
   theme.js — 显示模式切换：浅色 / 深色
   状态存 localStorage('bx_theme')，首屏由 HTML 内联脚本预先设置防闪烁
   ============================================================ */
(function () {
  var STORE_KEY = "bx_theme";
  var THEMES = ["light", "dark"];

  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  BX.getTheme = function () {
    try {
      var t = localStorage.getItem(STORE_KEY);
      if (THEMES.indexOf(t) >= 0) return t;
    } catch (e) {}
    return getSystemTheme();
  };

  BX.setTheme = function (theme) {
    if (THEMES.indexOf(theme) < 0) return;
    document.body.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORE_KEY, theme); } catch (e) {}
    BX.updateThemeIcon();
  };

  BX.toggleTheme = function () {
    var current = BX.getTheme();
    BX.setTheme(current === "light" ? "dark" : "light");
  };

  BX.updateThemeIcon = function () {
    var btn = document.querySelector(".theme-switch > button");
    if (!btn) return;
    var isDark = BX.getTheme() === "dark";
    btn.setAttribute("aria-label", isDark ? "切换到浅色模式" : "切换到深色模式");
    btn.title = isDark ? "浅色模式" : "深色模式";
    btn.innerHTML = isDark ? BX.icon("sun") : BX.icon("moon");
  };

  BX.initThemeSwitcher = function () {
    var btn = document.querySelector(".theme-switch > button");
    if (!btn) return;
    btn.addEventListener("click", function () { BX.toggleTheme(); });
    BX.updateThemeIcon();
  };
})();
