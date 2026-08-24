/* 后台脚本加载 + content.js 解析往返测试 */
const fs = require("fs");
const vm = require("vm");

function stub() {
  const s = {
    innerHTML: "", textContent: "", value: "", dataset: {}, style: {}, className: "", title: "", disabled: false,
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute() { return null; },
    appendChild() {}, addEventListener() {}, reset() {},
    querySelector() { return stub(); }, querySelectorAll() { return []; },
  };
  return s;
}

const documentStub = {
  body: Object.assign(stub(), { getAttribute: () => "admin", setAttribute() {} }),
  documentElement: stub(), head: stub(), title: "",
  getElementById() { return stub(); },
  querySelector() { return stub(); },
  querySelectorAll() { return []; },
  createElement() { return stub(); }, addEventListener() {},
};

const sandbox = {
  window: {}, document: documentStub,
  location: { search: "", href: "http://x/admin.html" },
  localStorage: { getItem() { return null; }, setItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {} },
  history: { replaceState() {} }, URL, console,
  setTimeout() { return 1; }, clearTimeout() {},
  addEventListener() {},
  indexedDB: undefined,
};
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);

for (const f of ["js/admin/auth-config.js", "js/admin/fs-helper.js", "js/admin/auth.js", "js/admin/admin-app.js"]) {
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  console.log("LOADED", f);
}

/* content.js 解析往返（fs-helper 读写逻辑） */
const text = fs.readFileSync("data/content.js", "utf8");
const json = JSON.parse(text.replace(/^[\s\S]*?window\.SITE_DATA\s*=\s*/, "").replace(/;\s*$/, ""));
const out = "window.SITE_DATA = " + JSON.stringify(json, null, 2) + ";\n";
const back = JSON.parse(out.replace(/^[\s\S]*?window\.SITE_DATA\s*=\s*/, "").replace(/;\s*$/, ""));
console.log("roundtrip equal:", JSON.stringify(json) === JSON.stringify(back),
  "| products:", json.productCategories.map(c => c.id + ":" + c.products.length).join(", "));

/* 登录哈希校验（与 auth.js 相同算法） */
(async () => {
  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update("BX2026-static-salt-9f3a" + "baoxiang2026").digest("hex");
  console.log("password hash match:", hash === "5913fd55ca18db5ad00ebc509e71e5d36473de64303643d2916ce996879b226f");
})();
