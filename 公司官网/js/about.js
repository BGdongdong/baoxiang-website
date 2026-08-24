/* ============================================================
   about.js — 关于我们：公司简介 + 多图轮播
   ============================================================ */
(function () {

  function renderIntro() {
    var intro = BX.data.about.intro;
    document.getElementById("page-title").textContent = BX.lang === "zh" ? "关于我们" : "About Us";
    document.getElementById("page-subtitle").textContent = BX.t(intro.subtitle);
    var head = document.querySelector("#intro-section .section-head");
    head.querySelector("h2").textContent = BX.t(intro.title);
    document.getElementById("intro-text").innerHTML =
      '<span class="eyebrow">' + (BX.lang === "zh" ? "ABOUT BAOXIANG" : "ABOUT BAOXIANG") + "</span>" +
      (intro.paragraphs || []).map(function (p) {
        return "<p>" + BX.esc(BX.t(p)) + "</p>";
      }).join("");
  }

  /* ---------- 公司简介多图轮播 ---------- */
  var carouselState = { index: 0, timer: null };

  function renderCarousel() {
    var images = (BX.data.about.intro || {}).images || [];
    var box = document.getElementById("intro-carousel");
    if (!images.length) { box.innerHTML = ""; return; }

    box.innerHTML =
      '<div class="carousel intro-carousel">' +
        '<div class="carousel-track">' +
          images.map(function (img) {
            return '<div class="carousel-slide">' +
              '<div class="slide-img"><img src="' + BX.esc(img.src) + '" alt="' + BX.esc(BX.t(img.caption)) + '"></div>' +
              '<div class="slide-caption">' +
                '<h3>' + BX.esc(BX.t(img.caption)) + '</h3>' +
              '</div>' +
            '</div>';
          }).join("") +
        "</div>" +
        '<button class="carousel-arrow prev" aria-label="prev">‹</button>' +
        '<button class="carousel-arrow next" aria-label="next">›</button>' +
        '<div class="carousel-dots">' +
          images.map(function (img, i) { return '<button data-i="' + i + '" aria-label="slide ' + (i + 1) + '"></button>'; }).join("") +
        "</div>" +
      "</div>";

    carouselState.index = 0;
    bindCarousel(box.querySelector(".intro-carousel"), images.length);
  }

  function goTo(i, total) {
    carouselState.index = (i + total) % total;
    var track = document.querySelector("#intro-carousel .carousel-track");
    if (track) track.style.transform = "translateX(-" + carouselState.index * 100 + "%)";
    document.querySelectorAll("#intro-carousel .carousel-dots button").forEach(function (b, idx) {
      b.classList.toggle("active", idx === carouselState.index);
    });
  }

  function bindCarousel(box, total) {
    clearInterval(carouselState.timer);
    if (total <= 1) return;
    box.querySelector(".prev").addEventListener("click", function () { goTo(carouselState.index - 1, total); });
    box.querySelector(".next").addEventListener("click", function () { goTo(carouselState.index + 1, total); });
    box.querySelectorAll(".carousel-dots button").forEach(function (b) {
      b.addEventListener("click", function () { goTo(parseInt(b.getAttribute("data-i"), 10), total); });
    });
    carouselState.timer = setInterval(function () { goTo(carouselState.index + 1, total); }, 5000);
    box.addEventListener("mouseenter", function () { clearInterval(carouselState.timer); });
    box.addEventListener("mouseleave", function () {
      clearInterval(carouselState.timer);
      carouselState.timer = setInterval(function () { goTo(carouselState.index + 1, total); }, 5000);
    });
    var startX = null;
    box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(carouselState.index + (dx < 0 ? 1 : -1), total);
      startX = null;
    }, { passive: true });
    goTo(0, total);
  }

  BX.pageRender = function () {
    renderIntro();
    renderCarousel();
  };

  BX.initCommon();
})();
