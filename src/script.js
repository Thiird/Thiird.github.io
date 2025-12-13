let zoomLevel = 0;
const zoomScales = [1, 1.5, 2]; // 1x, 1.5x, 2x zoom levels
let currentImageIndex = 0;
let imageList = [];

function calculateFitScale(img) {
  const isMobile = window.innerWidth <= 600;
  // On mobile: no buttons, use 90% width. Desktop: 40px button + 40px padding on each side
  const buttonWidth = 40;
  const sidePadding = 40;
  const horizontalSpace = isMobile ? (window.innerWidth * 0.1) : (buttonWidth * 2 + sidePadding * 2);

  const maxWidth = window.innerWidth - horizontalSpace;
  const maxHeight = window.innerHeight * 0.9;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  if (imgWidth === 0 || imgHeight === 0) {
    return 1;
  }
  const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);

  return scale;
}

function applyScale(img, scale) {
  img.style.width = img.naturalWidth * scale + "px";
  img.style.height = img.naturalHeight * scale + "px";
}

function centerImage(img) {
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  const imgRect = img.getBoundingClientRect();
  const left = viewportCenterX - (imgRect.width / 2);
  const top = viewportCenterY - (imgRect.height / 2);
  img.style.left = left + "px";
  img.style.top = top + "px";
}

function centerImageIfSmall(img, lightbox) {
  const imgRect = img.getBoundingClientRect();
  const lightboxRect = lightbox.getBoundingClientRect();
  const left = Math.max((lightboxRect.width - imgRect.width) / 2, 0);
  const top = Math.max((lightboxRect.height - imgRect.height) / 2, 0);
  img.style.left = left + "px";
  img.style.top = top + "px";
}

function fitAndCenterImage(img) {
  const scale = calculateFitScale(img);
  applyScale(img, scale);
  centerImage(img);
}

function fadeApply(img, lightbox, scale, cursorX, cursorY) {
  img.style.opacity = 0; // Fade out
  setTimeout(() => {
    const oldRect = img.getBoundingClientRect();
    const oldWidth = oldRect.width;
    const oldHeight = oldRect.height;
    const oldLeft = parseFloat(img.style.left) || 0;
    const oldTop = parseFloat(img.style.top) || 0;

    // Apply new scale
    applyScale(img, scale);
    const newRect = img.getBoundingClientRect();
    const newWidth = newRect.width;
    const newHeight = newRect.height;

    if (cursorX !== undefined && cursorY !== undefined && zoomLevel > 0) {
      // Calculate cursor position relative to old image
      const relX = (cursorX - oldRect.left) / oldWidth;
      const relY = (cursorY - oldRect.top) / oldHeight;

      // Calculate new position to keep cursor point fixed
      const newLeft = cursorX - relX * newWidth;
      const newTop = cursorY - relY * newHeight;

      img.style.left = newLeft + "px";
      img.style.top = newTop + "px";
    } else {
      // Center image if no cursor position or at base zoom
      centerImageIfSmall(img, lightbox);
    }

    // Fade in
    img.style.opacity = 1;
  }, 20); // Reduced from 50ms to 20ms for quicker transition
}

function resetZoom(img, lightbox) {
  zoomLevel = 0;
  img.classList.remove("zoomed");
  const scale = calculateFitScale(img);
  fadeApply(img, lightbox, scale);

  // Show caption at basic zoom level
  const caption = document.getElementById("lightbox-caption");
  if (caption && caption.textContent.trim()) {
    caption.style.display = "block";
  }
}

function updateZoom(img, lightbox, cursorX, cursorY) {
  const fitScale = calculateFitScale(img);
  // Always use fitScale as the base, then multiply by the zoom multiplier
  const scale = fitScale * zoomScales[zoomLevel];
  img.classList.toggle("zoomed", zoomLevel > 0);
  fadeApply(img, lightbox, scale, cursorX, cursorY);

  // Hide caption when zoomed beyond basic level
  const caption = document.getElementById("lightbox-caption");
  if (caption) {
    caption.style.display = zoomLevel > 0 ? "none" : "block";
  }
}

