/* 前台页面渲染冒烟测试：用最小 DOM 垫片执行各页面 JS 的完整渲染流程 */
const fs = require("fs");
const vm = require("vm");

function stub() {
  const s = {
    innerHTML: "", textContent: "", value: "", dataset: {},
    style: {}, className: "", title: "",
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute() { return "home"; },
    appendChild() {}, addEventListener() {}, reset() {},
    querySelector() { return stub(); },
    querySelectorAll() { return []; },
    forEach() {},
  };
  return s;
}

const pages = [
  ["index.html", "js/home.js", "home"],
  ["about.html", "js/about.js", "about"],
  ["products.html", "js/products.js", "products"],
  ["product-detail.html", "js/product-detail.js", "products"],
  ["contact.html", "js/contact.js", "contact"],
];

let failures = 0;

for (const [htmlFile, jsFile, pageId] of pages) {
  for (const lang of ["zh", "en"]) {
    try {
      const documentStub = {
        body: Object.assign(stub(), { getAttribute: () => pageId, setAttribute() {} }),
        documentElement: stub(),
        head: stub(),
        title: "",
        getElementById() { return stub(); },
        querySelector() { return stub(); },
        querySelectorAll() { return []; },
        createElement() { return stub(); },
        addEventListener() {},
      };
      const sandbox = {
        window: {},
        document: documentStub,
        location: { search: lang === "en" ? "?lang=en" : "", href: "http://localhost/index.html" },
        localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; } },
        sessionStorage: { _m: {}, getItem() { return null; }, setItem() {} },
        history: { replaceState() {} },
        URL,
        console,
        setInterval() { return 1; }, clearInterval() {},
        setTimeout() { return 1; }, clearTimeout() {},
        navigator: { userAgent: "test" },
      };
      sandbox.window = sandbox;
      const ctx = vm.createContext(sandbox);
      for (const f of ["data/content.js", "js/data.js", "js/i18n.js", "js/theme.js", "js/common.js", jsFile]) {
        vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
      }
      if (sandbox.BX.lang !== lang) throw new Error("语言检测错误: " + sandbox.BX.lang);
      sandbox.BX.pageRender();      // 首次渲染
      sandbox.BX.setLang(lang === "zh" ? "en" : "zh"); // 切换语言触发重渲染
      console.log("PASS  " + jsFile + "  lang=" + lang);
    } catch (e) {
      failures++;
      console.log("FAIL  " + jsFile + "  lang=" + lang + "  → " + e.message);
    }
  }
}

/* 产品路由：模拟 ?id= 各种取值 */
try {
  const documentStub = {
    body: Object.assign(stub(), { getAttribute: () => "products", setAttribute() {} }),
    documentElement: stub(), head: stub(), title: "",
    getElementById() { return stub(); },
    querySelector() { return stub(); },
    querySelectorAll() { return []; },
    createElement() { return stub(); }, addEventListener() {},
  };
  const sandbox = {
    window: {}, document: documentStub,
    location: { search: "?id=assembly-geely&lang=en", href: "http://localhost/product-detail.html?id=assembly-geely" },
    localStorage: { getItem() { return null; }, setItem() {} },
    sessionStorage: { getItem() { return null; }, setItem() {} },
    history: { replaceState() {} }, URL, console,
    setInterval() { return 1; }, clearInterval() {}, setTimeout() { return 1; }, clearTimeout() {},
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const f of ["data/content.js", "js/data.js", "js/i18n.js", "js/theme.js", "js/common.js", "js/product-detail.js"]) {
    vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  }
  sandbox.BX.pageRender();
  console.log("PASS  product-detail 路由渲染（?id=assembly-geely&lang=en）");
} catch (e) {
  failures++;
  console.log("FAIL  product-detail 路由渲染 → " + e.message);
}

console.log(failures === 0 ? "\n全部通过 ✔" : "\n失败 " + failures + " 项 ✘");
process.exit(failures === 0 ? 0 : 1);
