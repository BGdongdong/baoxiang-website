/* ============================================================
   products.js — 产品服务：按核心业务 / 其他业务 / 许可项目分类展示
   ============================================================ */
(function () {

  function render() {
    document.getElementById("page-title").textContent = BX.lang === "zh" ? "产品服务" : "Products & Services";
    document.getElementById("page-subtitle").textContent = BX.lang === "zh"
      ? "汽车冲压件、焊接总成件、再生资源回收"
      : "Auto stamping parts, welding assemblies and recycling services.";

    var html = (BX.data.productCategories || []).map(function (cat) {
      var cards = (cat.products || []).map(function (p) {
        return '<a class="product-card" href="product-detail.html?id=' + BX.esc(p.id) + '">' +
          '<div class="p-img"><img src="' + BX.esc(p.image) + '" alt="' + BX.esc(BX.t(p.name)) + '" loading="lazy"></div>' +
          '<div class="p-body"><h4>' + BX.esc(BX.t(p.name)) + "</h4>" +
          '<p>' + BX.esc(BX.t(p.summary)) + "</p>" +
          '<div class="p-more">' + (BX.lang === "zh" ? "查看详情 →" : "View details →") + "</div></div></a>";
      }).join("");

      return '<div class="category-block">' +
        '<div class="category-head"><h3>' + BX.esc(BX.t(cat.name)) + "</h3>" +
        '<span class="cat-desc">' + BX.esc(BX.t(cat.desc)) + "</span></div>" +
        '<div class="product-grid">' + cards + "</div></div>";
    }).join("");

    document.getElementById("category-list").innerHTML = html;
  }

  BX.pageRender = render;
  BX.initCommon();
})();