function initDropdownToggle() {
  const dropdowns = document.querySelectorAll(".top-menu .dropdown");
  const isMobile = window.innerWidth <= 800;

  // Remove existing event listeners to prevent duplicates
  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".menu-button");
    const menu = dropdown.querySelector(".dropdown-menu");
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    dropdown.classList.remove("active");
    if (menu) {
      menu.style.display = "none";
      // reset any inline positioning from previous runs
      menu.style.position = "";
      menu.style.top = "";
      menu.style.left = "";
      menu.style.transform = "";
      menu.style.zIndex = "";
      // cleanup any previous handlers
      menu._reposition && window.removeEventListener("scroll", menu._reposition);
      menu._reposition && window.removeEventListener("resize", menu._reposition);
      if (menu._mouseenterHandler) menu.removeEventListener("mouseenter", menu._mouseenterHandler);
      if (menu._mouseleaveHandler) menu.removeEventListener("mouseleave", menu._mouseleaveHandler);
      delete menu._reposition;
      delete menu._mouseenterHandler;
      delete menu._mouseleaveHandler;
    }
    if (dropdown._mouseenterHandler) dropdown.removeEventListener("mouseenter", dropdown._mouseenterHandler);
    if (dropdown._mouseleaveHandler) dropdown.removeEventListener("mouseleave", dropdown._mouseleaveHandler);
    if (button._clickHandler) button.removeEventListener("click", button._clickHandler);
  });

  // Helper to position dropdown as fixed under the trigger
  function positionFixedMenu(button, menu) {
    if (!button || !menu) return;
    // ensure menu is in document flow and rendered to measure
    menu.style.display = "block";
    menu.style.position = "fixed";
    menu.style.zIndex = "99999";
    menu.style.transform = "none";
    // measure button and menu
    const btnRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    // overlap 0 so submenu starts exactly where top menu finishes
    const overlap = 0; // px overlap into the trigger area
    const gap = 0; // no gap

    // center the menu horizontally over the button, but clamp to viewport
    let left = btnRect.left + btnRect.width / 2 - menuRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
    // top is button bottom + gap but we subtract overlap so menu can overlap if needed
    let top = btnRect.bottom + gap - overlap;
    if (top + menuRect.height > window.innerHeight - 8) {
      // place above the button with small overlap
      top = btnRect.top - menuRect.height - gap + overlap;
      if (top < 8) top = 8;
    }

    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(top)}px`;
  }

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".menu-button");
    const menu = dropdown.querySelector(".dropdown-menu");

    if (!button || !menu) return;

    if (isMobile) {
      // Mobile: click toggles inline menu (original behaviour)
      button._clickHandler = (e) => {
        e.preventDefault();
        const isActive = dropdown.classList.contains("active");
        // close others
        document.querySelectorAll(".top-menu .dropdown").forEach((d) => {
          if (d !== dropdown) {
            d.classList.remove("active");
            const otherMenu = d.querySelector(".dropdown-menu");
            if (otherMenu) otherMenu.style.display = "none";
          }
        });
        dropdown.classList.toggle("active");
        menu.style.display = isActive ? "none" : "block";
      };
      button.addEventListener("click", button._clickHandler);
    } else {
      // Desktop: show on hover, position as fixed so it floats above content
      dropdown._mouseenterHandler = (e) => {
        // show immediately
        positionFixedMenu(button, menu);
        dropdown.classList.add("active");
        menu.style.display = "block";

        // reposition while open
        const reposition = () => positionFixedMenu(button, menu);
        window.addEventListener("scroll", reposition, { passive: true });
        window.addEventListener("resize", reposition);
        menu._reposition = reposition;

        // ensure menu's enter/leave are wired to preserve visibility when moving between
        menu._mouseenterHandler = (ev) => {
          // if pointer enters menu, keep it open (no-op)
        };
        menu._mouseleaveHandler = (ev) => {
          const related = ev.relatedTarget;
          // only hide if pointer is not moving back to the button or inside the dropdown element
          if (related && (button.contains(related) || menu.contains(related))) {
            return;
          }
          // hide immediately (no delay)
          dropdown.classList.remove("active");
          menu.style.display = "none";
          if (menu._reposition) {
            window.removeEventListener("scroll", menu._reposition);
            window.removeEventListener("resize", menu._reposition);
            delete menu._reposition;
          }
        };
        menu.addEventListener("mouseenter", menu._mouseenterHandler);
        menu.addEventListener("mouseleave", menu._mouseleaveHandler);
      };

      dropdown._mouseleaveHandler = (e) => {
        const related = e.relatedTarget;
        // if pointer moved into menu or button, do nothing (keeps visible)
        if (related && (button.contains(related) || menu.contains(related))) {
          return;
        }
        // hide immediately (no delay)
        dropdown.classList.remove("active");
        menu.style.display = "none";
        if (menu._reposition) {
          window.removeEventListener("scroll", menu._reposition);
          window.removeEventListener("resize", menu._reposition);
          delete menu._reposition;
        }
        if (menu._mouseenterHandler) {
          menu.removeEventListener("mouseenter", menu._mouseenterHandler);
          delete menu._mouseenterHandler;
        }
        if (menu._mouseleaveHandler) {
          menu.removeEventListener("mouseleave", menu._mouseleaveHandler);
          delete menu._mouseleaveHandler;
        }
      };

      dropdown.addEventListener("mouseenter", dropdown._mouseenterHandler);
      dropdown.addEventListener("mouseleave", dropdown._mouseleaveHandler);

      // ensure moving from menu back to button keeps it visible: add button mouseenter to re-show
      button.addEventListener("mouseenter", () => {
        // if menu was hidden due to quick movement, re-show immediately
        if (menu.style.display !== "block") {
          positionFixedMenu(button, menu);
          dropdown.classList.add("active");
          menu.style.display = "block";
          // reattach reposition handlers
          const reposition = () => positionFixedMenu(button, menu);
          window.addEventListener("scroll", reposition, { passive: true });
          window.addEventListener("resize", reposition);
          menu._reposition = reposition;
        }
      });
    }
  });

  // Click-away handler only on mobile (keeps original mobile behavior)
  document.removeEventListener("click", handleOutsideClick);
  if (isMobile) {
    document.addEventListener("click", handleOutsideClick);
  }
  function handleOutsideClick(e) {
    if (!e.target.closest(".dropdown")) {
      dropdowns.forEach((d) => {
        d.classList.remove("active");
        const m = d.querySelector(".dropdown-menu");
        if (m) m.style.display = "none";
      });
    }
  }
}

function updateSidebarTop() {
  const banner = document.getElementById("banner-placeholder");
  const sidebars = document.querySelectorAll(".blog-list, .poem-list");

  if (banner && sidebars.length > 0) {
    // On desktop (width > 800px), calculate position based on banner visibility
    if (window.innerWidth > 800) {
      const bannerRect = banner.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate how much of banner is still visible
      const bannerBottom = bannerRect.bottom;
      const topOffset = Math.max(0, bannerBottom);

      sidebars.forEach((sidebar) => {
        sidebar.style.top = `${topOffset}px`;
        sidebar.style.height = `calc(100vh - ${topOffset}px)`;
      });
    }
  }
}

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function applyImageScaling(container) {
  // This function is no longer needed - width handles sizing natively
  // Keep it as a no-op for backward compatibility
  if (!container) return;
}

document.addEventListener("DOMContentLoaded", () => {
  window.tooltipManager = new TooltipManager();
  initDropdownToggle();
  updateSidebarTop();
  window.addEventListener("scroll", () => {
    if (window.innerWidth > 800) {
      updateSidebarTop();
    }
  });

  window.addEventListener("resize", () => {
    updateSidebarTop();
  });

  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  const img = document.createElement("img");
  img.id = "lightbox-img";

  // Create navigation buttons
  const prevBtn = document.createElement("button");
  prevBtn.id = "lightbox-prev";
  prevBtn.innerHTML = "‹";
  prevBtn.setAttribute("aria-label", "Previous image");

  const nextBtn = document.createElement("button");
  nextBtn.id = "lightbox-next";
  nextBtn.innerHTML = "›";
  nextBtn.setAttribute("aria-label", "Next image");

  // Create caption for alt text
  const caption = document.createElement("div");
  caption.id = "lightbox-caption";

  lightbox.appendChild(prevBtn);
  lightbox.appendChild(img);
  lightbox.appendChild(nextBtn);
  lightbox.appendChild(caption);
  document.body.appendChild(lightbox);

  // Navigation button handlers
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateImage(-1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateImage(1);
  });

  img.addEventListener("click", (e) => {
    e.stopPropagation();
    // Disable zoom functionality on mobile devices
    const isMobile = window.innerWidth <= 600;
    if (isMobile) return;

    zoomLevel = (zoomLevel + 1) % zoomScales.length;
    const cursorX = e.clientX;
    const cursorY = e.clientY;
    updateZoom(img, lightbox, cursorX, cursorY);
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target !== img && e.target !== prevBtn && e.target !== nextBtn) {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "block") {
      if (e.key === "Escape") {
        lightbox.style.display = "none";
        document.body.classList.remove("lightbox-active");
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        navigateImage(-1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        navigateImage(1);
        e.preventDefault();
      }
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function isPageZoomed() {
    // Check if viewport is zoomed by comparing visual viewport to layout viewport
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      const scale = visualViewport.scale;
      return scale > 1.01; // Allow small tolerance
    }
    // Fallback: check if window.innerWidth differs from document width
    const scale = window.outerWidth / window.innerWidth;
    return scale > 1.01;
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    // Check if page/viewport is zoomed or if click-zoom is active
    const pageZoomed = isPageZoomed();
    const clickZoomed = zoomLevel > 0;
    const isZoomed = pageZoomed || clickZoomed;

    // Only navigate if not zoomed
    if (!isZoomed) {
      if (swipeDistance > 0) {
        // Swipe right - previous image
        navigateImage(-1);
      } else {
        // Swipe left - next image
        navigateImage(1);
      }
    }
  }

  function attachLightboxEvents() {
    // Build image list for navigation - only include images inside .image-grid
    const gridImages = document.querySelectorAll(".image-grid img.click-zoom");
    imageList = Array.from(gridImages);

    document.querySelectorAll("img.click-zoom").forEach((thumbnail) => {
      thumbnail.style.cursor = "pointer";
      thumbnail.removeEventListener("click", thumbnail._lightboxHandler);
      thumbnail._lightboxHandler = () => {
        // Find index in the grid images list (or -1 if not in grid)
        currentImageIndex = imageList.indexOf(thumbnail);
        img.src = thumbnail.src;

        // Update caption with alt text
        const caption = document.getElementById("lightbox-caption");
        if (thumbnail.alt && thumbnail.alt.trim()) {
          caption.textContent = thumbnail.alt;
          caption.style.display = "block";
        } else {
          caption.style.display = "none";
        }

        const openLightbox = () => {
          zoomLevel = 0;
          lightbox.style.display = "block";
          document.body.classList.add("lightbox-active");
          fitAndCenterImage(img);
          updateNavigationVisibility();
        };
        if (img.complete && img.naturalWidth) openLightbox();
        else img.onload = openLightbox;
      };
      thumbnail.addEventListener("click", thumbnail._lightboxHandler);
    });
  }

  // Navigate between images
  function navigateImage(direction) {
    // Only navigate if current image is in the grid (currentImageIndex >= 0)
    if (imageList.length === 0 || currentImageIndex < 0) return;
    zoomLevel = 0;
    currentImageIndex = (currentImageIndex + direction + imageList.length) % imageList.length;
    const currentImg = imageList[currentImageIndex];
    img.src = currentImg.src;

    // Update caption with current image's alt text
    const caption = document.getElementById("lightbox-caption");
    if (currentImg.alt && currentImg.alt.trim()) {
      caption.textContent = currentImg.alt;
      caption.style.display = "block";
    } else {
      caption.style.display = "none";
    }

    const reloadImage = () => {
      fitAndCenterImage(img);
      updateNavigationVisibility();
    };
    if (img.complete && img.naturalWidth) reloadImage();
    else img.onload = reloadImage;
  }

  // Update navigation button visibility
  function updateNavigationVisibility() {
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    // Only show navigation if image is in grid and there are multiple grid images
    if (lightbox.style.display === "block" && currentImageIndex >= 0 && imageList.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  attachLightboxEvents();

  if (
    document.getElementById("poemList") &&
    window.location.pathname.includes("poems")
  ) {
    initPoems();
  }
  if (
    document.getElementById("blogList") &&
    window.location.pathname.includes("blogs")
  ) {
    initBlogs();
  }

  const searchInput = document.getElementById("blogSearch") || document.getElementById("poemSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      const itemsListId = searchInput.id === "blogSearch" ? "blogListItems" : "poemListItems";
      document.querySelectorAll(`#${itemsListId} li`).forEach((item) => {
        // Skip the no-results item itself
        if (item.classList.contains('no-results')) return;
        const link = item.querySelector('a');
        if (!link) return;
        const titleSpan = link.querySelector('.list-item-title');
        if (!titleSpan) return;

        const originalText = titleSpan.dataset.originalText || titleSpan.textContent;
        if (!titleSpan.dataset.originalText) titleSpan.dataset.originalText = originalText;
        const lowerText = originalText.toLowerCase();
        const matches = search && lowerText.includes(search);

        if (matches) {
          // Highlight matching parts
          const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          titleSpan.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
          item.style.display = "block";
        } else if (search) {
          titleSpan.textContent = originalText;
          item.style.display = "none";
        } else {
          titleSpan.textContent = originalText;
          item.style.display = "block";
        }
      });
      // update no-results UI
      updateNoResultsMessage(itemsListId);
    });
  }

  // Prevent sidebar scroll from propagating to page
  function setupSidebarScrollIsolation() {
    const sidebars = [
      document.getElementById("blogList"),
      document.getElementById("poemList")
    ].filter(Boolean);

    sidebars.forEach(sidebar => {
      sidebar.addEventListener('wheel', (e) => {
        const scrollTop = sidebar.scrollTop;
        const scrollHeight = sidebar.scrollHeight;
        const height = sidebar.clientHeight;
        const wheelDelta = e.deltaY;
        const isDeltaPositive = wheelDelta > 0;

        if (isDeltaPositive && wheelDelta > scrollHeight - height - scrollTop) {
          sidebar.scrollTop = scrollHeight;
          e.preventDefault();
        } else if (!isDeltaPositive && -wheelDelta > scrollTop) {
          sidebar.scrollTop = 0;
          e.preventDefault();
        } else {
          e.stopPropagation();
        }
      }, { passive: false });
    });
  }

  setupSidebarScrollIsolation();

  const audio = document.getElementById("audioElement");
  const playPauseBtn = document.getElementById("playPause");
  const progressContainer = document.querySelector(".progress-container");
  const progressBar = document.getElementById("progressBar");
  const progressHandle = document.getElementById("progressHandle");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const loopBtn = document.getElementById("loopBtn");
  let isLooping = false;

  // Define formatTime function at the top level so it's accessible everywhere
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // helper: update progress UI (bar width + handle position)
  function updateProgressUI() {
    if (!audio || !progressBar || !progressHandle) return;
    const pct = (audio.duration && isFinite(audio.duration)) ? (audio.currentTime / audio.duration) * 100 : 0;
    progressBar.style.width = pct + "%";
    progressHandle.style.left = pct + "%";
    // aria update
    progressHandle.setAttribute("aria-valuenow", Math.round(pct));
  }

  if (
    audio &&
    playPauseBtn &&
    progressContainer &&
    progressBar &&
    currentTimeEl &&
    durationEl
  ) {
    playPauseBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            playPauseBtn.textContent = "⏸";
          })
          .catch((err) => {

            playPauseBtn.textContent = "▶";
          });
      } else {
        audio.pause();
        playPauseBtn.textContent = "▶";
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration && isFinite(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
        // update handle position
        if (progressHandle) progressHandle.style.left = `${progressPercent}%`;
        if (progressHandle) progressHandle.setAttribute("aria-valuenow", Math.round(progressPercent));
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
      updateProgressUI();
    });

    audio.addEventListener("error", (e) => {

      playPauseBtn.textContent = "▶";
      progressBar.style.width = "0%";
      if (progressHandle) progressHandle.style.left = "0%";
      currentTimeEl.textContent = "0:00";
      durationEl.textContent = "0:00";
    });

    // Click on bar to jump
    progressContainer.addEventListener("click", (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = (e.clientX !== undefined) ? e.clientX - rect.left : e.touches && e.touches[0] ? e.touches[0].clientX - rect.left : 0;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = pct * audio.duration;
        updateProgressUI();
      }
    });

    // Draggable handle (pointer events for mouse/touch)
    if (progressHandle) {
      let dragging = false;
      const rectToPct = (clientX) => {
        const rect = progressContainer.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      };

      const onPointerMove = (clientX) => {
        if (!audio || !audio.duration || !isFinite(audio.duration)) return;
        const pct = rectToPct(clientX);
        progressBar.style.width = (pct * 100) + "%";
        progressHandle.style.left = (pct * 100) + "%";
        // update current time visually (but don't commit until pointerup)
        currentTimeEl.textContent = formatTime(pct * audio.duration);
      };

      progressHandle.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        dragging = true;
        progressHandle.setPointerCapture(ev.pointerId);
      });

      progressHandle.addEventListener("pointermove", (ev) => {
        if (!dragging) return;
        onPointerMove(ev.clientX);
      });

      progressHandle.addEventListener("pointerup", (ev) => {
        if (!dragging) return;
        dragging = false;
        // commit time
        const pct = rectToPct(ev.clientX);
        if (audio.duration && isFinite(audio.duration)) {
          audio.currentTime = pct * audio.duration;
        }
        if (progressHandle.releasePointerCapture) progressHandle.releasePointerCapture(ev.pointerId);
      });

      // keyboard accessibility: left/right arrow to seek small steps
      progressHandle.addEventListener("keydown", (ev) => {
        if (!audio || !audio.duration || !isFinite(audio.duration)) return;
        const step = Math.max(1, Math.floor(audio.duration * 0.02)); // ~2% or 1s min
        if (ev.key === "ArrowLeft") {
          audio.currentTime = Math.max(0, audio.currentTime - step);
          updateProgressUI();
          ev.preventDefault();
        } else if (ev.key === "ArrowRight") {
          audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
          updateProgressUI();
          ev.preventDefault();
        } else if (ev.key === "Home") {
          audio.currentTime = 0; updateProgressUI(); ev.preventDefault();
        } else if (ev.key === "End") {
          audio.currentTime = audio.duration; updateProgressUI(); ev.preventDefault();
        }
      });
    }
  } else {
  }

  const backToTopBtn = document.getElementById("backToTop");
  const themeToggle = document.getElementById("themeToggle");

  if (!themeToggle) {
    const btn = document.createElement("button");
    btn.id = "themeToggle";
    btn.innerHTML = "☀️";
    btn.setAttribute("aria-label", "Toggle theme");
    document.body.appendChild(btn);
  }

  const themeBtn = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    let newTheme;
    if (currentTheme === "light") {
      newTheme = "middle";
    } else if (currentTheme === "middle") {
      newTheme = "darker";
    } else {
      newTheme = "light";
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (themeBtn) {
      if (theme === "light") {
        themeBtn.innerHTML = "☀️";
      } else if (theme === "middle") {
        themeBtn.innerHTML = "🌗";
      } else {
        themeBtn.innerHTML = "🌙";
      }
    }
  }

  themeBtn.classList.add("visible");

  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (document.documentElement.scrollTop > 200) {
        backToTopBtn.style.display = "block";
        backToTopBtn.style.opacity = "1";
        backToTopBtn.classList.add("with-theme-toggle");
      } else {
        backToTopBtn.style.display = "none";
        backToTopBtn.classList.remove("with-theme-toggle");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  let poemsCache = [];
  function initPoems() {
    fetch("poems/poems_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load poems manifest");
        return res.json();
      })
      .then((poems) => {
        poemsCache = poems;
        buildPoemList(poems);
        const poemParam = getUrlParameter('poem');
        if (poems.length > 0) {
          let selectedPoem;
          if (poemParam !== null) {
            // Find poem by folder number
            const folderNum = parseInt(poemParam);
            selectedPoem = poems.find(p => {
              const match = p.folder.match(/^(\d+)/);
              return match && parseInt(match[1]) === folderNum;
            });
          }
          // Default to first poem if not found or no param
          selectedPoem = selectedPoem || poems[0];
          loadPoem(selectedPoem);
          // mark initial active poem based on loaded poem
          const loadedIndex = poems.indexOf(selectedPoem);
          setActiveListItem('poemListItems', loadedIndex);
        }
      })
      .catch((err) => { });
  }

  function formatPoemTitle(filename) {
    let title = filename;
    // Don't remove the number prefix for poems
    if (filename.toLowerCase().endsWith(".mp3")) {
      title = title.replace(/\.mp3$/i, "");
    } else if (filename.toLowerCase().endsWith(".md")) {
      title = title.replace(/\.md$/i, "");
    }
    // Replace underscores with spaces and add spacing around dash: "1-Title" → "1 - Title"
    title = title.replace(/_/g, " ").replace(/(\d+)-/, "$1 - ");
    title = title.replace(/\b\w/g, (char) => char.toUpperCase());
    return title.trim();
  }

  function buildPoemList(poems) {
    const poemListItems = document.getElementById("poemListItems");
    if (!poemListItems) {

      return;
    }
    poemListItems.innerHTML = "";
    let previousYear = null;
    poems.forEach((poem, index) => {
      // Extract year from poem date
      const currentYear = poem.date ? new Date(poem.date).getFullYear() : null;

      // Add year separator if year changed
      if (previousYear !== null && currentYear !== null && currentYear !== previousYear) {
        const separator = document.createElement("hr");
        separator.className = "year-separator";
        poemListItems.appendChild(separator);
      }
      previousYear = currentYear;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      // Display poem with chronological index number (oldest = 0)
      let displayPoemTitle = formatPoemTitle(poem.name || poem.folder);
      displayPoemTitle = displayPoemTitle.replace(/^\s*\d+\s*[-\.]?\s*/, '').trim();
      const chronologicalIndex = poems.length - 1 - index;

      // Create title span
      const titleSpan = document.createElement("span");
      titleSpan.className = "list-item-title";
      titleSpan.textContent = `${chronologicalIndex} - ${displayPoemTitle}`;

      a.appendChild(titleSpan);

      // Create date span only if date exists
      if (poem.date) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "list-item-date";
        const date = new Date(poem.date);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        dateSpan.textContent = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        a.appendChild(dateSpan);
      }

      a.dataset.poem = JSON.stringify(poem);
      a.dataset.index = index;
      a.classList.add("poem-link");

      // Mobile touch handling: track whether we're preventing navigation
      let preventNextClick = false;

      a.addEventListener('touchend', (e) => {
        // Check if this is the first tap (date not showing yet)
        if (!a.classList.contains('show-date') && poem.date) {
          e.preventDefault();
          e.stopPropagation();
          preventNextClick = true;
          
          // Hide all other dates and highlights
          document.querySelectorAll('.poem-link.show-date').forEach(link => {
            link.classList.remove('show-date');
          });
          // Show this date and add highlight
          a.classList.add('show-date');
          
          // Reset flag after a short delay
          setTimeout(() => { preventNextClick = false; }, 100);
        }
      });

      li.appendChild(a);
      poemListItems.appendChild(li);
    });
    poemListItems.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Only apply two-tap logic on touch devices with narrow screens
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice && window.innerWidth <= 800 && !link.classList.contains('show-date')) {
          return; // Touch handler already handled showing the date
        }
        
        const index = link.dataset.index;
        const poem = JSON.parse(link.getAttribute("data-poem"));
        const currentPoemParam = getUrlParameter('poem');

        // Extract folder number from the clicked poem
        const folderMatch = poem.folder.match(/^(\d+)/);
        const folderNum = folderMatch ? folderMatch[1] : null;

        // If clicking on the currently active poem (compare folder numbers)
        if (folderNum !== null && folderNum === currentPoemParam) {
          // On mobile, just close the sidebar
          if (window.innerWidth <= 800) {
            closeSidebarAfterSelect();
            clearSidebarSearchInputs();
          }
          // On desktop, do nothing
          return;
        }

        // Different poem selected, load it
        loadPoem(poem);
        history.pushState({ poemIndex: index }, "", `?poem=${folderNum}`);
        // Clear search on new selection
        clearSidebarSearchInputs();
        // only hide/collapse sidebar on mobile
        if (window.innerWidth <= 800) {
          closeSidebarAfterSelect();
        }
        // Update active styling in the list
        setActiveListItem('poemListItems', parseInt(index, 10));
      });
    });
  }

  // Mark the active item in a list and remove previous marking
  function setActiveListItem(listId, activeIndex) {
    const list = document.getElementById(listId);
    if (!list) return;
    list.querySelectorAll('a').forEach((a) => {
      a.classList.toggle('current', parseInt(a.dataset.index, 10) === Number(activeIndex));
    });
  }

  function resetAudioPlayer() {
    const audioPlayer = document.getElementById("audioPlayer");
    const audioElement = document.getElementById("audioElement");
    const playPauseBtn = document.getElementById("playPause");
    const progressBar = document.getElementById("progressBar");
    const currentTimeEl = document.getElementById("currentTime");
    const durationEl = document.getElementById("duration");
    if (!audioPlayer || !audioElement) {

      return;
    }
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement.src = "";
    progressBar.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    playPauseBtn.textContent = "▶";
    audioPlayer.setAttribute("data-title", "");
    audioPlayer.style.display = "none";
    isLooping = false;
    if (loopBtn) {
      loopBtn.style.color = "#d3d7db";
    }
  }

  function loadPoem(poem) {
    resetAudioPlayer();
    const localMd = `poems/${poem.folder}/poem.md`;
    fetch(localMd)
      .then((res) => {
        if (!res.ok) throw new Error("Poem not found");
        return res.text();
      })
      .then((md) => {
        const poemText = document.getElementById("poemText");
        const poemContent = document.getElementById("poemContent");
        const audioPlayer = document.getElementById("audioPlayer");

        // Extract date from simple "date: YYYY-MM-DD" or "date: YYYY-MM" line
        let dateStr = null;
        md = md.replace(/^date:\s*(\d{4}-\d{2}(?:-\d{2})?)\s*$/m, (match, extractedDate) => {
          dateStr = extractedDate;
          return ''; // Remove the date line from markdown
        });

        // Remove only the first <hr> tag (---) that appears after date removal
        md = md.replace(/^\s*---\s*$/m, '');

        // Render markdown (without date and first hr tag)
        poemText.innerHTML = marked.parse(md);

        // Create and insert date element BEFORE audio player and poem text
        if (dateStr && poemContent) {
          // Remove any existing date element
          const existingDate = poemContent.querySelector('.poem-date');
          if (existingDate) {
            existingDate.remove();
          }

          // Format the date (handles both partial and full dates)
          const formatted = formatDate(dateStr);

          // Create date element
          const dateElement = document.createElement('p');
          dateElement.className = 'poem-date';
          dateElement.textContent = formatted;

          // Insert at the top of poemContent (before audio player and poem text)
          poemContent.insertBefore(dateElement, poemContent.firstChild);
        }

        // Apply image scaling
        applyImageScaling(poemText);

        attachLightboxEvents();
      })
      .catch((err) => {
        console.error("Error loading poem:", err);
        document.getElementById("poemText").innerHTML = "<p>Error loading poem.</p>";
      });
    if (poem.audio) {
      const audioPlayer = document.getElementById("audioPlayer");
      const audioElement = document.getElementById("audioElement");
      const audioPath = "poems/" + poem.folder + "/" + encodeURIComponent(poem.audio);
      fetch(audioPath, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            audioElement.src = audioPath;
            audioElement.loop = true;
            isLooping = true;
            if (loopBtn) {
              loopBtn.style.color = "#3498db";
            }
            audioPlayer.setAttribute("data-title", poem.name);
            audioPlayer.style.display = "block";
          } else {
            audioPlayer.style.display = "none";
          }
        })
        .catch((err) => {
          audioPlayer.style.display = "none";
        });
    }
  }

  let blogsCache = [];
  function initBlogs() {
    fetch("blogs/blogs_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blogs manifest");
        return res.json();
      })
      .then((blogs) => {
        blogsCache = blogs;
        // Store in global scope for tooltip manager access
        window.blogsCache = blogs;
        const target = document.getElementById("blogText");
        if (target) target.innerHTML = "Loading blog post...";
        buildBlogList(blogs);
        const blogParam = getUrlParameter("blog");
        if (blogs.length > 0) {
          let selectedBlog;
          if (blogParam !== null) {
            // Find blog by folder number
            const folderNum = parseInt(blogParam);
            selectedBlog = blogs.find(b => {
              const match = b.folder.match(/^(\d+)/);
              return match && parseInt(match[1]) === folderNum;
            });
          }
          // Default to first blog if not found or no param
          selectedBlog = selectedBlog || blogs[0];
          loadBlogPost(selectedBlog);
        }
      })
      .catch((err) => { });
  }

  function buildBlogList(blogs) {
    const listEl = document.getElementById("blogListItems");
    if (!listEl) return;
    listEl.innerHTML = "";
    let previousYear = null;
    blogs.forEach((blog, index) => {
      // Extract year from blog date
      const currentYear = blog.date ? new Date(blog.date).getFullYear() : null;

      // Add year separator if year changed
      if (previousYear !== null && currentYear !== null && currentYear !== previousYear) {
        const separator = document.createElement("hr");
        separator.className = "year-separator";
        listEl.appendChild(separator);
      }
      previousYear = currentYear;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      // Prefer manifest title and add chronological index number (oldest = 0)
      let displayBlogTitle = (blog.title || formatBlogTitle(blog.folder)).toString();
      displayBlogTitle = displayBlogTitle.replace(/^\s*\d+\s*[-\.]?\s*/, '').trim();
      const chronologicalIndex = blogs.length - 1 - index;

      // Create title span
      const titleSpan = document.createElement("span");
      titleSpan.className = "list-item-title";
      titleSpan.textContent = `${chronologicalIndex} - ${displayBlogTitle}`;

      a.appendChild(titleSpan);

      // Create date span only if date exists
      if (blog.date) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "list-item-date";
        const date = new Date(blog.date);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        dateSpan.textContent = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        a.appendChild(dateSpan);
      }

      a.dataset.blog = JSON.stringify(blog);
      a.dataset.index = index;
      a.classList.add("blog-link");

      // Mobile touch handling: track whether we're preventing navigation
      let preventNextClick = false;

      a.addEventListener('touchend', (e) => {
        // Check if this is the first tap (date not showing yet)
        if (!a.classList.contains('show-date') && blog.date) {
          e.preventDefault();
          e.stopPropagation();
          preventNextClick = true;
          
          // Hide all other dates and highlights
          document.querySelectorAll('.blog-link.show-date').forEach(link => {
            link.classList.remove('show-date');
          });
          // Show this date and add highlight
          a.classList.add('show-date');
          
          // Reset flag after a short delay
          setTimeout(() => { preventNextClick = false; }, 100);
        }
      });

      li.appendChild(a);
      listEl.appendChild(li);
    });
    listEl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Only apply two-tap logic on touch devices with narrow screens
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice && window.innerWidth <= 800 && !link.classList.contains('show-date')) {
          return; // Touch handler already handled showing the date
        }
        
        const index = link.dataset.index;
        const blog = JSON.parse(link.getAttribute("data-blog"));
        const currentBlogParam = getUrlParameter('blog');

        // Extract folder number from the clicked blog
        const folderMatch = blog.folder.match(/^(\d+)/);
        const folderNum = folderMatch ? folderMatch[1] : null;

        // If clicking on the currently active blog (compare folder numbers)
        if (folderNum !== null && folderNum === currentBlogParam) {
          // On mobile, just close the sidebar
          if (window.innerWidth <= 800) {
            closeSidebarAfterSelect();
            clearSidebarSearchInputs();
          }
          // On desktop, do nothing
          return;
        }

        // Different blog selected, load it
        loadBlogPost(blog);
        history.pushState({ blogIndex: index }, "", `?blog=${folderNum}`);
        // Clear search on new selection
        clearSidebarSearchInputs();
        // only hide/collapse sidebar on mobile
        if (window.innerWidth <= 800) {
          closeSidebarAfterSelect();
        }
        // Update active styling in the list
        setActiveListItem('blogListItems', parseInt(index, 10));
      });
    });
    // Apply active class based on loaded blog after list is built
    const blogParam = getUrlParameter('blog');
    if (blogParam !== null && blogsCache) {
      const folderNum = parseInt(blogParam);
      const blogIndex = blogsCache.findIndex(b => {
        const match = b.folder.match(/^(\d+)/);
        return match && parseInt(match[1]) === folderNum;
      });
      if (blogIndex >= 0) {
        setActiveListItem('blogListItems', blogIndex);
      }
    } else {
      setActiveListItem('blogListItems', 0);
    }
  }

  function formatBlogTitle(folder) {
    let title = folder.replace(/_/g, " ");
    // Add spacing around dash: "1-Title" → "1 - Title"
    title = title.replace(/(\d+)-/, "$1 - ");
    title = title.replace(/\b\w/g, (char) => char.toUpperCase());
    return title.trim();
  }

  function loadBlogPost(blog) {
    resetAudioPlayer();
    const target = document.getElementById("blogText");
    if (!target) return;
    target.innerHTML = "Loading blog post...";
    const localMd = `blogs/${encodeURIComponent(blog.folder)}/blog.md`;
    fetch(localMd)
      .then((res) => {
        if (!res.ok) throw new Error("Blog post not found");
        return res.text();
      })
      .then((md) => {
        // Extract date from simple "date: YYYY-MM-DD" or "date: YYYY-MM" line
        let dateStr = null;
        md = md.replace(/^date:\s*(\d{4}-\d{2}(?:-\d{2})?)\s*$/m, (match, extractedDate) => {
          dateStr = extractedDate;
          return ''; // Remove the date line from markdown
        });

        // Remove any <hr> tags (---) that appear after date removal
        md = md.replace(/^\s*---\s*$/gm, '');

        // Format the date nicely (handles both partial and full dates)
        let dateHtml = '';
        if (dateStr) {
          const formatted = formatDate(dateStr);
          dateHtml = `<p class="blog-date">${formatted}</p>`;
        }

        md = md.replace(/!\[(.*?)\]\(([^)]+)\)/g, (match, alt, src) => {
          const classes = ["click-zoom"];
          if (!src.startsWith("http") && !src.includes("/")) {
            return `<div class="image-wrapper"><img class="${classes.join(
              " "
            )}" src="blogs/${blog.folder}/res/${src}" alt="${alt}"></div>`;
          }
          return `<div class="image-wrapper"><img class="${classes.join(
            " "
          )}" src="${src}" alt="${alt}"></div>`;
        });
        md = md.replace(/\[<img([^>]+)>\]\(([^)]+)\)/g, (match, attrs, src) => {
          let classAttr = attrs.match(/class=["']([^"']*)["']/i);
          let classes = classAttr ? classAttr[1].split(/\s+/) : [];
          const hasClickZoom = classes.includes("click-zoom");
          if (hasClickZoom && !classes.includes("click-zoom")) {
            classes.push("click-zoom");
          }
          const newClassAttr = classes.length > 0 ? `class="${classes.join(" ")}"` : '';
          attrs = attrs.replace(/class=["'][^"']*["']/i, "").trim();
          if (!src.startsWith("http") && !src.includes("/")) {
            return `<div class="image-wrapper"><img ${attrs} ${newClassAttr} src="blogs/${blog.folder}/res/${src}"></div>`;
          }
          return `<div class="image-wrapper"><img ${attrs} ${newClassAttr} src="${src}"></div>`;
        });
        md = md.replace(
          /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            let classAttr = before.match(/class=["']([^"']*)["']/i);
            let classes = classAttr ? classAttr[1].split(/\s+/) : [];
            const hasClickZoom = classes.includes("click-zoom");
            if (hasClickZoom && !classes.includes("click-zoom")) {
              classes.push("click-zoom");
            }
            const newClassAttr = classes.length > 0 ? `class="${classes.join(" ")}"` : '';
            before = before.replace(/class=["'][^"']*["']/i, "").trim();
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<div class="image-wrapper"><img ${before} ${newClassAttr} src="blogs/${blog.folder}/res/${src}" ${after}></div>`;
            }
            return `<div class="image-wrapper"><img ${before} ${newClassAttr} src="${src}" ${after}></div>`;
          }
        );
        md = md.replace(
          /<embed([^>]+)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            // Convert inline embed to a lightweight "Open schematic" link to avoid heavy PDF rendering.
            let href = src;
            if (!src.startsWith("http") && !src.includes("/")) {
              href = `blogs/${blog.folder}/res/${src}`;
            }
            const filename = href.split("/").pop();
            return `<div class="pdf-placeholder"><a href="${href}" target="_blank" rel="noopener noreferrer">Open: ${filename}</a></div>`;
          }
        );
        md = md.replace(
          /<video([^>]*)>\s*<source([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/video>/g,
          (match, videoAttrs, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<video${videoAttrs}> <source${before}src="blogs/${blog.folder}/res/${src}"${after}> </video>`;
            }
            return match;
          }
        );
        md = md.replace(/!video\(([^)]+)\)/g, (match, src) => {
          if (!src.startsWith("http") && !src.includes("/")) {
            return `<video controls class="video-player"> <source src="blogs/${blog.folder}/res/${src}" type="video/mp4"> Your browser does not support the video tag. </video>`;
          }
          return `<video controls class="video-player"> <source src="${src}" type="video/mp4"> Your browser does not support the video tag. </video>`;
        });
        // Render markdown and prepend styled date
        target.innerHTML = dateHtml + marked.parse(md);
        if (window.hljs) {
          hljs.highlightAll();
        }

        // Apply scale to images with scale attribute in style
        applyImageScaling(target);

        // Initialize tooltips after content is loaded - pass blog folder directly
        setTimeout(() => {
          if (window.tooltipManager) {
            window.tooltipManager.reinitialize(blog.folder);
          }
        }, 100);

        attachLightboxEvents();
        enableInternalAnchorScrolling(target);

        // NEW: if URL contains a hash when the post loads, scroll to it
        if (location.hash) {
          setTimeout(() => scrollToAnchor(location.hash), 50);
        }
      })
      .catch((err) => {
        target.innerHTML = "Failed to load blog post.";
      });
  }

  // Move anchor handling to the top so anchor popstates do not trigger expensive blog/poem reloads.
  window.addEventListener("popstate", (event) => {
    // Close all dropdown menus when navigating back/forward
    const dropdowns = document.querySelectorAll(".top-menu .dropdown");
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("active");
      const menu = dropdown.querySelector(".dropdown-menu");
      if (menu) menu.style.display = "none";
    });
    
    // If the popped history state is an anchor, handle it immediately and return
    if (event.state && event.state.anchor) {
      scrollToAnchor("#" + event.state.anchor);
      return;
    }

    if (window.location.pathname.includes("poems")) {
      if (poemsCache.length === 0) {
        initPoems();
      } else {
        const poemParam = getUrlParameter("poem");
        let selectedPoem;
        let poemIndex = 0;
        if (poemParam !== null) {
          // Find poem by folder number
          const folderNum = parseInt(poemParam);
          selectedPoem = poemsCache.find(p => {
            const match = p.folder.match(/^(\d+)/);
            return match && parseInt(match[1]) === folderNum;
          });
          if (selectedPoem) {
            poemIndex = poemsCache.indexOf(selectedPoem);
          }
        }
        selectedPoem = selectedPoem || poemsCache[0];
        loadPoem(selectedPoem);
        // update active class in poem list
        setActiveListItem('poemListItems', poemIndex);
      }
    } else if (window.location.pathname.includes("blogs")) {
      if (blogsCache.length === 0) {
        initBlogs();
      } else {
        const blogParam = getUrlParameter("blog");
        let selectedBlog;
        let blogIndex = 0;
        if (blogParam !== null) {
          // Find blog by folder number
          const folderNum = parseInt(blogParam);
          selectedBlog = blogsCache.find(b => {
            const match = b.folder.match(/^(\d+)/);
            return match && parseInt(match[1]) === folderNum;
          });
          if (selectedBlog) {
            blogIndex = blogsCache.indexOf(selectedBlog);
          }
        }
        selectedBlog = selectedBlog || blogsCache[0];
        loadBlogPost(selectedBlog);
        // update active class in blog list
        setActiveListItem('blogListItems', blogIndex);
      }
    }
  });

  window.addEventListener("load", () => {
    initDropdownToggle();
    updateSidebarTop();
  });

  // NEW: enforce floating sidebar toggle visibility across pages
  function updateFloatingToggleVisibility() {
    const ft = document.getElementById("sidebarFloatingToggle");
    if (!ft) return;
    // if overlay logic explicitly hides it via .hidden, keep hidden
    if (ft.classList.contains("hidden")) {
      ft.style.display = "none";
      ft.setAttribute("aria-hidden", "true");
      return;
    }
    if (window.innerWidth > 800) {
      ft.style.display = "none";
      ft.setAttribute("aria-hidden", "true");
    } else {
      ft.style.display = "";
      ft.removeAttribute("aria-hidden"); // Remove aria-hidden when visible to avoid accessibility violation
    }
  }

  // Call once and on relevant events so the floating toggle is only present on small screens
  updateFloatingToggleVisibility();
  window.addEventListener("resize", updateFloatingToggleVisibility);
  window.addEventListener("orientationchange", updateFloatingToggleVisibility);
});

