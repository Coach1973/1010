document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const filmSection = document.querySelector(".film");
const video = document.querySelector('[data-slot="brand_belief_film"]');
const filmControl = document.querySelector(".film__control");

window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

function closeNavigation() {
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "開啟導覽");
  nav.classList.remove("is-open");
}

navToggle.addEventListener("click", () => {
  const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(willOpen));
  navToggle.setAttribute("aria-label", willOpen ? "關閉導覽" : "開啟導覽");
  nav.classList.toggle("is-open", willOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("is-open")) {
    closeNavigation();
    navToggle.focus();
  }
});

function updateFilmControl(isPlaying) {
  filmControl.setAttribute("aria-pressed", String(isPlaying));
  filmControl.setAttribute("aria-label", isPlaying ? "暫停氛圍影片" : "播放氛圍影片");
}

async function playFilm() {
  try {
    await video.play();
  } catch {
    updateFilmControl(false);
  }
}

function syncViewportPlayback(isInView) {
  if (!video || reduceMotion.matches) return;
  if (isInView) {
    playFilm();
  } else {
    video.pause();
  }
}

filmControl.addEventListener("click", async () => {
  if (video.paused) {
    await playFilm();
  } else {
    video.pause();
  }
});

video.addEventListener("play", () => updateFilmControl(true));
video.addEventListener("pause", () => updateFilmControl(false));
video.addEventListener("ended", () => updateFilmControl(false));

if (filmSection && "IntersectionObserver" in window) {
  const filmObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      syncViewportPlayback(entry.isIntersecting);
    });
  }, { threshold: 0.25 });

  filmObserver.observe(filmSection);
}

reduceMotion.addEventListener("change", (event) => {
  if (event.matches && !video.paused) video.pause();
});

const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

  revealItems.forEach((item) => observer.observe(item));
}
