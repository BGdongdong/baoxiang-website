/* ============================================================
   auth.js — 后台登录（SHA-256 盐值哈希校验）
   说明：纯前端校验为防误入门槛；真正的发布权限由托管平台账号控制
   ============================================================ */
(function () {

  async function sha256Hex(text) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  var form = document.getElementById("login-form");
  var view = document.getElementById("login-view");
  var adminView = document.getElementById("admin-view");

  /* 已登录则直接进入 */
  if (sessionStorage.getItem("bx_admin_ok") === "1") {
    view.style.display = "none";
    adminView.style.display = "";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var pwd = document.getElementById("admin-password").value;
    var err = document.getElementById("login-error");
    err.classList.remove("show");
    try {
      var hash = await sha256Hex(window.ADMIN_SALT + pwd);
      if (hash === window.ADMIN_HASH) {
        sessionStorage.setItem("bx_admin_ok", "1");
        view.style.display = "none";
        adminView.style.display = "";
        if (window.AdminApp && window.AdminApp.afterLogin) window.AdminApp.afterLogin();
      } else {
        err.classList.add("show");
      }
    } catch (ex) {
      err.textContent = "校验失败：" + ex.message;
      err.classList.add("show");
    }
  });

  window.AdminLogout = function () {
    sessionStorage.removeItem("bx_admin_ok");
    location.reload();
  };
})();