function toggleEmail() {
  const emailRow = document.getElementById("email-row");
  emailRow.style.display =
    emailRow.style.display === "none" ? "block" : "none";
}

/* New helper: scroll to anchor id/hash accounting for sticky banner (instant) */
function scrollToAnchor(hash) {
  if (!hash) return;
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const targetEl = document.getElementById(id);
  if (!targetEl) return;
  const banner = document.getElementById("banner-placeholder");
  const bannerHeight = banner ? banner.getBoundingClientRect().height : 0;
  // Use instant positioning (faster than smooth animation)
  // scrollIntoView to bring element into view, then offset for sticky header
  targetEl.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
  // Use rAF to ensure layout has settled before adjusting for header
  requestAnimationFrame(() => {
    window.scrollBy(0, -Math.ceil(bannerHeight) - 8);
  });
}

/* Modified helper: delegated in-page anchor handling (lighter than per-anchor listeners).
   Pushes history state for anchors so Back/Forward navigates between anchors. */
function enableInternalAnchorScrolling(container) {
  if (!container) return;
  // Remove existing delegated listener if present
  if (container._delegatedAnchorHandler) {
    container.removeEventListener("click", container._delegatedAnchorHandler);
  }
  container._delegatedAnchorHandler = function (e) {
    const a = e.target.closest("a[href^='#']");
    if (!a || !container.contains(a)) return;
    const hash = a.getAttribute("href");
    if (!hash || hash === "#" || !hash.startsWith("#")) return;
    e.preventDefault();
    const id = hash.slice(1);
    const targetEl = document.getElementById(id);
    if (targetEl) {
      // Instant scroll and create history entry (so Back/Forward toggles anchors)
      scrollToAnchor(hash);
      try {
        history.pushState({ anchor: id }, "", hash);
      } catch (err) {
        // ignore
      }
    }
  };
  container.addEventListener("click", container._delegatedAnchorHandler);
}

