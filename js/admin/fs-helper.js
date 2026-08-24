/* ============================================================
   fs-helper.js — File System Access API 封装
   职责：选择/恢复网站根目录、读取与保存 data/content.js、上传图片到 assets/img/uploads/
   兼容性：Chrome / Edge 86+（file:// 与 https:// 均为 secure context）
   ============================================================ */
(function () {
  window.FS = {};

  FS.supported = function () {
    return typeof window.showDirectoryPicker === "function";
  };

  /* ---------- IndexedDB：持久化目录句柄 ---------- */
  var DB_NAME = "bx-admin-db", STORE = "handles";

  function idb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbSet(key, val) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }
  function idbGet(key) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(key);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  /* ---------- 目录选择与校验 ---------- */
  async function verifyRoot(root) {
    try {
      await root.getFileHandle("index.html");
      var dataDir = await root.getDirectoryHandle("data");
      await dataDir.getFileHandle("content.js");
      return true;
    } catch (e) {
      return false;
    }
  }

  /* 选择网站根目录（用户点击触发） */
  FS.pickRoot = async function () {
    if (!FS.supported()) throw new Error("当前浏览器不支持本地文件读写，请使用 Chrome 或 Edge");
    var root = await window.showDirectoryPicker({ mode: "readwrite" });
    if (!(await verifyRoot(root))) {
      throw new Error("所选文件夹不是网站根目录（未找到 index.html / data/content.js），请选择网站所在文件夹");
    }
    await idbSet("root", root);
    return root;
  };

  /* 恢复上次选择的目录句柄：权限已授予则直接返回，否则返回 null（需用户点击重新授权） */
  FS.restoreRoot = async function () {
    try {
      var root = await idbGet("root");
      if (!root) return null;
      var perm = await root.queryPermission({ mode: "readwrite" });
      if (perm === "granted") return root;
      return { needsPermission: true, handle: root };
    } catch (e) {
      return null;
    }
  };

  /* 对已恢复但未授权的句柄请求授权（必须在用户手势中调用） */
  FS.requestRootPermission = async function (root) {
    var perm = await root.requestPermission({ mode: "readwrite" });
    return perm === "granted" ? root : null;
  };

  /* ---------- content.js 读写 ---------- */
  FS.readContent = async function (root) {
    var dataDir = await root.getDirectoryHandle("data");
    var fh = await dataDir.getFileHandle("content.js");
    var text = await (await fh.getFile()).text();
    var json = text.replace(/^[\s\S]*?window\.SITE_DATA\s*=\s*/, "").replace(/;\s*$/, "");
    return JSON.parse(json);
  };

  FS.writeContent = async function (root, obj) {
    var dataDir = await root.getDirectoryHandle("data");
    var fh = await dataDir.getFileHandle("content.js");
    /* 1. 备份旧数据 */
    try {
      var oldText = await (await fh.getFile()).text();
      var bh = await dataDir.getFileHandle("content.backup.js", { create: true });
      var bw = await bh.createWritable();
      await bw.write(oldText);
      await bw.close();
    } catch (e) { /* 备份失败不阻断保存 */ }
    /* 2. 写入新数据 */
    var w = await fh.createWritable();
    await w.write("window.SITE_DATA = " + JSON.stringify(obj, null, 2) + ";\n");
    await w.close();
  };

  /* ---------- 图片上传 ---------- */
  async function ensureDir(root, path) {
    var dir = root;
    for (var part of path.split("/")) dir = await dir.getDirectoryHandle(part, { create: true });
    return dir;
  }

  /* 打开文件选择框 → 校验 → 写入 assets/img/uploads/ → 返回相对路径 */
  FS.pickAndSaveImage = async function (root) {
    if (!window.showOpenFilePicker) throw new Error("当前浏览器不支持选择文件，请使用 Chrome 或 Edge");
    var handles = await window.showOpenFilePicker({
      multiple: false,
      types: [{ description: "图片", accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"] } }]
    });
    var fh = handles[0];
    var file = await fh.getFile();
    if (file.size > 2 * 1024 * 1024) throw new Error("图片超过 2MB，请压缩后重新上传（当前 " + (file.size / 1024 / 1024).toFixed(1) + "MB）");
    var ts = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var stamp = "" + ts.getFullYear() + pad(ts.getMonth() + 1) + pad(ts.getDate()) + "-" + pad(ts.getHours()) + pad(ts.getMinutes()) + pad(ts.getSeconds());
    var safeName = file.name.replace(/[\\/:*?"<>|\s]+/g, "-");
    var targetName = stamp + "-" + safeName;
    var upDir = await ensureDir(root, "assets/img/uploads");
    var w = await upDir.getFileHandle(targetName, { create: true }).then(function (f) { return f.createWritable(); });
    await w.write(file);
    await w.close();
    return "assets/img/uploads/" + targetName;
  };
})();
