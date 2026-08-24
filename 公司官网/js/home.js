/* ============================================================
   home.js — 首页渲染：Hero / 核心业务 / 亮点专利 / 轮播图
   ============================================================ */
(function () {

  function renderHero() {
    var hero = BX.data.home.hero;
    document.querySelector(".hero h1").textContent = BX.t(hero.title);
    document.querySelector(".hero .hero-sub").textContent = BX.t(hero.subtitle);
    var cta = document.querySelector(".hero .btn");
    cta.textContent = BX.t(hero.ctaText);
    cta.setAttribute("href", hero.ctaLink || "products.html");
    document.getElementById("hero-img").innerHTML =
      '<img src="' + BX.esc(hero.image) + '" alt="' + BX.esc(BX.t(hero.title)) + '">';
  }

  function renderBusiness() {
    var biz = BX.data.home.business;
    var head = document.querySelector("#biz-section .section-head");
    head.querySelector("h2").textContent = BX.t(biz.title);
    head.querySelector("p").textContent = BX.t(biz.subtitle);
    document.getElementById("biz-cards").innerHTML = (biz.items || []).map(function (item) {
      return '<div class="card biz-card">' +
        '<div class="icon">' + BX.icon(item.icon) + "</div>" +
        "<h3>" + BX.esc(BX.t(item.title)) + "</h3>" +
        "<p>" + BX.esc(BX.t(item.desc)) + "</p></div>";
    }).join("");
  }

  function renderHighlights() {
    var hl = BX.data.home.highlights;
    var head = document.querySelector("#highlight-section .section-head");
    head.querySelector("h2").textContent = BX.t(hl.title);
    head.querySelector("p").textContent = BX.t(hl.subtitle);
    document.getElementById("highlight-cards").innerHTML = (hl.items || []).map(function (item) {
      var patent = item.patent
        ? '<div class="patent-line">★ ' + BX.esc(BX.t(item.patentNo)) + "</div>"
        : "";
      return '<a class="card highlight-card" href="' + BX.esc(item.link || "#") + '">' +
        '<div class="img-frame"><img src="' + BX.esc(item.image) + '" alt="' + BX.esc(BX.t(item.title)) + '"></div>' +
        '<div class="card-body"><h3>' + BX.esc(BX.t(item.title)) + "</h3>" +
        "<p>" + BX.esc(BX.t(item.desc)) + "</p>" + patent + "</div></a>";
    }).join("");
  }

  /* ---------- 轮播 ---------- */
  var carouselState = { index: 0, timer: null };

  function renderCarousel() {
    var ca = BX.data.home.carousel;
    var section = document.getElementById("carousel-section");
    var head = section.querySelector(".section-head");
    head.querySelector("h2").textContent = BX.t(ca.title);

    var slides = ca.slides || [];
    if (!slides.length) { section.style.display = "none"; return; }
    section.style.display = "";

    var box = document.getElementById("home-carousel");
    box.innerHTML =
      '<div class="carousel-track">' +
        slides.map(function (s) {
          return '<div class="carousel-slide">' +
            '<div class="slide-img"><img src="' + BX.esc(s.image) + '" alt="' + BX.esc(BX.t(s.title)) + '"></div>' +
            '<a class="slide-caption" href="' + BX.esc(s.link || "#") + '">' +
              "<h3>" + BX.esc(BX.t(s.title)) + "</h3><p>" + BX.esc(BX.t(s.desc)) + "</p></a></div>";
        }).join("") +
      "</div>" +
      '<button class="carousel-arrow prev" aria-label="prev">‹</button>' +
      '<button class="carousel-arrow next" aria-label="next">›</button>' +
      '<div class="carousel-dots">' +
        slides.map(function (s, i) { return '<button data-i="' + i + '" aria-label="slide ' + (i + 1) + '"></button>'; }).join("") +
      "</div>";

    carouselState.index = 0;
    bindCarousel(box, slides.length);
  }

  function goTo(i, total) {
    carouselState.index = (i + total) % total;
    var track = document.querySelector("#home-carousel .carousel-track");
    track.style.transform = "translateX(-" + carouselState.index * 100 + "%)";
    document.querySelectorAll("#home-carousel .carousel-dots button").forEach(function (b, idx) {
      b.classList.toggle("active", idx === carouselState.index);
    });
  }

  function bindCarousel(box, total) {
    clearInterval(carouselState.timer);
    box.querySelector(".prev").addEventListener("click", function () { goTo(carouselState.index - 1, total); });
    box.querySelector(".next").addEventListener("click", function () { goTo(carouselState.index + 1, total); });
    box.querySelectorAll(".carousel-dots button").forEach(function (b) {
      b.addEventListener("click", function () { goTo(parseInt(b.getAttribute("data-i"), 10), total); });
    });
    /* 自动播放：悬停暂停 */
    carouselState.timer = setInterval(function () { goTo(carouselState.index + 1, total); }, 5000);
    box.addEventListener("mouseenter", function () { clearInterval(carouselState.timer); });
    box.addEventListener("mouseleave", function () {
      clearInterval(carouselState.timer);
      carouselState.timer = setInterval(function () { goTo(carouselState.index + 1, total); }, 5000);
    });
    /* 移动端滑动 */
    var startX = null;
    box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(carouselState.index + (dx < 0 ? 1 : -1), total);
      startX = null;
    }, { passive: true });
  }

  BX.pageRender = function () {
    renderHero();
    renderBusiness();
    renderHighlights();
    renderCarousel();
  };

  BX.initCommon();
})();