/* Also handle hashchange (some navigation can change hash without state) */
window.addEventListener("hashchange", () => {
  scrollToAnchor(location.hash);
});

// Collapse/hide sidebars AFTER selection (mobile only)
function closeSidebarAfterSelect() {
  const poemList = document.getElementById("poemList");
  const blogList = document.getElementById("blogList");
  const floatingToggle = document.getElementById("sidebarFloatingToggle");
  // mobile behavior: hide overlay and restore page scrolling
  if (window.innerWidth <= 800) {
    if (poemList) poemList.classList.remove("show");
    if (blogList) blogList.classList.remove("show");
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
    if (floatingToggle) floatingToggle.classList.remove("hidden");
    // Always clear search when closing sidebar
    clearSidebarSearchInputs();
  }
}

// Clear any search inputs in sidebars and reset filters
function clearSidebarSearchInputs() {
  const blogSearch = document.getElementById('blogSearch');
  const poemSearch = document.getElementById('poemSearch');
  [blogSearch, poemSearch].forEach((input) => {
    if (input) {
      input.value = '';
      // trigger input event so the list shows all items again
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // Clear all show-date classes when sidebar is toggled
  document.querySelectorAll('.poem-link.show-date, .blog-link.show-date').forEach(link => {
    link.classList.remove('show-date');
  });
}

// Show a "no results" message inside the given list if no visible items
function updateNoResultsMessage(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  // count visible list items excluding any existing no-results
  const items = Array.from(list.querySelectorAll('li')).filter(li => !li.classList.contains('no-results'));
  // Use computed style to detect visibility (handles inline styles and CSS)
  const visible = items.filter(li => getComputedStyle(li).display !== 'none');
  const existing = list.querySelector('.no-results');
  if (visible.length === 0) {
    if (!existing) {
      const li = document.createElement('li');
      li.className = 'no-results';
      li.textContent = 'No results found';
      list.appendChild(li);
    }
  } else {
    if (existing) existing.remove();
  }
}

// Tooltip Manager Class
class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.overlay = null;
    this.currentTrigger = null;
    this.hideTimeout = null;
    this.currentAudio = null;
    this.audioPlaying = false;
    this.tooltipDimensions = new Map();
    this.tooltipData = new Map();
    this.allAudioElements = new Set();
    this.activeTooltipAudio = null;

    const styles = getComputedStyle(document.documentElement);
    this.showDelay = parseInt(styles.getPropertyValue('--tooltip-show-delay'));
    this.hideDelay = parseInt(styles.getPropertyValue('--tooltip-hide-delay'));
    this.verticalOffset = parseInt(styles.getPropertyValue('--tooltip-vertical-offset'));

    this.createOverlay();
    this.init();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tooltip-overlay';
    this.overlay.addEventListener('click', () => {
      this.hideActiveTooltip();
    });
    document.body.appendChild(this.overlay);
  }

  init() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#themeToggle')) {
        return;
      }
      if (!e.target.closest('.tooltip-trigger') && !e.target.closest('.tooltip')) {
        this.hideActiveTooltip();
      }
    });

    // Update tooltip position on scroll to keep it aligned with trigger
    window.addEventListener('scroll', () => {
      if (this.tooltip && this.currentTrigger) {
        // Don't reposition if audio is playing
        if (this.activeTooltipAudio && !this.activeTooltipAudio.paused) {
          return;
        }

        const tooltipId = this.currentTrigger.getAttribute('tt');
        let tooltipData;

        if (tooltipId) {
          tooltipData = this.tooltipData.get(tooltipId);
        } else {
          try {
            tooltipData = JSON.parse(this.currentTrigger.getAttribute('data-tooltip'));
          } catch (e) {
            return;
          }
        }

        if (tooltipData) {
          // Don't pass mouseX on scroll, let it center on trigger
          this.positionTooltipAtTrigger(this.tooltip, this.currentTrigger, tooltipData, null);
        }
      }
    });
  }

  // Stop all audio tracks except the current one
  stopAllOtherAudio(currentAudio) {
    this.allAudioElements.forEach(audio => {
      if (audio !== currentAudio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    // Update audioPlaying state
    this.audioPlaying = currentAudio && !currentAudio.paused;
  }

  // Load tooltip data from a JSON file
  async loadTooltipData(blogFolder) {
    const tooltipPath = `blogs/${blogFolder}/res/tooltips.json`;

    try {
      const response = await fetch(tooltipPath);

      if (response.ok) {
        const data = await response.json();

        // Store all tooltip definitions for this blog with resolved media paths
        Object.entries(data).forEach(([id, tooltipData]) => {
          // If media field exists and it's just a filename (not a full path), prepend blog res folder
          if (tooltipData.media && !tooltipData.media.startsWith('blogs/') && !tooltipData.media.startsWith('http')) {
            tooltipData.media = `blogs/${blogFolder}/res/${tooltipData.media}`;
          }
          this.tooltipData.set(id, tooltipData);

        });


      } else {

      }
    } catch (error) {

    }
  }

  // Detect blog folder from current URL
  detectBlogFolder() {
    const urlParams = new URLSearchParams(window.location.search);
    const blogIndex = urlParams.get('blog');

    // Access blogsCache from the global scope
    if (blogIndex !== null && window.blogsCache && window.blogsCache[blogIndex]) {
      const folder = window.blogsCache[blogIndex].folder;

      return folder;
    }

    return null;
  }

  showTooltip(trigger, data, mouseX = null) {
    this.hideActiveTooltip();

    const tooltip = this.createTooltip(data);

    // If there's media, restart it from frame 0 by resetting the src (for GIFs)
    const mediaImg = tooltip.querySelector('.tooltip-gif');
    if (mediaImg && data.media) {
      // Force GIF to restart by adding a cache-busting timestamp
      const originalSrc = data.media;
      mediaImg.src = originalSrc + '?t=' + Date.now();
    }

    document.body.appendChild(tooltip);

    // Always position tooltip relative to trigger element at fixed distance
    this.positionTooltipAtTrigger(tooltip, trigger, data, mouseX);

    // Force a reflow to ensure positioning is applied before adding show class
    tooltip.offsetHeight;

    // Show overlay
    if (this.overlay) {
      this.overlay.classList.add('show');
    }

    // Add show class for animation
    tooltip.classList.add('show');

    // Make entire tooltip clickable if it has an image
    if (data.media && (data.media.endsWith('.jpg') || data.media.endsWith('.jpeg') ||
      data.media.endsWith('.png') || data.media.endsWith('.gif') ||
      data.media.endsWith('.webp'))) {
      tooltip.style.cursor = 'pointer';
      tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showImageFullscreen(data.media, data.alt || data.text, data);
      });
    }

    // Add hover listeners to tooltip - CRITICAL for keeping it visible
    tooltip.addEventListener('mouseenter', (e) => {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    });

    tooltip.addEventListener('mouseleave', (e) => {
      if (this.audioPlaying) {
        return;
      }
      this.hideTimeout = setTimeout(() => {
        if (!this.audioPlaying) {
          this.hideActiveTooltip();
        }
      }, this.hideDelay);
    });

    this.currentTrigger = trigger;
    this.tooltip = tooltip;
  }

  // Create a tooltip element
  createTooltip(data) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    const content = document.createElement('div');
    content.className = 'tooltip-content';

    if (data.text) {
      const text = document.createElement('div');
      text.className = 'tooltip-text';
      // Use innerHTML to support HTML formatting and convert \n to <br>
      text.innerHTML = data.text.replace(/\n/g, '<br>');
      content.appendChild(text);
    }

    // Use 'media' field for images or audio
    if (data.media) {
      if (data.media.endsWith('.mp3') || data.media.endsWith('.wav') || data.media.endsWith('.ogg')) {
        // Create audio player matching poems page - using CSS variables for dynamic theming
        const audioPlayer = document.createElement('div');
        audioPlayer.className = 'tooltip-audio-player';

        const playerControls = document.createElement('div');
        playerControls.className = 'player-controls';

        const playPauseBtn = document.createElement('button');
        playPauseBtn.innerHTML = '▶';
        playPauseBtn.className = 'player-btn tooltip-player-btn';

        const currentTime = document.createElement('span');
        currentTime.textContent = '0:00';
        currentTime.className = 'tooltip-time';

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container tooltip-progress';

        const progressBarEl = document.createElement('div');
        progressBarEl.className = 'tooltip-progress-bar';

        const progressHandle = document.createElement('div');
        progressHandle.className = 'progress-handle';

        const duration = document.createElement('span');
        duration.textContent = '0:00';
        duration.className = 'tooltip-time';

        progressContainer.appendChild(progressBarEl);
        progressContainer.appendChild(progressHandle);

        const audioElement = document.createElement('audio');
        audioElement.src = data.media;
        audioElement.loop = true;
        audioElement.preload = 'metadata';

        // Track this audio element
        this.allAudioElements.add(audioElement);
        this.activeTooltipAudio = audioElement;

        // Local formatTime function for this tooltip audio player
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // Update progress
        const updateProgress = () => {
          if (audioElement.duration && isFinite(audioElement.duration)) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBarEl.style.width = percent + '%';
            progressHandle.style.left = percent + '%';
            currentTime.textContent = formatTime(audioElement.currentTime);
          }
        };

        playPauseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (audioElement.paused) {
            // Stop all other audio first
            this.stopAllOtherAudio(null);
            audioElement.play().then(() => {
              playPauseBtn.innerHTML = '⏸';
              this.audioPlaying = true;
              this.stopAllOtherAudio(audioElement);
            }).catch(err => {
              audioElement.load();
              setTimeout(() => {
                audioElement.play().catch(e => { });
              }, 100);
            });
          } else {
            audioElement.pause();
            playPauseBtn.innerHTML = '▶';
            this.audioPlaying = false;
          }
        });

        playPauseBtn.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });

        playPauseBtn.style.pointerEvents = 'auto';
        playPauseBtn.setAttribute('type', 'button');

        // Progress bar click to seek (same as poems page)
        progressContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = progressContainer.getBoundingClientRect();
          const clickX = (e.clientX !== undefined) ? e.clientX - rect.left : e.touches && e.touches[0] ? e.touches[0].clientX - rect.left : 0;
          const pct = Math.max(0, Math.min(1, clickX / rect.width));
          if (audioElement.duration && isFinite(audioElement.duration)) {
            audioElement.currentTime = pct * audioElement.duration;
            updateProgress();
          }
        });

        // Draggable progress handle (exactly like poems page)
        let dragging = false;
        const rectToPct = (clientX) => {
          const rect = progressContainer.getBoundingClientRect();
          return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        };

        const onPointerMove = (clientX) => {
          if (!audioElement || !audioElement.duration || !isFinite(audioElement.duration)) return;
          const pct = rectToPct(clientX);
          progressBarEl.style.width = (pct * 100) + "%";
          progressHandle.style.left = (pct * 100) + "%";
          currentTime.textContent = formatTime(pct * audioElement.duration);
        };

        progressHandle.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          dragging = true;
          progressHandle.style.cursor = 'grabbing';
          progressHandle.setPointerCapture(ev.pointerId);
        });

        progressHandle.addEventListener('pointermove', (ev) => {
          if (!dragging) return;
          ev.stopPropagation();
          onPointerMove(ev.clientX);
        });

        progressHandle.addEventListener('pointerup', (ev) => {
          if (!dragging) return;
          ev.stopPropagation();
          dragging = false;
          progressHandle.style.cursor = 'grab';
          const pct = rectToPct(ev.clientX);
          if (audioElement.duration && isFinite(audioElement.duration)) {
            audioElement.currentTime = pct * audioElement.duration;
          }
          if (progressHandle.releasePointerCapture) progressHandle.releasePointerCapture(ev.pointerId);
        });

        // keyboard accessibility: left/right arrow to seek small steps
        progressHandle.addEventListener('keydown', (ev) => {
          if (!audioElement || !audioElement.duration || !isFinite(audioElement.duration)) return;
          const step = Math.max(1, Math.floor(audioElement.duration * 0.02));
          if (ev.key === "ArrowLeft") {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - step);
            updateProgress();
            ev.preventDefault();
          } else if (ev.key === "ArrowRight") {
            audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + step);
            updateProgress();
            ev.preventDefault();
          } else if (ev.key === "Home") {
            audioElement.currentTime = 0;
            updateProgress();
            ev.preventDefault();
          } else if (ev.key === "End") {
            audioElement.currentTime = audioElement.duration;
            updateProgress();
            ev.preventDefault();
          }
        });

        progressHandle.setAttribute('tabindex', '0');
        progressHandle.setAttribute('role', 'slider');
        progressHandle.setAttribute('aria-valuemin', '0');
        progressHandle.setAttribute('aria-valuemax', '100');
        progressHandle.setAttribute('aria-valuenow', '0');

        audioElement.addEventListener('loadedmetadata', () => {
          duration.textContent = formatTime(audioElement.duration);
          updateProgress();
        });

        audioElement.addEventListener('timeupdate', updateProgress);

        audioElement.addEventListener('ended', () => {
          this.audioPlaying = false;
        });

        audioElement.addEventListener('pause', () => {
          playPauseBtn.innerHTML = '▶';
          this.audioPlaying = false;
        });

        audioElement.addEventListener('play', () => {
          playPauseBtn.innerHTML = '⏸';
          this.audioPlaying = true;
        });

        playerControls.appendChild(playPauseBtn);
        playerControls.appendChild(currentTime);
        playerControls.appendChild(progressContainer);
        playerControls.appendChild(duration);
        audioPlayer.appendChild(playerControls);
        content.appendChild(audioPlayer);

        this.currentAudio = audioElement;
      } else {
        // Handle images
        const mediaEl = document.createElement('img');
        mediaEl.className = 'tooltip-gif';
        mediaEl.src = data.media;
        mediaEl.alt = data.text || 'Tooltip media';
        mediaEl.onerror = () => { };
        content.appendChild(mediaEl);
      }
    }

    tooltip.appendChild(content);
    return tooltip;
  }

  // Initialize tooltips for elements with data-tooltip attributes
  initializeTooltips() {
    const triggers = document.querySelectorAll('[data-tooltip], [tt]');


    // Clear existing dimensions cache
    this.tooltipDimensions.clear();

    triggers.forEach(trigger => {
      this.setupTooltip(trigger);
      // Precalculate tooltip dimensions
      this.precalculateTooltipDimensions(trigger);
    });
  }

  // Precalculate tooltip dimensions for caching
  precalculateTooltipDimensions(element) {
    const tooltipId = element.getAttribute('tt');
    let tooltipData;

    if (tooltipId) {
      tooltipData = this.tooltipData.get(tooltipId);
      if (!tooltipData) {

        return;
      }
    } else {
      tooltipData = JSON.parse(element.getAttribute('data-tooltip'));
    }

    const dataKey = JSON.stringify(tooltipData);

    // Skip if already calculated
    if (this.tooltipDimensions.has(dataKey)) {
      return;
    }

    // Create temporary tooltip off-screen
    const tempTooltip = this.createTooltip(tooltipData);
    tempTooltip.style.position = 'absolute';
    tempTooltip.style.left = '-9999px';
    tempTooltip.style.top = '-9999px';
    tempTooltip.style.visibility = 'hidden';
    document.body.appendChild(tempTooltip);

    // If there's a GIF, wait for it to load before measuring
    const gifImg = tempTooltip.querySelector('.tooltip-gif');

    const measureAndStore = () => {
      // Force layout calculation
      tempTooltip.offsetHeight;

      // Store dimensions
      const rect = tempTooltip.getBoundingClientRect();
      this.tooltipDimensions.set(dataKey, {
        width: rect.width,
        height: rect.height
      });

      // Remove temporary tooltip
      document.body.removeChild(tempTooltip);


    };

    if (gifImg) {
      // Wait for GIF to load before measuring
      if (gifImg.complete) {
        measureAndStore();
      } else {
        gifImg.onload = measureAndStore;
        gifImg.onerror = measureAndStore; // Still measure even if GIF fails
      }
    } else {
      measureAndStore();
    }
  }

  setupTooltip(element) {
    const tooltipId = element.getAttribute('tt');
    let tooltipData;

    if (tooltipId) {
      tooltipData = this.tooltipData.get(tooltipId);
      if (!tooltipData) {
        return;
      }
      if (!element.classList.contains('tooltip-trigger')) {
        element.classList.add('tooltip-trigger');
      }
    } else {
      try {
        tooltipData = JSON.parse(element.getAttribute('data-tooltip'));
      } catch (e) {
        return;
      }
    }

    element.removeEventListener('mouseenter', element._tooltipMouseEnter);
    element.removeEventListener('mouseleave', element._tooltipMouseLeave);

    element._tooltipMouseEnter = (e) => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }

      if (this.tooltip && this.currentTrigger === element) {
        return;
      }

      // Store mouse position for tooltip positioning
      const mouseX = e.clientX;
      element._tooltipTimeout = setTimeout(() => {
        this.showTooltip(element, tooltipData, mouseX);
      }, this.showDelay);
    };

    element._tooltipMouseLeave = (e) => {
      const relatedTarget = e.relatedTarget;

      // Don't hide if moving to the tooltip itself
      if (relatedTarget && this.tooltip && this.tooltip.contains(relatedTarget)) {
        if (element._tooltipTimeout) {
          clearTimeout(element._tooltipTimeout);
          element._tooltipTimeout = null;
        }
        return;
      }

      if (element._tooltipTimeout) {
        clearTimeout(element._tooltipTimeout);
        element._tooltipTimeout = null;
      }

      this.hideTimeout = setTimeout(() => {
        if (!this.audioPlaying) {
          this.hideActiveTooltip();
        }
      }, this.hideDelay);
    };

    element.addEventListener('mouseenter', element._tooltipMouseEnter);
    element.addEventListener('mouseleave', element._tooltipMouseLeave);
  }



  // Position tooltip relative to trigger element at fixed distance
  positionTooltipAtTrigger(tooltip, trigger, data, mouseX = null) {
    const dataKey = JSON.stringify(data);

    // Get cached dimensions or fallback
    let tooltipWidth, tooltipHeight;
    if (this.tooltipDimensions.has(dataKey)) {
      const cached = this.tooltipDimensions.get(dataKey);
      tooltipWidth = cached.width;
      tooltipHeight = cached.height;
    } else {
      const tooltipRect = tooltip.getBoundingClientRect();
      tooltipWidth = tooltipRect.width || 250;
      tooltipHeight = tooltipRect.height || 100;
    }

    // Get trigger element position relative to page
    const triggerRect = trigger.getBoundingClientRect();
    const triggerX = triggerRect.left + window.pageXOffset;
    const triggerY = triggerRect.top + window.pageYOffset;

    // For multi-line triggers, get the position of the topmost line
    const range = document.createRange();
    range.selectNodeContents(trigger);
    const rects = range.getClientRects();
    let topLineRect = triggerRect;
    if (rects.length > 0) {
      topLineRect = rects[0]; // First rect is the topmost line
    }
    const topLineX = topLineRect.left + window.pageXOffset;
    const topLineY = topLineRect.top + window.pageYOffset;

    // On mobile, use full width with margins
    const isMobile = window.innerWidth <= 600;
    const margin = isMobile ? (window.innerWidth <= 400 ? 8 : 10) : 10;
    
    if (isMobile) {
      // Mobile: position centered horizontally with margins
      const left = margin;
      let top = topLineY - tooltipHeight - this.verticalOffset;
      
      // If not enough space above trigger, show below
      if (top < window.pageYOffset + margin) {
        top = triggerY + triggerRect.height + this.verticalOffset;
        tooltip.classList.add('bottom');
      } else {
        tooltip.classList.remove('bottom');
      }
      
      tooltip.style.position = 'absolute';
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      tooltip.style.right = margin + 'px';
      tooltip.style.width = 'auto';
    } else {
      // Desktop: position aligned with trigger
      let left = topLineX + (topLineRect.width / 2) - (tooltipWidth / 2);
      let top = topLineY - tooltipHeight - this.verticalOffset;

      // Adjust if tooltip goes off screen horizontally
      const scrollX = window.pageXOffset;
      if (left < scrollX + margin) left = scrollX + margin;
      if (left + tooltipWidth > scrollX + window.innerWidth - margin) {
        left = scrollX + window.innerWidth - tooltipWidth - margin;
      }

      // If not enough space above trigger, show below
      if (top < window.pageYOffset + margin) {
        top = triggerY + triggerRect.height + this.verticalOffset;
        tooltip.classList.add('bottom');
      } else {
        tooltip.classList.remove('bottom');
      }

      // Use absolute positioning so tooltip follows page scroll
      tooltip.style.position = 'absolute';
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      tooltip.style.right = '';
      tooltip.style.width = '';
    }
  }



  // Hide the active tooltip
  hideActiveTooltip() {
    if (this.tooltip) {
      // Stop any playing audio in the tooltip
      if (this.activeTooltipAudio && !this.activeTooltipAudio.paused) {
        this.activeTooltipAudio.pause();
        this.activeTooltipAudio.currentTime = 0;
        this.audioPlaying = false;
      }

      this.tooltip.classList.remove('show');

      // Hide overlay
      if (this.overlay) {
        this.overlay.classList.remove('show');
      }

      // Store reference to current tooltip for cleanup
      const tooltipToRemove = this.tooltip;
      this.tooltip = null;
      this.currentTrigger = null;
      this.activeTooltipAudio = null;

      setTimeout(() => {
        if (tooltipToRemove && tooltipToRemove.parentNode) {
          tooltipToRemove.parentNode.removeChild(tooltipToRemove);
        }
      }, 300);
    }
  }

  isHoveringTooltip() {
    return this.tooltip && this.tooltip.matches(':hover');
  }

  // Public method to reinitialize tooltips (for dynamic content)
  async reinitialize(blogFolder) {

    // Use provided blog folder or try to detect it
    const folder = blogFolder || this.detectBlogFolder();


    if (folder) {
      await this.loadTooltipData(folder);

    } else {

    }

    this.initializeTooltips();
  }



  // Show entire tooltip in fullscreen at larger scale
  showImageFullscreen(imageSrc, altText, tooltipData) {
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'tooltip-fullscreen-overlay';

    // Create zoomed tooltip container
    const zoomedTooltip = document.createElement('div');
    zoomedTooltip.className = 'tooltip-zoomed';

    // Add text if available
    if (tooltipData && tooltipData.text) {
      const text = document.createElement('div');
      text.className = 'tooltip-zoomed-text';
      text.innerHTML = tooltipData.text.replace(/\n/g, '<br>');
      zoomedTooltip.appendChild(text);
    }

    // Add image if available
    if (imageSrc) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'tooltip-zoomed-image-container';

      const img = document.createElement('img');
      img.src = imageSrc;
      // Use alt text if provided, otherwise use empty string (not the full text)
      img.alt = altText || '';
      img.className = 'tooltip-zoomed-image';

      imageContainer.appendChild(img);
      zoomedTooltip.appendChild(imageContainer);
    }

    // Close handlers
    const closeFullscreen = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escHandler);
    };

    // Only close when clicking the overlay (background), not the tooltip content
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeFullscreen();
      }
    });

    // Prevent clicks inside the tooltip from closing it
    zoomedTooltip.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      }
    };
    document.addEventListener('keydown', escHandler);

    // Assemble and show
    overlay.appendChild(zoomedTooltip);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

