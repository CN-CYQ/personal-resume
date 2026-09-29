const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

body.classList.add("is-ready");
requestAnimationFrame(() => {
  body.classList.add("is-ready");
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

const setMenuState = (open) => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("menu-open", open);
};

const desktopNavigationQuery = window.matchMedia("(min-width: 1025px)");

const closeMenuOnDesktop = (event) => {
  if (event.matches) setMenuState(false);
};

if (desktopNavigationQuery.addEventListener) {
  desktopNavigationQuery.addEventListener("change", closeMenuOnDesktop);
} else {
  desktopNavigationQuery.addListener(closeMenuOnDesktop);
}

menuToggle?.addEventListener("click", () => {
  setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

const pointer = {
  x: -10000,
  y: -10000,
};

if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  const cursor = document.querySelector(".cursor-field");
  let cursorX = -100;
  let cursorY = -100;
  let currentX = -100;
  let currentY = -100;

  const drawCursor = () => {
    currentX += (cursorX - currentX) * 0.18;
    currentY += (cursorY - currentY) * 0.18;
    root.style.setProperty("--cursor-x", `${currentX}px`);
    root.style.setProperty("--cursor-y", `${currentY}px`);
    requestAnimationFrame(drawCursor);
  };

  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    root.classList.add("has-custom-cursor");
  });

  document.addEventListener("mouseleave", () => {
    pointer.x = -10000;
    pointer.y = -10000;
    root.classList.remove("has-custom-cursor");
  });

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursor?.classList.add("is-active");
    });
    element.addEventListener("pointerleave", () => {
      cursor?.classList.remove("is-active");
    });
  });

  drawCursor();
}

const cursorColorLines = reduceMotion
  ? []
  : [...document.querySelectorAll("[data-cursor-color]")];

let cursorColorFrame = 0;

const resetCursorColor = () => {
  cursorColorLines.forEach((line) => {
    line.style.setProperty("--cursor-local-x", "-200px");
    line.style.setProperty("--cursor-local-y", "-200px");
  });
};

const updateCursorColor = () => {
  cursorColorFrame = 0;

  cursorColorLines.forEach((line) => {
    const rect = line.getBoundingClientRect();
    if (rect.bottom < -80 || rect.top > window.innerHeight + 80) {
      line.style.setProperty("--cursor-local-x", "-200px");
      line.style.setProperty("--cursor-local-y", "-200px");
      return;
    }

    line.style.setProperty("--cursor-local-x", `${pointer.x - rect.left}px`);
    line.style.setProperty("--cursor-local-y", `${pointer.y - rect.top}px`);
  });
};

const requestCursorColor = () => {
  if (cursorColorFrame || cursorColorLines.length === 0) return;
  cursorColorFrame = requestAnimationFrame(updateCursorColor);
};

if (cursorColorLines.length > 0) {
  window.addEventListener("scroll", requestCursorColor, { passive: true });
  window.addEventListener("resize", requestCursorColor);
  window.addEventListener("mousemove", requestCursorColor, { passive: true });
  document.addEventListener("mouseleave", resetCursorColor);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -7% 0px",
  },
);

const revealItems = document.querySelectorAll(
  ".reveal, .reveal-line, [data-cursor-color]",
);

revealItems.forEach((item) => {
  const rect = item.getBoundingClientRect();
  const isInitiallyVisible =
    rect.top < window.innerHeight * 0.94 && rect.bottom > 0;

  if (reduceMotion) {
    item.classList.add("is-visible");
    return;
  }

  if (
    item.closest(".hero") &&
    !item.hasAttribute("data-cursor-color")
  ) {
    item.classList.add("is-visible");
    return;
  }

  if (isInitiallyVisible) item.classList.add("is-visible");
  revealObserver.observe(item);
});

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count || 0);
      const suffix = element.dataset.suffix || "";
      const start = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const progress = clamp((now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      if (reduceMotion) {
        element.textContent = `${target}${suffix}`;
      } else {
        requestAnimationFrame(tick);
      }

      observer.unobserve(element);
    });
  },
  { threshold: 0.5 },
);

document.querySelectorAll("[data-count]").forEach((counter) => {
  counterObserver.observe(counter);
});

const hero = document.querySelector(".hero");
const heroPortrait = document.querySelector(".hero__portrait");
const timeline = document.querySelector("[data-timeline]");
const projectSection = document.querySelector("[data-projects]");
const projectTrack = document.querySelector("[data-project-track]");
const projectCards = [...document.querySelectorAll(".project-card")];
const projectProgress = document.querySelector("[data-project-progress]");
const projectCurrent = document.querySelector("[data-project-current]");

let projectDistance = 0;
let scrollTicking = false;

const measureProjects = () => {
  if (!projectSection || !projectTrack) return;

  if (window.innerWidth <= 720 || reduceMotion) {
    projectSection.style.height = "";
    projectTrack.style.transform = "";
    projectDistance = 0;
    return;
  }

  projectDistance = Math.max(
    0,
    projectTrack.scrollWidth - window.innerWidth,
  );
  projectSection.style.height = `${window.innerHeight + projectDistance}px`;
};

const updateScrollEffects = () => {
  const scrollY = window.scrollY;

  if (hero) {
    const heroProgress = clamp(
      scrollY / Math.max(hero.offsetHeight * 0.82, 1),
    );
    hero.style.setProperty("--hero-progress", heroProgress);
  }

  if (heroPortrait && !reduceMotion) {
    const parallax = Math.min(scrollY * 0.11, 88);
    heroPortrait.style.setProperty("--parallax-y", `${parallax}px`);
  }

  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const progress = clamp(
      (window.innerHeight * 0.72 - rect.top) / Math.max(rect.height, 1),
    );
    timeline.style.setProperty(
      "--timeline-progress",
      `${progress * 100}%`,
    );
  }

  if (
    projectSection &&
    projectTrack &&
    projectCards.length &&
    projectDistance > 0
  ) {
    const rect = projectSection.getBoundingClientRect();
    const travel = Math.max(projectSection.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / travel);
    const translate = -progress * projectDistance;

    projectTrack.style.transform = `translate3d(${translate}px, -50%, 0)`;

    if (projectProgress) {
      projectProgress.style.width = `${progress * 100}%`;
    }

    if (projectCurrent) {
      const activeIndex = Math.min(
        projectCards.length,
        Math.round(progress * (projectCards.length - 1)) + 1,
      );
      projectCurrent.textContent = String(activeIndex).padStart(2, "0");
    }
  }

  scrollTicking = false;
};

const requestScrollUpdate = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.setTimeout(updateScrollEffects, 16);
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  measureProjects();
  requestScrollUpdate();
});
window.addEventListener("load", () => {
  measureProjects();
  requestScrollUpdate();
});

if ("ResizeObserver" in window && projectTrack) {
  const projectResizeObserver = new ResizeObserver(measureProjects);
  projectResizeObserver.observe(projectTrack);
}

measureProjects();
updateScrollEffects();
