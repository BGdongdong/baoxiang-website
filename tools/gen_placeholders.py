# -*- coding: utf-8 -*-
"""
生成官网全套占位 SVG 资产（工业风：深蓝 + 钢灰）
运行：python tools/gen_placeholders.py
真实素材到位后，直接替换 assets/img/ 下同名文件即可（或通过后台上传）。
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

DEEP = "#0b3d7a"       # 深蓝
DEEP_D = "#082c58"
STEEL = "#5a6a7a"      # 钢灰
STEEL_L = "#8d9aa8"
LIGHT = "#dfe6ee"

ICONS = {
    "bumper":   '<path d="M60 150 h280 v40 a14 14 0 0 1 -14 14 H74 a14 14 0 0 1 -14 -14 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M110 150 v54 M170 150 v54 M230 150 v54 M290 150 v54" stroke="{c}" stroke-width="7"/><path d="M60 108 q80 -30 160 -6 t120 6 v42 H60 z" fill="{c}" opacity=".35"/>',
    "gear":     '<circle cx="200" cy="170" r="46" fill="none" stroke="{c}" stroke-width="12"/><path d="M200 108 v26 M200 206 v26 M138 170 h26 M236 170 h26 M156 126 l18 18 M226 196 l18 18 M156 214 l18 -18 M226 144 l18 -18" stroke="{c}" stroke-width="12" stroke-linecap="round"/>',
    "box":      '<path d="M200 110 l84 40 v70 l-84 40 -84 -40 v-70 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M116 150 l84 40 84 -40 M200 190 v70" fill="none" stroke="{c}" stroke-width="8"/>',
    "truck":    '<rect x="96" y="140" width="140" height="70" rx="6" fill="none" stroke="{c}" stroke-width="10"/><path d="M236 158 h50 l38 34 v18 h-88 z" fill="none" stroke="{c}" stroke-width="10"/><circle cx="136" cy="222" r="18" fill="none" stroke="{c}" stroke-width="10"/><circle cx="258" cy="222" r="18" fill="none" stroke="{c}" stroke-width="10"/>',
    "flask":    '<path d="M170 110 h60 v50 l56 96 a18 18 0 0 1 -16 28 H130 a18 18 0 0 1 -16 -28 l56 -96 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M150 208 h100" stroke="{c}" stroke-width="8"/>',
    "doc":      '<path d="M140 110 h90 l40 40 v150 a10 10 0 0 1 -10 10 H150 a10 10 0 0 1 -10 -10 V120 a10 10 0 0 1 10 -10 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M230 110 v40 h40 M160 190 h80 M160 225 h80 M160 260 h50" stroke="{c}" stroke-width="8"/>',
    "factory":  '<path d="M90 250 V160 l70 44 v-44 l70 44 v-44 l70 44 V130 a10 10 0 0 1 10 -10 h20 a10 10 0 0 1 10 10 v120 a10 10 0 0 1 -10 10 H100 a10 10 0 0 1 -10 -10 z" fill="none" stroke="{c}" stroke-width="10"/>',
    "shield":   '<path d="M200 108 l74 26 v60 c0 50 -36 84 -74 100 -38 -16 -74 -50 -74 -100 v-60 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M166 176 l26 26 48 -52" fill="none" stroke="{c}" stroke-width="12" stroke-linecap="round"/>',
    "car":      '<path d="M100 200 l22 -56 a16 16 0 0 1 15 -10 h126 a16 16 0 0 1 15 10 l22 56 v34 a8 8 0 0 1 -8 8 h-16 a8 8 0 0 1 -8 -8 v-10 H140 v10 a8 8 0 0 1 -8 8 h-16 a8 8 0 0 1 -8 -8 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M138 168 h124" stroke="{c}" stroke-width="7"/><circle cx="150" cy="200" r="6" fill="{c}"/><circle cx="250" cy="200" r="6" fill="{c}"/>',
    "rack":     '<path d="M110 260 V120 M290 260 V120 M110 130 h180 M110 180 h180 M110 230 h180" stroke="{c}" stroke-width="10" stroke-linecap="round"/><rect x="130" y="140" width="60" height="34" fill="{c}" opacity=".45"/><rect x="210" y="192" width="60" height="34" fill="{c}" opacity=".45"/>',
    "building": '<rect x="120" y="120" width="160" height="150" fill="none" stroke="{c}" stroke-width="10"/><path d="M150 150 h24 M216 150 h24 M150 185 h24 M216 185 h24 M150 220 h24 M216 220 h24" stroke="{c}" stroke-width="8"/><path d="M280 170 h40 v100" fill="none" stroke="{c}" stroke-width="10"/>',
    "recycle":  '<path d="M150 130 l30 -52 h84 l30 52 M264 130 h-84 M150 130 l-30 52" fill="none" stroke="{c}" stroke-width="10" stroke-linejoin="round"/><path d="M120 182 l30 52 h84 l30 -52 M264 182 h-84 M120 182 l30 52" fill="none" stroke="{c}" stroke-width="10" stroke-linejoin="round" transform="rotate(180 200 200)"/><path d="M150 104 l-18 26 h36 z M250 296 l-18 -26 h36 z" fill="{c}"/>',
    "battery":  '<rect x="120" y="130" width="160" height="110" rx="12" fill="none" stroke="{c}" stroke-width="10"/><path d="M150 110 v-14 h100 v14" stroke="{c}" stroke-width="10"/><path d="M172 185 l34 -34 v24 l34 -34" fill="none" stroke="{c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>',
    "door":     '<path d="M120 250 V150 a20 20 0 0 1 20 -20 h120 a20 20 0 0 1 20 20 v100 z" fill="none" stroke="{c}" stroke-width="10"/><path d="M140 250 V150 h100 v100" fill="none" stroke="{c}" stroke-width="6" opacity=".5"/><circle cx="238" cy="200" r="8" fill="{c}"/>',
    "wheel":    '<circle cx="200" cy="180" r="70" fill="none" stroke="{c}" stroke-width="10"/><circle cx="200" cy="180" r="28" fill="none" stroke="{c}" stroke-width="8"/><path d="M200 110 v42 M200 208 v42 M130 180 h42 M228 180 h42 M150 130 l30 30 M250 230 l-30 -30 M150 230 l30 -30 M250 130 l-30 30" stroke="{c}" stroke-width="8"/>',
    "partner":  '<circle cx="160" cy="160" r="34" fill="none" stroke="{c}" stroke-width="10"/><circle cx="240" cy="160" r="34" fill="none" stroke="{c}" stroke-width="10"/><path d="M120 250 c0 -30 18 -48 40 -48 s40 18 40 48 M200 250 c0 -30 18 -48 40 -48 s40 18 40 48" fill="none" stroke="{c}" stroke-width="10" stroke-linecap="round"/>',
}

# (输出相对路径, 中文标注, 英文标注, 图标, 宽, 高)
ITEMS = [
    # 首页主视觉
    ("hero-factory.svg", "现代化生产厂房 · 占位图", "Modern Production Plant · Placeholder", "factory", 1600, 900),
    # 产品占位图（严格对应 PPT 配套产品）
    ("products/assembly-geely.svg",        "总成件 · 吉利帝豪配套 · 占位图", "Assembly for Geely Emgrand", "car", 800, 600),
    ("products/bumper-frame-remote.svg",   "前保险杠骨架 · 吉利远程配套 · 占位图", "Front Bumper Frame for Geely Farizon", "bumper", 800, 600),
    ("products/cabin-floor-sany.svg",      "地板驾驶室 · 三一重工配套 · 占位图", "Cabin Floor for Sany Heavy Industry", "factory", 800, 600),
    ("products/wheel-housing-jetour.svg",  "轮罩内 / 外板 · 奇瑞捷途配套 · 占位图", "Wheel Housing for Chery Jetour", "wheel", 800, 600),
    ("products/door-inner-byd.svg",        "车门内板 · 比亚迪配套 · 占位图", "Door Inner Panel for BYD", "door", 800, 600),
    ("products/battery-pack-aochi.svg",    "电池包 · 奥驰配套 · 占位图", "Battery Pack for Auchi", "battery", 800, 600),
    ("products/recycling-metal.svg",       "金属废料回收 · 占位图", "Scrap Metal Recycling", "recycle", 800, 600),
    ("products/default-product.svg",       "产品图占位", "Product Placeholder", "box", 800, 600),
    # 关于我们（车间 / 设备）
    ("about/workshop-1.svg", "冲压自动化生产线 · 占位图", "Automated Stamping Line", "factory", 800, 600),
    ("about/workshop-2.svg", "冲压生产线 · 占位图", "Stamping Line", "gear", 800, 600),
    ("about/workshop-3.svg", "机械冲床 · 占位图", "Mechanical Presses", "gear", 800, 600),
    ("about/warehouse-1.svg", "自动焊接线 · 占位图", "Automatic Welding Line", "rack", 800, 600),
    ("about/patent-1.svg", "技术研发能力 · 占位图", "R&D Capability", "doc", 800, 600),
    ("about/patent-2.svg", "一站式制造服务 · 占位图", "One-Stop Manufacturing Service", "doc", 800, 600),
    ("about/patent-3.svg", "先进检测设备 · 占位图", "Advanced Inspection Equipment", "doc", 800, 600),
    ("about/patent-4.svg", "持续专利布局 · 占位图", "Continuous Patent Portfolio", "doc", 800, 600),
    ("about/cert-1.svg", "高新技术企业 · 证书占位", "High-Tech Enterprise Certificate", "doc", 800, 600),
    ("about/cert-2.svg", "IATF16949 质量管理体系认证 · 证书占位", "IATF16949 QMS Certificate", "doc", 800, 600),
    ("about/cert-3.svg", "体系证书 · 证书占位", "System Certificate", "doc", 800, 600),
    ("about/cert-4.svg", "专利证书 · 证书占位", "Patent Certificates", "doc", 800, 600),
    # 合作客户
    ("about/client-1.svg", "吉利汽车 · 合作客户占位", "Geely Auto", "partner", 800, 600),
    ("about/client-2.svg", "成都金琥 · 合作客户占位", "Chengdu Jinhu", "partner", 800, 600),
    ("about/client-3.svg", "奇瑞捷途 · 合作客户占位", "Chery Jetour", "partner", 800, 600),
    ("about/client-4.svg", "长安汽车 · 合作客户占位", "Changan Auto", "partner", 800, 600),
    ("about/client-5.svg", "比亚迪 · 合作客户占位", "BYD", "partner", 800, 600),
    ("about/client-6.svg", "三一重工 · 合作客户占位", "Sany Heavy Industry", "partner", 800, 600),
]


def placeholder(path, zh, en, icon, w, h):
    icon_svg = ICONS[icon].replace("{c}", LIGHT)
    scale = min(w, h) / 400.0
    icon_size = 200 * scale
    cx, cy = w / 2, h / 2 - h * 0.08
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{zh}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{DEEP_D}"/>
      <stop offset="1" stop-color="{DEEP}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 H0 V40" fill="none" stroke="{STEEL}" stroke-opacity=".25" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#bg)"/>
  <rect width="{w}" height="{h}" fill="url(#grid)"/>
  <g transform="translate({cx - icon_size / 2},{cy - icon_size / 2}) scale({icon_size / 400})">
    {icon_svg}
  </g>
  <text x="{w / 2}" y="{h * 0.76}" text-anchor="middle" fill="{LIGHT}" font-size="{max(22, h * 0.045):.0f}" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-weight="bold">{zh}</text>
  <text x="{w / 2}" y="{h * 0.83}" text-anchor="middle" fill="{STEEL_L}" font-size="{max(14, h * 0.03):.0f}" font-family="Arial, sans-serif">{en}</text>
</svg>
'''


def logo_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="宝祥汽配 logo">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1f5fa8"/>
      <stop offset="1" stop-color="{DEEP}"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="56" fill="url(#lg)"/>
  <circle cx="60" cy="60" r="47" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 7" stroke-linecap="round"/>
  <path d="M46 38 v44 h16 a14 14 0 0 0 2 -27.8 A13 13 0 0 0 60 38 z" fill="none" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
  <path d="M46 55 h14" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
</svg>
'''


def favicon_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="{DEEP}"/>
  <path d="M24 14 v36 h13 a11.5 11.5 0 0 0 1.6 -22.9 A10.8 10.8 0 0 0 35 14 z" fill="none" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>
  <path d="M24 28 h11" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
</svg>
'''


def main():
    os.makedirs(os.path.join(IMG, "products"), exist_ok=True)
    os.makedirs(os.path.join(IMG, "about"), exist_ok=True)
    for rel, zh, en, icon, w, h in ITEMS:
        p = os.path.join(IMG, rel.replace("/", os.sep))
        with open(p, "w", encoding="utf-8") as fp:
            fp.write(placeholder(rel, zh, en, icon, w, h))
    with open(os.path.join(IMG, "logo.svg"), "w", encoding="utf-8") as fp:
        fp.write(logo_svg())
    with open(os.path.join(ROOT, "favicon.svg"), "w", encoding="utf-8") as fp:
        fp.write(favicon_svg())
    print(f"OK: {len(ITEMS)} placeholders + logo + favicon generated under {IMG}")


if __name__ == "__main__":
    main()