function initHomePage() {
  let headerLoaded = false;
  let bannerLoaded = false;

  // Position theme toggle button below banner
  function adjustThemeTogglePosition() {
    requestAnimationFrame(() => {
      const banner = document.getElementById("banner-placeholder");
      const themeToggle = document.getElementById("themeToggle");
      if (banner && themeToggle) {
        const bannerRect = banner.getBoundingClientRect();
        const bannerBottom = Math.max(0, bannerRect.bottom);
        themeToggle.style.top = `${bannerBottom + 10}px`;
        // Make button visible after positioning
        themeToggle.classList.add("positioned");
      }
    });
  }

  // Check if both header and banner are loaded, then position theme toggle
  function checkAndPositionThemeToggle() {
    if (headerLoaded && bannerLoaded) {
      // Use multiple RAF calls to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          adjustThemeTogglePosition();
        });
      });
    }
  }

  // Wait for images in header to load
  function waitForHeaderImages() {
    const header = document.getElementById("header-placeholder");
    const images = header.querySelectorAll("img");

    if (images.length === 0) {
      headerLoaded = true;
      checkAndPositionThemeToggle();
      return;
    }

    let loadedImages = 0;
    const totalImages = images.length;

    images.forEach(img => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener("load", () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            headerLoaded = true;
            checkAndPositionThemeToggle();
          }
        });
        img.addEventListener("error", () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            headerLoaded = true;
            checkAndPositionThemeToggle();
          }
        });
      }
    });

    if (loadedImages === totalImages) {
      headerLoaded = true;
      checkAndPositionThemeToggle();
    }
  }

  // Load header.html first
  fetch("src/header.html")
    .then(response => response.text())
    .then(data => {
      const header = document.getElementById("header-placeholder");
      header.innerHTML = data;
      waitForHeaderImages();
    })
    .catch(error => { });

  // Load banner.html and initialize dropdown
  fetch("src/banner.html")
    .then(response => response.text())
    .then(data => {
      const banner = document.getElementById("banner-placeholder");
      banner.innerHTML = data;
      // Always try to initialize dropdowns after banner loads
      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }
      bannerLoaded = true;
      checkAndPositionThemeToggle();
    })
    .catch(error => { });

  // Update position on scroll
  window.addEventListener("scroll", adjustThemeTogglePosition);
  window.addEventListener("touchmove", adjustThemeTogglePosition, { passive: true });

  // Position on load (catch-all for timing issues)
  window.addEventListener("load", adjustThemeTogglePosition);

  // Load and display history
  loadHistory();

  // Reinitialize dropdown toggle on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }
      adjustThemeTogglePosition();
    }, 100);
  });

  // Ensure dropdowns are initialized on load
  window.addEventListener("load", () => {
    if (typeof initDropdownToggle === "function") {
      initDropdownToggle();
    }
  });
}

