/* ============================================================
   admin-app.js — 后台编辑器主体
   数据模型：data/content.js（window.SITE_DATA）
   交互：登录后选择网站文件夹 → 分 Tab 表单编辑 → 保存（自动备份）
   ============================================================ */
(function () {
  var App = window.AdminApp = {};
  var state = { root: null, rootName: "", data: null, pendingRoot: null, dirty: false, tab: "site" };

  /* ================= 工具 ================= */
  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function toast(msg, isErr) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "toast show" + (isErr ? " err" : "");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.className = "toast"; }, 2600);
  }
  function markDirty() {
    state.dirty = true;
    document.getElementById("dirty-tip").textContent = "● 有未保存的修改";
    document.getElementById("dirty-tip").classList.add("dirty");
  }
  function clearDirty() {
    state.dirty = false;
    document.getElementById("dirty-tip").textContent = "未做修改";
    document.getElementById("dirty-tip").classList.remove("dirty");
  }
  function section(title) {
    var s = el('<div class="edit-section"><h3>' + esc(title) + "</h3><div class=\"edit-body\"></div></div>");
    document.getElementById("admin-panel").appendChild(s);
    return s.querySelector(".edit-body");
  }

  /* ================= 字段构建器 ================= */

  /* 双语字段：中文 + 英文 并排 */
  function biField(labelText, obj, key, opts) {
    opts = opts || {};
    if (!obj[key] || typeof obj[key] !== "object") obj[key] = { zh: "", en: "" };
    var f = obj[key];
    var inputTag = opts.textarea ? "textarea" : 'input type="text"';
    var node = el('<div class="field-row"><label>' + esc(labelText) +
      (opts.hint ? ' <span class="hint">' + esc(opts.hint) + "</span>" : "") + "</label>" +
      '<div class="bi-inputs">' +
        '<div class="col"><span class="tag">中文</span><' + inputTag + ' data-k="zh"></div>' +
        '<div class="col"><span class="tag">English</span><' + inputTag + ' data-k="en"></div>' +
      "</div></div>");
    node.querySelectorAll("[data-k]").forEach(function (inp) {
      inp.value = f[inp.getAttribute("data-k")] || "";
      inp.addEventListener("input", function () {
        f[inp.getAttribute("data-k")] = inp.value;
        markDirty();
      });
    });
    return node;
  }

  /* 单值字段（电话、路径等） */
  function singleField(labelText, obj, key, opts) {
    opts = opts || {};
    var inputTag = opts.textarea ? "textarea" : 'input type="text"';
    var node = el('<div class="field-row"><label>' + esc(labelText) +
      (opts.hint ? ' <span class="hint">' + esc(opts.hint) + "</span>" : "") + "</label>" +
      '<div class="single-input"><' + inputTag + '></div></div>');
    var inp = node.querySelector("input, textarea");
    inp.value = obj[key] || "";
    inp.addEventListener("input", function () { obj[key] = inp.value; markDirty(); });
    return node;
  }

  /* 图片字段：预览 + 上传 + 路径 */
  function imageField(labelText, obj, key) {
    var node = el('<div class="field-row"><label>' + esc(labelText) + ' <span class="hint">建议 ≤ 2MB（jpg / png / webp / svg）</span></label>' +
      '<div class="img-field">' +
        '<div class="img-preview"><img alt="preview"></div>' +
        '<div class="img-controls">' +
          '<div class="path-row"><input type="text" placeholder="图片路径"><button class="btn btn-outline btn-sm up-btn" type="button">上传图片</button></div>' +
        "</div></div></div>");
    var img = node.querySelector("img");
    var pathInput = node.querySelector("input");
    var upBtn = node.querySelector(".up-btn");

    function refresh() { img.src = obj[key] || ""; img.style.display = obj[key] ? "" : "none"; }
    pathInput.value = obj[key] || "";
    refresh();
    pathInput.addEventListener("input", function () { obj[key] = pathInput.value; refresh(); markDirty(); });
    upBtn.addEventListener("click", async function () {
      if (!state.root) { toast("请先选择网站文件夹", true); return; }
      try {
        var rel = await FS.pickAndSaveImage(state.root);
        obj[key] = rel;
        pathInput.value = rel;
        refresh();
        markDirty();
        toast("图片已上传：" + rel);
      } catch (e) {
        if (e && e.name !== "AbortError") toast(e.message, true);
      }
    });
    return node;
  }

  /* 复选框字段 */
  function checkField(labelText, obj, key) {
    var node = el('<div class="check-row"><input type="checkbox"><span>' + esc(labelText) + "</span></div>");
    var cb = node.querySelector("input");
    cb.checked = !!obj[key];
    cb.addEventListener("change", function () { obj[key] = cb.checked; markDirty(); });
    return node;
  }

  /* 通用列表编辑器：增删 + 行内容 */
  function listEditor(items, rowBuilder, addLabel, factory) {
    var wrap = el("<div></div>");
    function refresh() {
      wrap.innerHTML = "";
      items.forEach(function (item, i) {
        var li = el('<div class="list-item"></div>');
        var head = el('<div class="list-item-head"><span>第 ' + (i + 1) + ' 项</span>' +
          '<button class="btn btn-danger btn-sm del" type="button">删除</button></div>');
        head.querySelector(".del").addEventListener("click", function () {
          if (confirm("确定删除第 " + (i + 1) + " 项？")) {
            items.splice(i, 1);
            markDirty();
            refresh();
          }
        });
        var body = el('<div class="list-item-body"></div>');
        body.appendChild(rowBuilder(item, refresh));
        li.appendChild(head);
        li.appendChild(body);
        wrap.appendChild(li);
      });
      var add = el('<button class="add-btn" type="button">＋ ' + esc(addLabel) + "</button>");
      add.addEventListener("click", function () {
        items.push(factory());
        markDirty();
        refresh();
      });
      wrap.appendChild(add);
    }
    refresh();
    return wrap;
  }

  /* ================= 各 Tab 渲染 ================= */

  function renderSite() {
    var d = state.data.site;
    var b = section("公司名称与 Logo");
    b.appendChild(biField("公司名称（全称）", d, "companyName"));
    b.appendChild(biField("公司简称", d, "companyShort"));
    b.appendChild(biField("宣传口号", d, "slogan"));
    b.appendChild(imageField("公司 Logo", d, "logo"));

    var b2 = section("联系信息（页脚与联系方式页共用）");
    b2.appendChild(singleField("联系电话", d, "phone"));
    b2.appendChild(singleField("电子邮箱", d, "email"));
    b2.appendChild(biField("ICP 备案号（无则留空）", d, "icp"));
  }

  function renderHome() {
    var h = state.data.home;

    var b0 = section("首屏主视觉（Hero）");
    b0.appendChild(biField("大标题", h.hero, "title"));
    b0.appendChild(biField("副标题", h.hero, "subtitle", { textarea: true }));
    b0.appendChild(imageField("主视觉图片", h.hero, "image"));
    b0.appendChild(biField("按钮文字", h.hero, "ctaText"));
    b0.appendChild(singleField("按钮链接", h.hero, "ctaLink", { hint: "如 products.html" }));

    var b1 = section("核心业务板块");
    b1.appendChild(biField("板块标题", h.business, "title"));
    b1.appendChild(biField("板块副标题", h.business, "subtitle"));
    var iconOptions = ["gear", "cart", "flask", "box", "truck", "factory", "shield", "car"];
    b1.appendChild(listEditor(h.business.items, function (item) {
      var row = el("<div></div>");
      var sel = el('<div class="field-row"><label>图标</label><div class="single-input"><select>' +
        iconOptions.map(function (i) { return '<option value="' + i + '">' + i + "</option>"; }).join("") +
        "</select></div></div>");
      sel.querySelector("select").value = item.icon || "gear";
      sel.querySelector("select").addEventListener("change", function (e) { item.icon = e.target.value; markDirty(); });
      row.appendChild(sel);
      row.appendChild(biField("业务名称", item, "title"));
      row.appendChild(biField("业务描述", item, "desc", { textarea: true }));
      return row;
    }, "添加业务卡片", function () { return { icon: "gear", title: { zh: "", en: "" }, desc: { zh: "", en: "" } }; }));

    var b2 = section("产品亮点");
    b2.appendChild(biField("板块标题", h.highlights, "title"));
    b2.appendChild(biField("板块副标题", h.highlights, "subtitle"));
    b2.appendChild(listEditor(h.highlights.items, function (item) {
      var row = el("<div></div>");
      row.appendChild(biField("产品名称", item, "title"));
      row.appendChild(biField("产品描述", item, "desc", { textarea: true }));
      row.appendChild(imageField("产品图片", item, "image"));
      row.appendChild(singleField("详情链接", item, "link", { hint: "如 product-detail.html?id=assembly-geely" }));
      return row;
    }, "添加亮点产品", function () {
      return { image: "assets/img/products/default-product.svg", title: { zh: "", en: "" }, desc: { zh: "", en: "" }, link: "products.html" };
    }));

    var b3 = section("轮播图推荐区");
    b3.appendChild(biField("板块标题", h.carousel, "title"));
    b3.appendChild(listEditor(h.carousel.slides, function (item) {
      var row = el("<div></div>");
      row.appendChild(biField("标题", item, "title"));
      row.appendChild(biField("描述", item, "desc"));
      row.appendChild(imageField("轮播图片（建议 21:9 宽幅）", item, "image"));
      row.appendChild(singleField("跳转链接", item, "link"));
      return row;
    }, "添加轮播图", function () {
      return { image: "assets/img/hero-factory.svg", title: { zh: "", en: "" }, desc: { zh: "", en: "" }, link: "products.html" };
    }));
  }

  function renderAbout() {
    var a = state.data.about;

    var b0 = section("公司简介");
    b0.appendChild(biField("板块标题", a.intro, "title"));
    b0.appendChild(biField("板块副标题", a.intro, "subtitle"));
    b0.appendChild(listEditor(a.intro.paragraphs, function (item) {
      return biField("段落内容", { text: item }, "text", { textarea: true });
    }, "添加段落", function () { return { zh: "", en: "" }; }));

    var b1 = section("简介轮播图片（关于我们页右侧）");
    if (!Array.isArray(a.intro.images)) a.intro.images = [];
    b1.appendChild(listEditor(a.intro.images, function (item) {
      var row = el("<div></div>");
      row.appendChild(imageField("轮播图片", item, "src"));
      row.appendChild(biField("图片说明", item, "caption"));
      return row;
    }, "添加轮播图片", function () { return { src: "assets/img/about/workshop-1.svg", caption: { zh: "", en: "" } }; }));
  }

  function specRow(item) {
    var row = el('<div class="spec-grid">' +
      '<div><div class="tag">参数名(中)</div><input type="text" data-f="lzh"></div>' +
      '<div><div class="tag">Label(EN)</div><input type="text" data-f="len"></div>' +
      '<div><div class="tag">参数值(中)</div><input type="text" data-f="vzh"></div>' +
      '<div><div class="tag">Value(EN)</div><input type="text" data-f="ven"></div>' +
      '<button class="icon-x" type="button" title="删除">✕</button></div>');
    function ensure() {
      if (!item.label) item.label = { zh: "", en: "" };
      if (!item.value) item.value = { zh: "", en: "" };
    }
    ensure();
    var map = { lzh: ["label", "zh"], len: ["label", "en"], vzh: ["value", "zh"], ven: ["value", "en"] };
    row.querySelectorAll("input").forEach(function (inp) {
      var pair = map[inp.getAttribute("data-f")];
      inp.value = item[pair[0]][pair[1]] || "";
      inp.addEventListener("input", function () { item[pair[0]][pair[1]] = inp.value; markDirty(); });
    });
    return { node: row, delBtn: row.querySelector(".icon-x") };
  }

  /* 产品图库编辑器：列表项为纯路径字符串，按下标编辑 */
  function galleryEditor(p) {
    if (!Array.isArray(p.gallery)) p.gallery = [];
    var wrap = el("<div></div>");
    function refresh() {
      wrap.innerHTML = "";
      p.gallery.forEach(function (path, i) {
        var li = el('<div class="list-item"></div>');
        var head = el('<div class="list-item-head"><span>图片 ' + (i + 1) + '</span>' +
          '<button class="btn btn-danger btn-sm del" type="button">删除</button></div>');
        head.querySelector(".del").addEventListener("click", function () {
          p.gallery.splice(i, 1);
          markDirty();
          refresh();
        });
        var body = el('<div class="list-item-body"></div>');

        var node = el('<div class="field-row"><div class="img-field">' +
          '<div class="img-preview"><img alt="preview"></div>' +
          '<div class="img-controls">' +
            '<div class="path-row"><input type="text" placeholder="图片路径"><button class="btn btn-outline btn-sm up-btn" type="button">上传图片</button></div>' +
          "</div></div></div>");
        var img = node.querySelector("img");
        var pathInput = node.querySelector("input");
        var upBtn = node.querySelector(".up-btn");
        function show(v) { pathInput.value = v; img.src = v; img.style.display = v ? "" : "none"; }
        show(path);
        pathInput.addEventListener("input", function () {
          p.gallery[i] = pathInput.value;
          show(pathInput.value);
          markDirty();
        });
        upBtn.addEventListener("click", async function () {
          if (!state.root) { toast("请先选择网站文件夹", true); return; }
          try {
            var rel = await FS.pickAndSaveImage(state.root);
            p.gallery[i] = rel;
            show(rel);
            markDirty();
            toast("图片已上传：" + rel);
          } catch (e) {
            if (e && e.name !== "AbortError") toast(e.message, true);
          }
        });

        body.appendChild(node);
        li.appendChild(head);
        li.appendChild(body);
        wrap.appendChild(li);
      });
      var add = el('<button class="add-btn" type="button">＋ 添加图库图片</button>');
      add.addEventListener("click", function () {
        p.gallery.push("assets/img/products/default-product.svg");
        markDirty();
        refresh();
      });
      wrap.appendChild(add);
    }
    refresh();
    return wrap;
  }

  function renderProducts() {
    state.data.productCategories.forEach(function (cat, ci) {
      var b = section("分类 " + (ci + 1) + "：" + (cat.name.zh || cat.id));
      b.appendChild(biField("分类名称", cat, "name"));
      b.appendChild(biField("分类说明", cat, "desc"));

      var wrap = el("<div></div>");
      b.appendChild(wrap);

      function refreshProducts() {
        wrap.innerHTML = "";
        cat.products.forEach(function (p, pi) {
          var block = el('<details class="product-block"></details>');
          var summary = el("<summary><span>" + (pi + 1) + ". " + esc(p.name.zh || p.id) +
            ' <span class="pid">ID: ' + esc(p.id) + "</span></span>" +
            '<button class="btn btn-danger btn-sm del-p" type="button">删除产品</button></summary>');
          summary.querySelector(".del-p").addEventListener("click", function (e) {
            e.preventDefault();
            if (confirm("确定删除产品「" + (p.name.zh || p.id) + "」？")) {
              cat.products.splice(pi, 1);
              markDirty();
              refreshProducts();
            }
          });
          block.appendChild(summary);

          var body = el('<div class="product-block-body"></div>');
          body.appendChild(biField("产品名称", p, "name"));
          body.appendChild(imageField("产品主图", p, "image"));
          body.appendChild(biField("列表页简介", p, "summary", { textarea: true }));
          body.appendChild(biField("详情页图文描述", p, "detail", { textarea: true }));
          body.appendChild(checkField("专利产品（展示专利标识）", p, "patent"));
          body.appendChild(biField("专利号", p, "patentNo"));

          var specsWrap = el('<div class="field-row"><label>技术规格</label></div>');
          var specsBox = el("<div></div>");
          specsWrap.appendChild(specsBox);
          function refreshSpecs() {
            specsBox.innerHTML = "";
            (p.specs || (p.specs = [])).forEach(function (s) {
              var sr = specRow(s);
              sr.delBtn.addEventListener("click", function () {
                p.specs.splice(p.specs.indexOf(s), 1);
                markDirty();
                refreshSpecs();
              });
              specsBox.appendChild(sr.node);
            });
            var add = el('<button class="add-btn" type="button">＋ 添加规格参数</button>');
            add.addEventListener("click", function () {
              p.specs.push({ label: { zh: "", en: "" }, value: { zh: "", en: "" } });
              markDirty();
              refreshSpecs();
            });
            specsBox.appendChild(add);
          }
          refreshSpecs();
          body.appendChild(specsWrap);

          var featWrap = el('<div class="field-row"><label>产品特点</label></div>');
          featWrap.appendChild(listEditor(p.features || (p.features = []), function (item) {
            return biField("特点", { text: item }, "text");
          }, "添加特点", function () { return { zh: "", en: "" }; }));
          body.appendChild(featWrap);

          var galWrap = el('<div class="field-row"><label>产品图库（除主图外的补充图片）</label></div>');
          galWrap.appendChild(galleryEditor(p));
          body.appendChild(galWrap);

          block.appendChild(body);
          wrap.appendChild(block);
        });

        var addP = el('<button class="add-btn" type="button">＋ 在此分类添加产品</button>');
        addP.addEventListener("click", function () {
          cat.products.push({
            id: "product-" + Date.now(),
            name: { zh: "新产品", en: "New Product" },
            image: "assets/img/products/default-product.svg",
            summary: { zh: "", en: "" },
            detail: { zh: "", en: "" },
            patent: false,
            patentNo: { zh: "", en: "" },
            specs: [],
            features: [],
            gallery: []
          });
          markDirty();
          refreshProducts();
        });
        wrap.appendChild(addP);
      }
      refreshProducts();
    });
  }

  function renderContact() {
    var c = state.data.contact;
    var b = section("联系信息");
    b.appendChild(biField("公司地址", c, "address"));
    b.appendChild(singleField("联系电话", c, "phone"));
    b.appendChild(singleField("电子邮箱", c, "email"));
    b.appendChild(biField("工作时间", c, "worktime"));
    b.appendChild(singleField("地图嵌入链接", c, "mapEmbedUrl", {
      hint: "高德/百度地图「分享 → 嵌入地图」生成的 iframe 链接，留空则显示占位说明"
    }));

    var f = c.form;
    var b2 = section("留言表单文案");
    b2.appendChild(biField("表单标题", f, "title"));
    b2.appendChild(biField("表单副标题", f, "subtitle"));
    b2.appendChild(biField("姓名占位提示", f, "namePlaceholder"));
    b2.appendChild(biField("联系方式占位提示", f, "contactPlaceholder"));
    b2.appendChild(biField("留言占位提示", f, "messagePlaceholder"));
    b2.appendChild(biField("提交按钮文字", f, "submitText"));
    b2.appendChild(biField("成功提示标题", f, "successTitle"));
    b2.appendChild(biField("成功提示描述", f, "successDesc"));

    var b3 = section("微信二维码（全站右侧浮窗展示）");
    b3.appendChild(imageField("二维码图片", c, "wechatQr"));
    b3.appendChild(biField("二维码下方文案", c, "wechat"));
  }

  function renderSeo() {
    var pages = [["home", "首页"], ["about", "关于我们"], ["products", "产品服务"], ["contact", "联系我们"]];
    pages.forEach(function (pg) {
      var m = state.data.meta[pg[0]];
      var b = section("SEO — " + pg[1]);
      b.appendChild(biField("页面标题（title）", m, "title", { hint: "建议 30 字以内，含核心关键词" }));
      b.appendChild(biField("页面描述（description）", m, "description", { textarea: true, hint: "建议 80—120 字" }));
    });
  }

  var RENDERERS = { site: renderSite, home: renderHome, about: renderAbout, products: renderProducts, contact: renderContact, seo: renderSeo };

  /* ================= 面板与 Tab ================= */
  function renderPanel() {
    document.getElementById("admin-panel").innerHTML = "";
    if (!state.data) {
      document.getElementById("admin-panel").appendChild(el(
        '<div class="admin-empty"><h2>请先选择网站文件夹</h2>' +
        "<p>点击右上角「选择网站文件夹」，选择本网站的根目录（即包含 index.html 的文件夹），即可开始编辑网站内容。</p>" +
        '<p class="dim">提示：编辑并保存后，本地即可预览效果；要让线上网站生效，需将更新后的文件上传到托管平台（详见使用手册）。</p></div>'));
      return;
    }
    (RENDERERS[state.tab] || renderSite)();
  }

  function bindTabs() {
    document.querySelectorAll("#admin-tabs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tab = btn.getAttribute("data-tab");
        document.querySelectorAll("#admin-tabs button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderPanel();
      });
    });
  }

  /* ================= 文件夹与保存 ================= */
  function updateFolderStatus(text, ok) {
    var elx = document.getElementById("folder-status");
    elx.textContent = text;
    elx.classList.toggle("ok", !!ok);
  }

  async function setRoot(root) {
    state.root = root;
    state.rootName = root.name;
    try {
      state.data = await FS.readContent(root);
      updateFolderStatus("✔ 已连接：" + root.name, true);
      renderPanel();
      toast("已加载网站数据：" + root.name);
    } catch (e) {
      state.root = null;
      updateFolderStatus("数据读取失败：" + e.message, false);
      toast("读取 data/content.js 失败：" + e.message, true);
    }
  }

  async function afterLogin() {
    if (!FS.supported()) {
      updateFolderStatus("当前浏览器不支持本地文件读写，请使用 Chrome / Edge", false);
      document.getElementById("btn-pick-folder").disabled = true;
      toast("请使用 Chrome 或 Edge 浏览器打开后台", true);
      return;
    }
    try {
      var restored = await FS.restoreRoot();
      if (restored && restored.needsPermission) {
        state.pendingRoot = restored.handle;
        updateFolderStatus("检测到上次选择过的文件夹，点击「选择网站文件夹」重新授权即可", false);
      } else if (restored) {
        await setRoot(restored);
      }
    } catch (e) { /* 忽略恢复失败 */ }
  }

  async function save() {
    if (!state.root || !state.data) { toast("请先选择网站文件夹", true); return; }
    try {
      JSON.stringify(state.data); /* 校验数据可序列化 */
      await FS.writeContent(state.root, state.data);
      clearDirty();
      toast("保存成功！已自动备份旧数据，可点击「预览网站」查看效果");
    } catch (e) {
      toast("保存失败：" + e.message, true);
    }
  }

  function exportData() {
    if (!state.data) { toast("请先选择网站文件夹", true); return; }
    var blob = new Blob(["window.SITE_DATA = " + JSON.stringify(state.data, null, 2) + ";\n"], { type: "text/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.js";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("已导出 content.js，请用它替换网站 data/ 目录下同名文件");
  }

  /* ================= 初始化 ================= */
  function bindGlobalButtons() {
    document.getElementById("btn-pick-folder").addEventListener("click", async function () {
      try {
        if (state.pendingRoot) {
          var r = await FS.requestRootPermission(state.pendingRoot);
          if (r) { state.pendingRoot = null; await setRoot(r); }
          return;
        }
        var root = await FS.pickRoot();
        await setRoot(root);
      } catch (e) {
        if (e && e.name !== "AbortError") toast(e.message, true);
      }
    });
    document.getElementById("btn-save").addEventListener("click", save);
    document.getElementById("btn-export").addEventListener("click", exportData);
    document.getElementById("btn-logout").addEventListener("click", function () {
      if (state.dirty && !confirm("有未保存的修改，确定退出？")) return;
      window.AdminLogout();
    });
    window.addEventListener("beforeunload", function (e) {
      if (state.dirty) { e.preventDefault(); e.returnValue = ""; }
    });
  }

  bindTabs();
  bindGlobalButtons();
  /* 已有登录会话时直接初始化 */
  if (sessionStorage.getItem("bx_admin_ok") === "1") afterLogin();

  App.afterLogin = afterLogin;
})();
