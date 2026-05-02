(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function getControlledNav(toggle) {
    var controlledId = toggle.getAttribute("aria-controls");
    var header = toggle.closest(".site-header");
    var controlledNav;

    if (controlledId) {
      controlledNav = document.getElementById(controlledId);
      if (controlledNav) {
        return controlledNav;
      }
    }

    if (header) {
      return header.querySelector(".site-nav");
    }

    return toggle.nextElementSibling && toggle.nextElementSibling.classList.contains("site-nav")
      ? toggle.nextElementSibling
      : document.querySelector(".site-nav");
  }

  function ensureNavControl(toggle, nav, index) {
    var generatedId = "site-nav-" + (index + 1);

    if (!nav.id) {
      while (document.getElementById(generatedId)) {
        index += 1;
        generatedId = "site-nav-" + (index + 1);
      }

      nav.id = generatedId;
    }

    if (toggle.getAttribute("aria-controls") !== nav.id) {
      toggle.setAttribute("aria-controls", nav.id);
    }
  }

  ready(function () {
    var navPairs = [];
    var navToggles = document.querySelectorAll(".nav-toggle");
    var navLinks = document.querySelectorAll(".site-nav a, .case-nav a");
    var tableWraps = document.querySelectorAll(".table-wrap");
    var currentPath = window.location.pathname.replace(/\/index\.html$/, "/");

    function syncScrollableTables() {
      tableWraps.forEach(function (wrap) {
        if (!wrap.hasAttribute("tabindex") && wrap.scrollWidth > wrap.clientWidth) {
          wrap.setAttribute("tabindex", "0");
        }
      });
    }

    function updateBodyLock() {
      var hasOpenNav = navPairs.some(function (pair) {
        return pair.toggle.getAttribute("aria-expanded") === "true";
      });

      document.body.classList.toggle("nav-open", hasOpenNav);
    }

    function setNavOpen(pair, isOpen) {
      pair.toggle.setAttribute("aria-expanded", String(isOpen));
      pair.nav.classList.toggle("is-open", isOpen);
      updateBodyLock();
    }

    function closeAllNavs(exceptPair) {
      navPairs.forEach(function (pair) {
        if (pair !== exceptPair) {
          setNavOpen(pair, false);
        }
      });
    }

    navToggles.forEach(function (toggle, index) {
      var nav = getControlledNav(toggle);
      var pair;

      if (!nav) {
        return;
      }

      ensureNavControl(toggle, nav, index);

      if (!toggle.hasAttribute("aria-expanded")) {
        toggle.setAttribute("aria-expanded", "false");
      }

      pair = {
        toggle: toggle,
        nav: nav
      };

      navPairs.push(pair);

      toggle.addEventListener("click", function () {
        var shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

        closeAllNavs(pair);
        setNavOpen(pair, shouldOpen);
      });

      nav.addEventListener("click", function (event) {
        if (event.target instanceof Element && event.target.closest("a")) {
          setNavOpen(pair, false);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeAllNavs();
      }
    });

    document.addEventListener("click", function (event) {
      if (!document.body.classList.contains("nav-open") || !(event.target instanceof Element)) {
        return;
      }

      navPairs.forEach(function (pair) {
        if (!pair.nav.contains(event.target) && !pair.toggle.contains(event.target)) {
          setNavOpen(pair, false);
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 901px)").matches) {
        closeAllNavs();
      }

      syncScrollableTables();
    });

    syncScrollableTables();

    navLinks.forEach(function (link) {
      var linkPath;

      try {
        linkPath = new URL(link.getAttribute("href"), window.location.href).pathname;
      } catch (error) {
        return;
      }

      linkPath = linkPath.replace(/\/index\.html$/, "/");

      if (linkPath === currentPath) {
        link.setAttribute("aria-current", "page");
        link.classList.add("is-active");
      }
    });
  });
})();