function loadHistory() {
  fetch("src/resources/history.json")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load history");
      return response.json();
    })
    .then(historyData => {
      // Data is already sorted and trimmed to 5 items by the Python script
      // No need to sort or slice here

      const historyList = document.getElementById("historyList");
      if (!historyList) return;

      historyList.innerHTML = "";

      historyData.forEach(item => {
        const li = document.createElement("li");
        li.className = "history-item";

        const link = document.createElement("a");
        link.href = item.link;

        const content = document.createElement("div");
        content.className = "history-item-content";

        const typeSpan = document.createElement("span");
        typeSpan.className = `history-item-type ${item.type}`;
        typeSpan.textContent = item.type;

        const nameSpan = document.createElement("span");
        nameSpan.className = "history-item-name";
        nameSpan.textContent = item.name;

        const dateSpan = document.createElement("span");
        dateSpan.className = "history-item-date";
        dateSpan.textContent = formatDate(item.date); // Uses updated formatDate function

        content.appendChild(typeSpan);
        content.appendChild(nameSpan);
        link.appendChild(content);
        link.appendChild(dateSpan);
        li.appendChild(link);
        historyList.appendChild(li);
      });
    })
    .catch(error => {
      const historyList = document.getElementById("historyList");
      if (historyList) {
        historyList.innerHTML = '<li style="color: #e74c3c; padding: 15px;">Failed to load history.</li>';
      }
    });
}

