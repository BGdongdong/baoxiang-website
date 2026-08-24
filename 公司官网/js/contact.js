/* ============================================================
   contact.js — 联系我们：联系方式 / 地图 / 在线留言表单
   表单：前端校验 + 成功提示 + mailto 兜底发送
   ============================================================ */
(function () {

  function renderInfo() {
    var d = BX.data;
    var c = d.contact;
    document.getElementById("page-title").textContent = BX.lang === "zh" ? "联系我们" : "Contact Us";
    document.getElementById("page-subtitle").textContent = BX.lang === "zh"
      ? "欢迎随时与我们联系，我们将竭诚为您服务"
      : "Feel free to reach out — we are always at your service";

    var telHref = "tel:" + String(c.phone || "").replace(/[^+\d]/g, "");
    var mailHref = "mailto:" + c.email;

    var items = [
      { icon: "pin",   title: BX.lang === "zh" ? "公司地址" : "Address",  value: BX.t(c.address), href: "" },
      { icon: "phone", title: BX.lang === "zh" ? "联系电话" : "Phone",    value: c.phone, href: telHref },
      { icon: "mail",  title: BX.lang === "zh" ? "电子邮箱" : "Email",     value: c.email, href: mailHref },
      { icon: "clock", title: BX.lang === "zh" ? "工作时间" : "Worktime",  value: BX.t(c.worktime), href: "" }
    ];

    document.getElementById("contact-info").innerHTML =
      '<ul class="ci-list">' +
      items.map(function (it) {
        var value = it.href ? '<a href="' + BX.esc(it.href) + '">' + BX.esc(it.value) + "</a>" : BX.esc(it.value);
        return '<li class="ci-row">' +
          '<span class="ci-icon">' + BX.icon(it.icon) + "</span>" +
          "<div><h4>" + BX.esc(it.title) + "</h4><p>" + value + "</p></div></li>";
      }).join("") +
      "</ul>" +
      '<div class="map-note" id="map-box">' +
        (c.mapEmbedUrl
          ? '<iframe src="' + BX.esc(c.mapEmbedUrl) + '" title="map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
          : BX.icon("pin") + " " +
            (BX.lang === "zh"
              ? "地图位置将在后台配置完成后自动显示"
              : "Map location will appear once configured in the admin panel")) +
        "</div>";
  }

  function renderForm() {
    var f = BX.data.contact.form;
    document.getElementById("form-title").textContent = BX.t(f.title);
    document.getElementById("form-subtitle").textContent = BX.t(f.subtitle);
    document.getElementById("lb-name").innerHTML = BX.esc(BX.t(f.nameLabel)) + ' <span class="req">*</span>';
    document.getElementById("lb-contact").innerHTML = BX.esc(BX.t(f.contactLabel)) + ' <span class="req">*</span>';
    document.getElementById("lb-message").innerHTML = BX.esc(BX.t(f.messageLabel)) + ' <span class="req">*</span>';
    document.getElementById("f-name").placeholder = BX.t(f.namePlaceholder);
    document.getElementById("f-contact").placeholder = BX.t(f.contactPlaceholder);
    document.getElementById("f-message").placeholder = BX.t(f.messagePlaceholder);
    document.getElementById("btn-submit").textContent = BX.t(f.submitText);
    document.getElementById("sc-title").textContent = BX.t(f.successTitle);
    document.getElementById("sc-desc").textContent = BX.t(f.successDesc);
    document.getElementById("mailto-btn").textContent = BX.t(f.mailtoText);
    document.getElementById("reset-btn").textContent = BX.t(f.resetText);
  }

  /* ---------- 表单校验与提交 ---------- */
  function validName(v) { return v.trim().length >= 2 && v.trim().length <= 20; }
  function validContact(v) {
    return /^1[3-9]\d{9}$/.test(v) || /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(v) || /^0\d{2,3}-?\d{7,8}$/.test(v);
  }
  function validMessage(v) { return v.trim().length > 0 && v.length <= 500; }

  function showErr(id, msg) {
    document.getElementById("fg-" + id).classList.add("invalid");
    document.getElementById("err-" + id).textContent = msg;
  }
  function clearErrs() {
    ["name", "contact", "message"].forEach(function (id) {
      document.getElementById("fg-" + id).classList.remove("invalid");
    });
  }

  function bindForm() {
    var form = document.getElementById("contact-form");
    if (!form || form.dataset.bound) return;
    form.dataset.bound = "1";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = BX.data.contact.form;
      var name = document.getElementById("f-name").value;
      var contact = document.getElementById("f-contact").value.trim();
      var message = document.getElementById("f-message").value.trim();
      clearErrs();
      var ok = true;
      if (!validName(name)) { showErr("name", BX.t(f.errName)); ok = false; }
      if (!validContact(contact)) { showErr("contact", BX.t(f.errContact)); ok = false; }
      if (!validMessage(message)) { showErr("message", BX.t(f.errMessage)); ok = false; }
      if (!ok) return;

      /* 纯静态站点：显示成功提示 + mailto 兜底发送 */
      document.getElementById("mailto-btn").href =
        "mailto:" + BX.data.contact.email +
        "?subject=" + encodeURIComponent((BX.lang === "zh" ? "官网留言 - " : "Website message - ") + name) +
        "&body=" + encodeURIComponent(
          (BX.lang === "zh" ? "姓名：" : "Name: ") + name + "\n" +
          (BX.lang === "zh" ? "联系方式：" : "Contact: ") + contact + "\n" +
          (BX.lang === "zh" ? "留言内容：" : "Message: ") + message);
      document.getElementById("form-wrap").style.display = "none";
      document.getElementById("form-success").classList.add("show");
    });

    document.getElementById("reset-btn").addEventListener("click", function () {
      form.reset();
      clearErrs();
      document.getElementById("form-success").classList.remove("show");
      document.getElementById("form-wrap").style.display = "";
    });
  }

  BX.pageRender = function () {
    renderInfo();
    renderForm();
    bindForm();
  };

  BX.initCommon();
})();
