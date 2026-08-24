/* ============================================================
   data.js — 数据访问工具：双语取词 t()、产品检索等
   依赖：data/content.js（先加载）
   ============================================================ */
(function () {
  window.BX = window.BX || {};
  BX.data = window.SITE_DATA;

  /* 双语取词：传入 {zh,en} 对象或字符串，返回当前语言文本 */
  BX.t = function (field) {
    if (field === null || field === undefined) return "";
    if (typeof field === "string") return field;
    return field[BX.lang] || field.zh || field.en || "";
  };

  /* HTML 转义（内容来自后台编辑，防止意外破坏页面结构） */
  BX.esc = function (s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /* 遍历所有产品，返回 [{cat, product}] */
  BX.allProducts = function () {
    var list = [];
    (BX.data.productCategories || []).forEach(function (cat) {
      (cat.products || []).forEach(function (p) {
        list.push({ cat: cat, product: p });
      });
    });
    return list;
  };

  /* 按 id 查找产品：返回 {cat, product} 或 null */
  BX.getProductById = function (id) {
    var found = null;
    BX.allProducts().some(function (item) {
      if (item.product.id === id) { found = item; return true; }
      return false;
    });
    return found;
  };
})();