function formatDate(dateString) {
  // Handle partial dates (YYYY-MM) and full dates (YYYY-MM-DD)
  const parts = dateString.split('-');

  if (parts.length === 2) {
    // Partial date: YYYY-MM -> "Month Year"
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // 0-indexed
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  } else if (parts.length === 3) {
    // Full date: YYYY-MM-DD -> "Month DD, YYYY"
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Fallback for invalid format
  return dateString;
}

function initBlogPage() {
  // Load banner and set up page-specific functionality
  fetch("banner.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("banner-placeholder").innerHTML = data;

      // Ensure dropdowns are initialized after banner loads
      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }

      // Adjust blog list position
      adjustSidebarHeight();
    })
    .catch((error) => { });

  // Adjust sidebar height dynamically and pad content below banner
  function adjustSidebarHeight() {
    // use rAF for smoother updates and to cover rapid scroll/touch events
    requestAnimationFrame(() => {
      const banner = document.getElementById("banner-placeholder");
      const blogList = document.getElementById("blogList");
      const mobileToggle = document.getElementById("sidebarFloatingToggle");
      if (banner && blogList) {
        const bannerRect = banner.getBoundingClientRect();

        // Calculate how much of the banner is still visible
        const bannerBottom = Math.max(0, bannerRect.bottom);

        // Apply same logic for both mobile and desktop - just use bannerRect.bottom
        blogList.style.top = `${bannerBottom}px`;
        blogList.style.height = `calc(100vh - ${bannerBottom}px)`;

        // ensure mobile toggle is positioned correctly
        if (mobileToggle) {
          mobileToggle.style.top = `${bannerBottom}px`;
        }

        // Position theme toggle button below banner
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
          themeToggle.style.top = `${bannerBottom + 10}px`;
          themeToggle.classList.add("positioned");
        }
      }
    });
  }

  // Set initial sidebar state (mobile: hidden, desktop: visible)
  function setInitialSidebarState() {
    const blogList = document.getElementById("blogList");
    const floatingToggle = document.getElementById("sidebarFloatingToggle");
    if (!blogList) return;

    if (window.innerWidth <= 800) {
      // Mobile: hide sidebar initially, show floating toggle
      blogList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "block";
        floatingToggle.classList.remove("hidden");
      }
    } else {
      // Desktop: show sidebar, hide floating toggle
      blogList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "none";
      }
    }
  }

  // Toggle blog list visibility
  const toggleBlogList = document.getElementById("toggleBlogList");
  if (toggleBlogList) {
    toggleBlogList.addEventListener("click", (e) => {
      e.stopPropagation();
      const blogList = document.getElementById("blogList");
      if (window.innerWidth <= 800) {
        // Mobile: toggle overlay
        const isOpen = blogList.classList.toggle("show");
        document.body.classList.toggle("no-scroll", isOpen);
        document.documentElement.classList.toggle("no-scroll", isOpen);
        const floatingToggle = document.getElementById("sidebarFloatingToggle");
        if (floatingToggle) floatingToggle.classList.toggle("hidden", isOpen);
        // Clear search when closing
        if (!isOpen) clearSidebarSearchInputs();
      } else {
        // Desktop: toggle collapsed state
        blogList.classList.toggle("collapsed");
        const contentWrapper = document.querySelector(".content-scale-wrapper");
        if (contentWrapper) {
          contentWrapper.classList.toggle("sidebar-collapsed", blogList.classList.contains("collapsed"));
        }
        // Clear search when collapsing
        if (blogList.classList.contains("collapsed")) clearSidebarSearchInputs();
      }
    });
  }

  // Handle floating toggle for mobile
  const floatingToggle = document.getElementById("sidebarFloatingToggle");
  if (floatingToggle) {
    floatingToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const blogList = document.getElementById("blogList");
      const isOpen = blogList.classList.toggle("show");
      document.body.classList.toggle("no-scroll", isOpen);
      document.documentElement.classList.toggle("no-scroll", isOpen);
      floatingToggle.classList.toggle("hidden", isOpen);
    });
  }

  // Close mobile overlay when clicking outside
  document.addEventListener("click", (e) => {
    const blogList = document.getElementById("blogList");
    if (!blogList) return;
    if (window.innerWidth <= 800 && blogList.classList.contains("show")) {
      if (!e.target.closest(".blog-list") && !e.target.closest("#toggleBlogList") && !e.target.closest("#sidebarFloatingToggle")) {
        blogList.classList.remove("show");
        document.body.classList.remove("no-scroll");
        document.documentElement.classList.remove("no-scroll");
        if (floatingToggle) floatingToggle.classList.remove("hidden");
        clearSidebarSearchInputs();
      }
    }
  });

  // Ensure correct initial state on load and on resize
  let lastWidth = window.innerWidth;
  window.addEventListener("load", () => {
    setInitialSidebarState();
    adjustSidebarHeight();
    lastWidth = window.innerWidth;
  });
  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;
    if (currentWidth !== lastWidth) {
      setInitialSidebarState();
      lastWidth = currentWidth;
    }
    adjustSidebarHeight();
  });
  window.addEventListener("scroll", adjustSidebarHeight);
  window.addEventListener("touchmove", adjustSidebarHeight, { passive: true });
  window.addEventListener("touchend", adjustSidebarHeight);

  // Search functionality
  const blogSearch = document.getElementById("blogSearch");
  if (blogSearch) {
    blogSearch.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll("#blogListItems li").forEach((item) => {
        // Skip the no-results item itself
        if (item.classList.contains('no-results')) return;
        const link = item.querySelector('a');
        if (!link) return;
        const titleSpan = link.querySelector('.list-item-title');
        if (!titleSpan) return;

        const originalText = titleSpan.dataset.originalText || titleSpan.textContent;
        if (!titleSpan.dataset.originalText) titleSpan.dataset.originalText = originalText;
        const lowerText = originalText.toLowerCase();
        const matches = search && lowerText.includes(search);

        if (matches) {
          // Highlight matching parts
          const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
          titleSpan.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
          item.style.display = "block";
        } else if (search) {
          titleSpan.textContent = originalText;
          item.style.display = "none";
        } else {
          titleSpan.textContent = originalText;
          item.style.display = "block";
        }
      });
      updateNoResultsMessage('blogListItems');
    });
  }
}

