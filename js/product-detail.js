/* ============================================================
   product-detail.js — 产品图文详情页（?id= 路由）
   含动态 Product JSON-LD 结构化数据
   ============================================================ */
(function () {

  function currentId() {
    var m = /[?&]id=([^&]+)/.exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function injectJsonLd(product) {
    var el = document.getElementById("product-jsonld");
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "product-jsonld";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": BX.t(product.name),
      "image": product.image,
      "description": BX.t(product.summary),
      "brand": { "@type": "Brand", "name": BX.t(BX.data.site.companyName) },
      "category": BX.t(product.categoryName)
    });
  }

  function render() {
    var id = currentId();
    var found = id ? BX.getProductById(id) : null;
    var box = document.getElementById("detail-container");

    if (!found) {
      box.querySelector("#detail-not-found").style.display = "block";
      var nf = box.querySelector("#detail-not-found");
      nf.querySelector("h2").textContent = BX.lang === "zh" ? "未找到该产品" : "Product Not Found";
      nf.querySelector("p").textContent = BX.lang === "zh"
        ? "该产品可能已下架或链接有误，请返回产品列表查看其他产品。"
        : "This product may no longer be available. Please go back to the product list.";
      nf.querySelector("a").textContent = BX.lang === "zh" ? "返回产品服务" : "Back to Products";
      document.getElementById("crumb-current").textContent = BX.lang === "zh" ? "产品详情" : "Details";
      return;
    }

    var p = found.product;
    var cat = found.cat;
    document.getElementById("crumb-current").textContent = BX.t(p.name);
    document.title = BX.t(p.name) + " - " + BX.t(BX.data.site.companyName);
    injectJsonLd(Object.assign({ categoryName: cat.name }, p));

    var patentBlock = p.patent && BX.t(p.patentNo)
      ? '<div style="margin: 14px 0"><span class="badge badge-patent">★ ' +
        (BX.lang === "zh" ? "专利技术" : "Patented") + " · " + BX.esc(BX.t(p.patentNo)) + "</span></div>"
      : "";

    var specsHtml = (p.specs && p.specs.length)
      ? '<h3 class="detail-sub">' + (BX.lang === "zh" ? "技术规格" : "Specifications") + "</h3>" +
        '<table class="spec-table">' +
        p.specs.map(function (s) {
          return "<tr><th>" + BX.esc(BX.t(s.label)) + "</th><td>" + BX.esc(BX.t(s.value)) + "</td></tr>";
        }).join("") + "</table>"
      : "";

    var featuresHtml = (p.features && p.features.length)
      ? '<h3 class="detail-sub">' + (BX.lang === "zh" ? "产品特点" : "Key Features") + "</h3>" +
        '<ul class="feature-list">' +
        p.features.map(function (f) { return "<li>" + BX.esc(BX.t(f)) + "</li>"; }).join("") +
        "</ul>"
      : "";

    var gallery = [p.image].concat(p.gallery || []);
    var galleryHtml = (p.gallery && p.gallery.length)
      ? '<h3 class="detail-sub">' + (BX.lang === "zh" ? "产品图库" : "Gallery") + "</h3>" +
        '<div class="detail-gallery">' +
        gallery.map(function (g) {
          return '<div class="img-frame"><img src="' + BX.esc(g) + '" alt="' + BX.esc(BX.t(p.name)) + '" loading="lazy"></div>';
        }).join("") + "</div>"
      : "";

    var d = BX.data;
    box.innerHTML =
      '<div class="product-detail-grid">' +
        "<div>" +
          '<div class="img-frame wide" style="border-radius: var(--radius); overflow: hidden"><img src="' + BX.esc(p.image) + '" alt="' + BX.esc(BX.t(p.name)) + '"></div>' +
          galleryHtml +
        "</div>" +
        "<div>" +
          '<span class="badge">' + BX.esc(BX.t(cat.name)) + "</span>" +
          '<h1 style="font-size: 30px; margin: 12px 0 8px">' + BX.esc(BX.t(p.name)) + "</h1>" +
          '<p style="color: var(--text-muted); font-size: 16px; margin-bottom: 8px">' + BX.esc(BX.t(p.summary)) + "</p>" +
          patentBlock +
          '<h3 class="detail-sub">' + (BX.lang === "zh" ? "产品详情" : "Product Details") + "</h3>" +
          "<p>" + BX.esc(BX.t(p.detail)) + "</p>" +
          featuresHtml + specsHtml +
          '<div style="margin-top: 26px; display: flex; gap: 12px; flex-wrap: wrap">' +
            '<a class="btn btn-primary" href="contact.html">' + (BX.lang === "zh" ? "咨询该产品" : "Inquire Now") + "</a>" +
            '<a class="btn btn-outline" href="products.html">' + (BX.lang === "zh" ? "返回产品列表" : "Back to Products") + "</a>" +
          "</div>" +
          '<div style="margin-top: 20px; font-size: 14px; color: var(--text-muted)">☎ ' +
            BX.esc(d.contact.phone) + " · ✉ " + BX.esc(d.contact.email) + "</div>" +
        "</div>" +
      "</div>";
  }

  BX.pageRender = render;
  BX.initCommon();
})();
