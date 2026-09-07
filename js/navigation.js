document.documentElement.classList.add("js");

const menuButton = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-site-nav]");
const header = document.querySelector(".site-header");
const internalLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const trackedSectionIds = new Set(
  internalLinks.map((link) => link.getAttribute("href").slice(1)),
);
const scrollSections = [...document.querySelectorAll("[data-scroll-section]")].filter(
  (section) => trackedSectionIds.has(section.id),
);

const setActiveSection = (sectionId) => {
  internalLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const homeLink = internalLinks.find(
  (link) => link.getAttribute("href") === "#top",
);

if (homeLink) {
  homeLink.addEventListener("click", (event) => {
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", "#top");
    setActiveSection("top");
  });
}

if (menuButton && navigation) {
  const setMenuState = (isOpen, returnFocus = false) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation",
    );
    navigation.classList.toggle("is-open", isOpen);

    if (returnFocus) {
      menuButton.focus();
    }
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton.getAttribute("aria-expanded") === "true"
    ) {
      setMenuState(false, true);
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 801px)");
  const handleViewportChange = (event) => {
    if (event.matches) {
      setMenuState(false);
    }
  };

  desktopQuery.addEventListener("change", handleViewportChange);
}

let scrollFramePending = false;

const updateActiveFromScroll = () => {
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const detectionLine = window.scrollY + headerHeight + 100;
  let activeId = "top";

  scrollSections.forEach((section) => {
    if (section.offsetTop <= detectionLine) {
      activeId = section.id;
    }
  });

  setActiveSection(activeId);
  scrollFramePending = false;
};

const requestScrollUpdate = () => {
  if (!scrollFramePending) {
    scrollFramePending = true;
    window.requestAnimationFrame(updateActiveFromScroll);
  }
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
requestScrollUpdate();