function initPoemPage() {
  // Load banner
  fetch("banner.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("banner-placeholder").innerHTML = data;

      // Ensure dropdowns are initialized after banner loads
      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }

      // Adjust poem list position
      adjustSidebarHeight();
    })
    .catch((error) => { });

  // Similar functionality as blog page but for poems
  function adjustSidebarHeight() {
    requestAnimationFrame(() => {
      const banner = document.getElementById("banner-placeholder");
      const poemList = document.getElementById("poemList");
      const mobileToggle = document.getElementById("sidebarFloatingToggle");
      if (banner && poemList) {
        const bannerRect = banner.getBoundingClientRect();

        // Calculate how much of the banner is still visible
        const bannerBottom = Math.max(0, bannerRect.bottom);

        // Apply same logic for both mobile and desktop - just use bannerRect.bottom
        poemList.style.top = `${bannerBottom}px`;
        poemList.style.height = `calc(100vh - ${bannerBottom}px)`;

        // ensure mobile toggle is positioned correctly
        if (mobileToggle) {
          mobileToggle.style.top = `${bannerBottom}px`;
        }

        // Position theme toggle button below banner
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
          themeToggle.style.top = `${bannerBottom + 10}px`;
          themeToggle.classList.add("positioned");
        }
      }
    });
  }

  // Set initial sidebar state (mobile: hidden, desktop: visible)
  function setInitialSidebarState() {
    const poemList = document.getElementById("poemList");
    const floatingToggle = document.getElementById("sidebarFloatingToggle");
    if (!poemList) return;

    if (window.innerWidth <= 800) {
      // Mobile: hide sidebar initially, show floating toggle
      poemList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "block";
        floatingToggle.classList.remove("hidden");
      }
    } else {
      // Desktop: show sidebar, hide floating toggle
      poemList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "none";
      }
    }
  }

  // Toggle poem list visibility
  const toggleSidebar = document.getElementById("toggleSidebar");
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", (e) => {
      e.stopPropagation();
      const poemList = document.getElementById("poemList");
      if (window.innerWidth <= 800) {
        // Mobile: toggle overlay
        const isOpen = poemList.classList.toggle("show");
        document.body.classList.toggle("no-scroll", isOpen);
        document.documentElement.classList.toggle("no-scroll", isOpen);
        const floatingToggle = document.getElementById("sidebarFloatingToggle");
        if (floatingToggle) floatingToggle.classList.toggle("hidden", isOpen);
        // Clear search when closing
        if (!isOpen) clearSidebarSearchInputs();
      } else {
        // Desktop: toggle collapsed state
        poemList.classList.toggle("collapsed");
        const contentWrapper = document.querySelector(".content-scale-wrapper");
        if (contentWrapper) {
          contentWrapper.classList.toggle("sidebar-collapsed", poemList.classList.contains("collapsed"));
        }
        // Clear search when collapsing
        if (poemList.classList.contains("collapsed")) clearSidebarSearchInputs();
      }
    });
  }

  // Handle floating toggle for mobile
  const floatingToggle = document.getElementById("sidebarFloatingToggle");
  if (floatingToggle) {
    floatingToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const poemList = document.getElementById("poemList");
      const isOpen = poemList.classList.toggle("show");
      document.body.classList.toggle("no-scroll", isOpen);
      document.documentElement.classList.toggle("no-scroll", isOpen);
      floatingToggle.classList.toggle("hidden", isOpen);
    });
  }

  // Close mobile overlay when clicking outside
  document.addEventListener("click", (e) => {
    const poemList = document.getElementById("poemList");
    if (!poemList) return;
    if (window.innerWidth <= 800 && poemList.classList.contains("show")) {
      if (!e.target.closest(".poem-list") && !e.target.closest("#toggleSidebar") && !e.target.closest("#sidebarFloatingToggle")) {
        poemList.classList.remove("show");
        document.body.classList.remove("no-scroll");
        document.documentElement.classList.remove("no-scroll");
        if (floatingToggle) floatingToggle.classList.remove("hidden");
        clearSidebarSearchInputs();
      }
    }
  });

  // Event listeners
  let lastWidth = window.innerWidth;
  window.addEventListener("load", () => {
    setInitialSidebarState();
    adjustSidebarHeight();
    lastWidth = window.innerWidth;
  });
  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;
    if (currentWidth !== lastWidth) {
      setInitialSidebarState();
      lastWidth = currentWidth;
    }
    adjustSidebarHeight();
  });
  window.addEventListener("scroll", adjustSidebarHeight);
  window.addEventListener("touchmove", adjustSidebarHeight, { passive: true });
  window.addEventListener("touchend", adjustSidebarHeight);

  // Search functionality
  const poemSearch = document.getElementById("poemSearch");
  if (poemSearch) {
    poemSearch.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll("#poemListItems li").forEach((item) => {
        // Skip the no-results item itself
        if (item.classList.contains('no-results')) return;
        const link = item.querySelector('a');
        if (!link) return;
        const titleSpan = link.querySelector('.list-item-title');
        if (!titleSpan) return;

        const originalText = titleSpan.dataset.originalText || titleSpan.textContent;
        if (!titleSpan.dataset.originalText) titleSpan.dataset.originalText = originalText;
        const lowerText = originalText.toLowerCase();
        const matches = search && lowerText.includes(search);

        if (matches) {
          // Highlight matching parts
          const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
          titleSpan.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
          item.style.display = "block";
        } else if (search) {
          titleSpan.textContent = originalText;
          item.style.display = "none";
        } else {
          titleSpan.textContent = originalText;
          item.style.display = "block";
        }
      });
      updateNoResultsMessage('poemListItems');
    });
  }
}