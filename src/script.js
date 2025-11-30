// 🔹 Zoom variables for lightbox
let zoomLevel = 0;
const zoomScales = [1, 1.5, 2]; // 1x, 1.5x, 2x zoom levels
let currentImageIndex = 0;
let imageList = [];

// 🔹 Calculate scale to fit 90% of viewport
function calculateFitScale(img) {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  if (imgWidth === 0 || imgHeight === 0) {
    return 1;
  }
  const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);

  return scale;
}

// 🔹 Apply scale to image
function applyScale(img, scale) {
  img.style.width = img.naturalWidth * scale + "px";
  img.style.height = img.naturalHeight * scale + "px";
}

// 🔹 Center image if smaller than viewport
function centerImageIfSmall(img, lightbox) {
  const imgRect = img.getBoundingClientRect();
  const lightboxRect = lightbox.getBoundingClientRect();
  const left = Math.max((lightboxRect.width - imgRect.width) / 2, 0);
  const top = Math.max((lightboxRect.height - imgRect.height) / 2, 0);
  img.style.left = left + "px";
  img.style.top = top + "px";
}

// 🔹 Apply scale with fade effect
function fadeApply(img, lightbox, scale, cursorX, cursorY) {
  img.style.opacity = 0; // Fade out
  setTimeout(() => {
    // Get current position before resizing
    const currentRect = img.getBoundingClientRect();
    const currentLeft = parseFloat(img.style.left) || 0;
    const currentTop = parseFloat(img.style.top) || 0;
    const currentWidth = currentRect.width;
    const currentHeight = currentRect.height;

    // Apply new scale
    applyScale(img, scale);

    // Get new dimensions after scaling
    const newWidth = img.naturalWidth * scale;
    const newHeight = img.naturalHeight * scale;

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // At 1x zoom (fit to screen), always center the image
    const fitScale = calculateFitScale(img);
    if (Math.abs(scale - fitScale) < 0.001) {
      // Base zoom level - center the image perfectly
      const left = viewportCenterX - (newWidth / 2);
      const top = viewportCenterY - (newHeight / 2);
      img.style.left = left + "px";
      img.style.top = top + "px";
    } else if (cursorX !== undefined && cursorY !== undefined) {
      // Zooming in/out - keep cursor point stable
      // Calculate what portion of the old image the cursor was pointing at
      const cursorRelativeX = (cursorX - currentRect.left) / currentWidth;
      const cursorRelativeY = (cursorY - currentRect.top) / currentHeight;

      // Position the new image so the same relative point is under the cursor
      const left = cursorX - (cursorRelativeX * newWidth);
      const top = cursorY - (cursorRelativeY * newHeight);

      img.style.left = left + "px";
      img.style.top = top + "px";
    } else {
      // Fallback: center the image
      const left = viewportCenterX - (newWidth / 2);
      const top = viewportCenterY - (newHeight / 2);
      img.style.left = left + "px";
      img.style.top = top + "px";
    }

    img.style.opacity = 1; // Fade in
  }, 20); // Reduced from 50ms to 20ms for quicker transition
}

// 🔹 Reset zoom
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

// 🔹 Update zoom
function updateZoom(img, lightbox, cursorX, cursorY) {
  const fitScale = calculateFitScale(img);
  // Always use fitScale as the base, then multiply by the zoom multiplier
  const scale = fitScale * zoomScales[zoomLevel];
  img.classList.toggle("zoomed", zoomLevel > 0);
  fadeApply(img, lightbox, scale, cursorX, cursorY);
  
  // Hide caption when zoomed beyond basic level
  const caption = document.getElementById("lightbox-caption");
  if (caption) {
    caption.style.display = zoomLevel === 0 && caption.textContent.trim() ? "block" : "none";
  }
}

// 🔹 Function to initialize dropdown toggle for mobile and ensure desktop reset
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

// 🔹 Sidebar positioning
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

// 🔹 Function to get URL parameter
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 🔹 Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltip manager
  window.tooltipManager = new TooltipManager();

  // Initialize dropdown toggle
  initDropdownToggle();

  // Update sidebar position
  updateSidebarTop();
  
  // Update on scroll and resize for desktop
  window.addEventListener("scroll", () => {
    if (window.innerWidth > 800) {
      updateSidebarTop();
    }
  });
  
  window.addEventListener("resize", () => {
    updateSidebarTop();
  });

  // 🔹 Lightbox Initialization
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

  // 🔹 Zoom on image click
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    const cursorX = e.clientX;
    const cursorY = e.clientY;
    zoomLevel = (zoomLevel + 1) % zoomScales.length;
    updateZoom(img, lightbox, cursorX, cursorY);
    updateNavigationVisibility();
  });

  // 🔹 Close lightbox on click outside or Escape key
  lightbox.addEventListener("click", (e) => {
    if (e.target !== img && e.target !== prevBtn && e.target !== nextBtn) {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetZoom(img, lightbox);
      updateNavigationVisibility();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "block") {
      if (e.key === "Escape") {
        if (zoomLevel > 0) {
          // Reset to 1x zoom instead of closing
          zoomLevel = 0;
          updateZoom(img, lightbox);
          updateNavigationVisibility();
        } else {
          // Close lightbox if already at 1x
          lightbox.style.display = "none";
          document.body.classList.remove("lightbox-active");
          resetZoom(img, lightbox);
          updateNavigationVisibility();
        }
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

  // 🔹 Attach click event to images with .click-zoom class
  function attachLightboxEvents() {
    // Build image list for navigation - only include images inside .image-grid
    const gridImages = document.querySelectorAll(".image-grid img.click-zoom");
    imageList = Array.from(gridImages);

    document.querySelectorAll("img.click-zoom").forEach((thumbnail) => {
      if (!thumbnail.parentElement.classList.contains("image-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "image-wrapper";
        thumbnail.parentElement.insertBefore(wrapper, thumbnail);
        wrapper.appendChild(thumbnail);
      }
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
          caption.style.display = zoomLevel === 0 ? "block" : "none";
        } else {
          caption.style.display = "none";
        }
        
        const openLightbox = () => {
          lightbox.style.display = "block";
          document.body.classList.add("lightbox-active");
          resetZoom(img, lightbox);
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
    currentImageIndex = (currentImageIndex + direction + imageList.length) % imageList.length;
    const currentImg = imageList[currentImageIndex];
    img.src = currentImg.src;
    
    // Update caption with current image's alt text
    const caption = document.getElementById("lightbox-caption");
    if (currentImg.alt && currentImg.alt.trim()) {
      caption.textContent = currentImg.alt;
      caption.style.display = zoomLevel === 0 ? "block" : "none";
    } else {
      caption.style.display = "none";
    }
    
    const reloadImage = () => {
      resetZoom(img, lightbox);
      updateNavigationVisibility();
    };
    if (img.complete && img.naturalWidth) reloadImage();
    else img.onload = reloadImage;
  }

  // Update navigation button visibility
  function updateNavigationVisibility() {
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    // Only show navigation if: lightbox is open, at 1x zoom, image is in grid, and there are multiple grid images
    if (lightbox.style.display === "block" && zoomLevel === 0 && currentImageIndex >= 0 && imageList.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  attachLightboxEvents();

  // 🔹 Poem and Blog Initialization
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

  // 🔹 Search filter
  const searchInput = document.getElementById("blogSearch") || document.getElementById("poemSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      const listId = searchInput.id === "blogSearch" ? "blogList" : "poemList";
      document.querySelectorAll(`#${listId} li`).forEach((item) => {
        const title = item.textContent.toLowerCase();
        item.style.display = title.includes(search) ? "block" : "none";
      });
    });
  }

  // 🔹 Audio Player
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

  // 🔹 Back to Top Button
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (document.documentElement.scrollTop > 200) {
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // 🔹 Poem Functions
  let poemsCache = [];
  function initPoems() {
    // Fix manifest path to use ../poems/
    fetch("../poems/poems_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load poems manifest");
        return res.json();
      })
      .then((poems) => {
        poemsCache = poems;
        buildPoemList(poems);
        const poemIndex = parseInt(getUrlParameter("poem")) || 0;
        if (poems.length > 0) {
          const selectedPoem = poems[Math.min(Math.max(poemIndex, 0), poems.length - 1)];
          loadPoem(selectedPoem);
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
    // Replace underscores with spaces but keep the number prefix
    title = title.replace(/_/g, " ");
    title = title.replace(/\b\w/g, (char) => char.toUpperCase());
    return title.trim();
  }

  function buildPoemList(poems) {
    const poemListItems = document.getElementById("poemListItems");
    if (!poemListItems) {

      return;
    }
    poemListItems.innerHTML = "";
    poems.forEach((poem, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = formatPoemTitle(poem.name);
      a.dataset.poem = JSON.stringify(poem);
      a.dataset.index = index;
      a.classList.add("poem-link");
      li.appendChild(a);
      poemListItems.appendChild(li);
    });
    poemListItems.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const index = link.dataset.index;
        const currentPoemIndex = getUrlParameter('poem');
        
        // If clicking on the currently active poem
        if (index === currentPoemIndex) {
          // On mobile, just close the sidebar
          if (window.innerWidth <= 800) {
            closeSidebarAfterSelect();
          }
          // On desktop, do nothing
          return;
        }
        
        // Different poem selected, load it
        const poem = JSON.parse(link.getAttribute("data-poem"));
        loadPoem(poem);
        history.pushState({ poemIndex: index }, "", `?poem=${index}`);
        // only hide/collapse sidebar on mobile
        if (window.innerWidth <= 800) {
          closeSidebarAfterSelect();
        }
      });
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
    // When in src/ folder, need to go up one level with ../ to reach poems/
    fetch("../poems/" + poem.folder + "/poem.md")
      .then((res) => {
        if (!res.ok) throw new Error("Poem not found");
        return res.text();
      })
      .then((md) => {
        const poemText = document.getElementById("poemText");
        const poemContent = document.getElementById("poemContent");
        const audioPlayer = document.getElementById("audioPlayer");
        
        // Extract and remove YAML front matter date
        let dateStr = null;
        md = md.replace(/^---\s*\ndate:\s*(\d{4}-\d{2}-\d{2})\s*\n---\s*\n/m, (match, extractedDate) => {
          dateStr = extractedDate;
          return ''; // Remove the front matter from markdown
        });
        
        // Render markdown (without date)
        poemText.innerHTML = marked.parse(md);
        
        // Create and insert date element BEFORE audio player and poem text
        if (dateStr && poemContent) {
          // Remove any existing date element
          const existingDate = poemContent.querySelector('.poem-date');
          if (existingDate) {
            existingDate.remove();
          }
          
          // Format the date nicely
          const date = new Date(dateStr);
          const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          
          // Create date element
          const dateElement = document.createElement('p');
          dateElement.className = 'poem-date';
          dateElement.style.cssText = 'font-style: italic; color: #8d99ae; text-align: left; margin: 0 0 16px 0; font-size: 0.9em;';
          dateElement.textContent = formatted;
          
          // Insert at the top of poemContent (before audio player and poem text)
          poemContent.insertBefore(dateElement, poemContent.firstChild);
        }
        
        attachLightboxEvents();
      })
      .catch((err) => {
        document.getElementById("poemText").innerHTML = "<p>Error loading poem.</p>";
      });
    if (poem.audio) {
      const audioPlayer = document.getElementById("audioPlayer");
      const audioElement = document.getElementById("audioElement");
      // Fix audio path to use ../poems/
      const audioPath = "../poems/" + poem.folder + "/" + encodeURIComponent(poem.audio);
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

  // 🔹 Blog Functions
  let blogsCache = [];
  function initBlogs() {
    // Fix blogs manifest path to use ../blogs/
    fetch("../blogs/blogs_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blogs manifest");
        return res.json();
      })
      .then((blogs) => {
        blogsCache = blogs;
        // Store in global scope for tooltip manager access
        window.blogsCache = blogs;
        blogs.sort((a, b) => b.folder.localeCompare(a.folder));
        const target = document.getElementById("blogText");
        if (target) target.innerHTML = "Loading blog post...";
        buildBlogList(blogs);
        const blogIndex = parseInt(getUrlParameter("blog")) || 0;
        if (blogs.length > 0) {
          const selectedBlog = blogs[Math.min(Math.max(blogIndex, 0), blogs.length - 1)];
          loadBlogPost(selectedBlog);
        }
      })
      .catch((err) => { });
  }

  function buildBlogList(blogs) {
    const listEl = document.getElementById("blogListItems");
    if (!listEl) return;
    listEl.innerHTML = "";
    blogs.forEach((blog, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = blog.title || formatBlogTitle(blog.folder);
      a.dataset.blog = JSON.stringify(blog);
      a.dataset.index = index;
      a.classList.add("blog-link");
      li.appendChild(a);
      listEl.appendChild(li);
    });
    listEl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const index = link.dataset.index;
        const currentBlogIndex = getUrlParameter('blog');
        
        // If clicking on the currently active blog
        if (index === currentBlogIndex) {
          // On mobile, just close the sidebar
          if (window.innerWidth <= 800) {
            closeSidebarAfterSelect();
          }
          // On desktop, do nothing
          return;
        }
        
        // Different blog selected, load it
        const blog = JSON.parse(link.getAttribute("data-blog"));
        loadBlogPost(blog);
        history.pushState({ blogIndex: index }, "", `?blog=${index}`);
        // only hide/collapse sidebar on mobile
        if (window.innerWidth <= 800) {
          closeSidebarAfterSelect();
        }
      });
    });
  }

  function formatBlogTitle(folder) {
    let title = folder.replace(/_/g, " ");
    title = title.replace(/\b\w/g, (char) => char.toUpperCase());
    return title.trim();
  }

  function loadBlogPost(blog) {
    resetAudioPlayer();
    const target = document.getElementById("blogText");
    if (!target) return;
    target.innerHTML = "Loading blog post...";
    const mdPath = "blogs/" + encodeURIComponent(blog.folder) + "/blog.md";
    fetch(mdPath)
      .then((res) => {
        if (!res.ok) throw new Error("Blog post not found");
        return res.text();
      })
      .then((md) => {
        // Extract and remove YAML front matter date
        let dateStr = null;
        md = md.replace(/^---\s*\ndate:\s*(\d{4}-\d{2}-\d{2})\s*\n---\s*\n/m, (match, extractedDate) => {
          dateStr = extractedDate;
          return ''; // Remove the front matter from markdown
        });
        
        // Format the date nicely
        let dateHtml = '';
        if (dateStr) {
          const date = new Date(dateStr);
          const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          dateHtml = `<p style="font-style: italic; color: #8d99ae; text-align: left; margin: 0 0 24px 0; font-size: 0.9em;">${formatted}</p>`;
        }
        
        md = md.replace(/!\[(.*?)\]\(([^)]+)\)/g, (match, alt, src) => {
          const classes = ["hover-effect", "click-zoom"];
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
          // Only add click-zoom if it's already in the original classes
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
            // Only add click-zoom if it's already in the original classes
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
            return `<div class="pdf-placeholder"><a href="${href}" target="_blank" rel="noopener noreferrer">Open schematic: ${filename}</a></div>`;
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
          // small timeout to ensure elements are laid out
          setTimeout(() => scrollToAnchor(location.hash), 50);
        }
      })
      .catch((err) => {
        target.innerHTML = "Failed to load blog post.";
      });
  }

  // 🔹 Handle URL changes (back/forward navigation)
  // Move anchor handling to the top so anchor popstates do not trigger expensive blog/poem reloads.
  window.addEventListener("popstate", (event) => {
    // If the popped history state is an anchor, handle it immediately and return
    if (event.state && event.state.anchor) {
      scrollToAnchor("#" + event.state.anchor);
      return;
    }

    if (window.location.pathname.includes("poems")) {
      if (poemsCache.length === 0) {
        initPoems();
      } else {
        const poemIndex = parseInt(getUrlParameter("poem")) || 0;
        const selectedPoem = poemsCache[Math.min(Math.max(poemIndex, 0), poemsCache.length - 1)];
        loadPoem(selectedPoem);
      }
    } else if (window.location.pathname.includes("blogs")) {
      if (blogsCache.length === 0) {
        initBlogs();
      } else {
        const blogIndex = parseInt(getUrlParameter("blog")) || 0;
        const selectedBlog = blogsCache[Math.min(Math.max(blogIndex, 0), blogsCache.length - 1)];
        loadBlogPost(selectedBlog);
      }
    }
  });

  // 🔹 Ensure initialization on load
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
      ft.setAttribute("aria-hidden", "false");
    }
  }

  // Call once and on relevant events so the floating toggle is only present on small screens
  updateFloatingToggleVisibility();
  window.addEventListener("resize", updateFloatingToggleVisibility);
  window.addEventListener("orientationchange", updateFloatingToggleVisibility);
  // update after interactions that may toggle .hidden
  document.addEventListener("click", updateFloatingToggleVisibility);
  document.addEventListener("keydown", updateFloatingToggleVisibility);
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
  }
}

// Tooltip Manager Class
class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.currentTrigger = null;
    this.hideTimeout = null;
    this.currentAudio = null;
    this.audioPlaying = false;
    this.tooltipDimensions = new Map();
    this.tooltipData = new Map();
    this.allAudioElements = new Set(); // Track all audio elements
    this.activeTooltipAudio = null; // Track audio in current tooltip
    this.init();
  }

  init() {
    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tooltip-trigger') && !e.target.closest('.tooltip')) {
        this.hideActiveTooltip();
      }
    });

    // Store last mouse event for repositioning on scroll
    this.lastMouseEvent = null;
    document.addEventListener('mousemove', (e) => {
      this.lastMouseEvent = e;
    });

    // Update tooltip position on scroll
    window.addEventListener('scroll', () => {
      if (this.tooltip && this.currentTrigger) {
        // Get the data for current tooltip
        const dataKey = this.currentTrigger.getAttribute('data-tooltip');
        if (dataKey && this.tooltipData.has(dataKey)) {
          const data = this.tooltipData.get(dataKey);
          // Use cursor positioning if we have a recent mouse event, otherwise fallback to element
          if (this.lastMouseEvent) {
            this.positionTooltipAtCursor(this.tooltip, this.lastMouseEvent, data);
          } else {
            this.positionTooltipAtTrigger(this.tooltip, this.currentTrigger, data);
          }
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

  // 🔹 Calculate tooltip position and show
  showTooltip(trigger, data, mouseEvent = null) {
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

    // Position tooltip at cursor location if mouse event is available
    if (mouseEvent) {
      this.positionTooltipAtCursor(tooltip, mouseEvent, data);
    } else {
      this.positionTooltipAtTrigger(tooltip, trigger, data);
    }

    // Force a reflow to ensure positioning is applied before adding show class
    tooltip.offsetHeight;

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
      // If audio is playing, keep tooltip open
      if (this.audioPlaying) {
        return;
      }
      // Otherwise add delay to allow moving back
      this.hideTimeout = setTimeout(() => {
        if (!this.audioPlaying) {
          this.hideActiveTooltip();
        }
      }, 1000);
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
        // Create audio player similar to poems page
        const audioPlayer = document.createElement('div');
        audioPlayer.className = 'tooltip-audio-player';
        audioPlayer.style.cssText = `
          background: #1e1e1e;
          border-radius: 6px;
          padding: 10px;
          min-width: 280px;
        `;

        const playerControls = document.createElement('div');
        playerControls.className = 'player-controls';
        playerControls.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
        `;

        const playPauseBtn = document.createElement('button');
        playPauseBtn.innerHTML = '▶';
        playPauseBtn.className = 'player-btn';
        playPauseBtn.style.cssText = `
          background: #3498db;
          border: none;
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-user-select: none;
          outline: none;
          transition: background-color 0.2s ease;
        `;

        // Add hover effects
        playPauseBtn.addEventListener('mouseenter', () => {
          playPauseBtn.style.backgroundColor = '#2980b9';
        });

        playPauseBtn.addEventListener('mouseleave', () => {
          playPauseBtn.style.backgroundColor = '#3498db';
        });

        const currentTime = document.createElement('span');
        currentTime.textContent = '0:00';
        currentTime.style.cssText = `
          color: #d3d7db;
          font-size: 12px;
          min-width: 35px;
        `;

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.cssText = `
          flex: 1;
          height: 6px;
          background: #444;
          border-radius: 3px;
          position: relative;
          cursor: pointer;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
          height: 100%;
          background: #3498db;
          border-radius: 3px;
          width: 0%;
          transition: none;
        `;

        const progressHandle = document.createElement('div');
        progressHandle.style.cssText = `
          position: absolute;
          top: 50%;
          left: 0%;
          width: 12px;
          height: 12px;
          background: #3498db;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: grab;
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
        `;

        const duration = document.createElement('span');
        duration.textContent = '0:00';
        duration.style.cssText = `
          color: #d3d7db;
          font-size: 12px;
          min-width: 35px;
        `;

        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressHandle);

        const audioElement = document.createElement('audio');
        audioElement.src = data.media;
        audioElement.loop = true;
        audioElement.preload = 'metadata';

        // Track this audio element
        this.allAudioElements.add(audioElement);
        this.activeTooltipAudio = audioElement;

        // Update progress
        const updateProgress = () => {
          if (audioElement.duration && isFinite(audioElement.duration)) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = percent + '%';
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
              this.stopAllOtherAudio(audioElement); // Ensure only this one plays
            }).catch(err => {
              // Try alternative approach
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

        // Add mousedown event as backup
        playPauseBtn.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });

        // Add pointer events for better touch support
        playPauseBtn.style.pointerEvents = 'auto';
        playPauseBtn.setAttribute('type', 'button');

        // Progress bar click to seek
        progressContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = progressContainer.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          if (audioElement.duration && isFinite(audioElement.duration)) {
            audioElement.currentTime = percent * audioElement.duration;
            updateProgress();
          }
        });

        // Draggable progress handle (similar to poems page)
        let dragging = false;
        const rectToPct = (clientX) => {
          const rect = progressContainer.getBoundingClientRect();
          return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        };

        const onPointerMove = (clientX) => {
          if (!audioElement || !audioElement.duration || !isFinite(audioElement.duration)) return;
          const pct = rectToPct(clientX);
          progressBar.style.width = (pct * 100) + "%";
          progressHandle.style.left = (pct * 100) + "%";
          // update current time visually (but don't commit until pointerup)
          currentTimeEl.textContent = formatTime(pct * audioElement.duration);
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
          // commit time
          const pct = rectToPct(ev.clientX);
          if (audioElement.duration && isFinite(audioElement.duration)) {
            audioElement.currentTime = pct * audioElement.duration;
          }
          if (progressHandle.releasePointerCapture) progressHandle.releasePointerCapture(ev.pointerId);
        });

        audioElement.addEventListener('loadedmetadata', () => {
          duration.textContent = formatTime(audioElement.duration);
          updateProgress();
        });

        audioElement.addEventListener('timeupdate', updateProgress);

        audioElement.addEventListener('ended', () => {
          // Since we're looping, this shouldn't fire, but just in case
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
        mediaEl.onerror = () => {

        };
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
    // Check if using ID-based tooltip (now just 'tt')
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

    // Remove existing listeners to avoid duplicates
    element.removeEventListener('mouseenter', element._tooltipMouseEnter);
    element.removeEventListener('mouseleave', element._tooltipMouseLeave);

    // Create new listeners with unified delay
    element._tooltipMouseEnter = (e) => {
      // Clear any pending hide timeout
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      
      // Store the event for positioning
      element._lastMouseEvent = e;
      
      // If tooltip is already showing for this trigger, don't recreate it
      if (this.tooltip && this.currentTrigger === element) {
        return;
      }
      
      // Unified 500ms delay before showing tooltip for all types
      element._tooltipTimeout = setTimeout(() => {
        this.showTooltip(e.target, tooltipData, element._lastMouseEvent);
      }, 500);
    };

    element._tooltipMouseLeave = (e) => {
      // Check if mouse moved into tooltip
      const relatedTarget = e.relatedTarget;
      if (relatedTarget && this.tooltip && this.tooltip.contains(relatedTarget)) {
        // Cancel show timeout but don't hide
        if (element._tooltipTimeout) {
          clearTimeout(element._tooltipTimeout);
          element._tooltipTimeout = null;
        }
        return;
      }
      
      // Clear the show timeout if mouse leaves before tooltip appears
      if (element._tooltipTimeout) {
        clearTimeout(element._tooltipTimeout);
        element._tooltipTimeout = null;
      }

      // Unified hide delay for all tooltip types
      this.hideTimeout = setTimeout(() => {
        if (!this.audioPlaying) {
          this.hideActiveTooltip();
        }
      }, 1000);
    };

    element.addEventListener('mouseenter', element._tooltipMouseEnter);
    element.addEventListener('mouseleave', element._tooltipMouseLeave);
  }

  // Position tooltip at cursor location
  positionTooltipAtCursor(tooltip, mouseEvent, data) {
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

    // Get cursor position from the mouse event
    const cursorX = mouseEvent.pageX;
    const cursorY = mouseEvent.pageY;

    // Position tooltip above and centered on cursor
    let left = cursorX - (tooltipWidth / 2);
    let top = cursorY - tooltipHeight - 15; // 15px gap above cursor

    // Adjust if tooltip goes off screen horizontally
    const scrollX = window.pageXOffset;
    if (left < scrollX + 10) left = scrollX + 10;
    if (left + tooltipWidth > scrollX + window.innerWidth - 10) {
      left = scrollX + window.innerWidth - tooltipWidth - 10;
    }

    // If not enough space above cursor, show below
    if (top < window.pageYOffset + 10) {
      top = cursorY + 15; // 15px gap below cursor
      tooltip.classList.add('bottom');
    } else {
      tooltip.classList.remove('bottom');
    }

    // Use absolute positioning
    tooltip.style.position = 'absolute';
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  // Position tooltip relative to trigger element for scroll following
  positionTooltipAtTrigger(tooltip, trigger, data) {
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

    // Position tooltip above and centered on trigger
    let left = triggerX + (triggerRect.width / 2) - (tooltipWidth / 2);
    let top = triggerY - tooltipHeight - 10; // 10px gap above trigger

    // Adjust if tooltip goes off screen horizontally
    const scrollX = window.pageXOffset;
    if (left < scrollX + 10) left = scrollX + 10;
    if (left + tooltipWidth > scrollX + window.innerWidth - 10) {
      left = scrollX + window.innerWidth - tooltipWidth - 10;
    }

    // If not enough space above trigger, show below
    if (top < window.pageYOffset + 10) {
      top = triggerY + triggerRect.height + 10; // 10px gap below trigger
      tooltip.classList.add('bottom');
    }

    // Use absolute positioning so tooltip follows page scroll
    tooltip.style.position = 'absolute';
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
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
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      cursor: pointer;
    `;

    // Create zoomed tooltip container
    const zoomedTooltip = document.createElement('div');
    zoomedTooltip.style.cssText = `
      background: #2c2c2c;
      border: 1px solid #555;
      border-radius:  8px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      max-width: 95vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      cursor: auto;
      overflow: hidden;
    `;

    // Add text if available
    if (tooltipData && tooltipData.text) {
      const text = document.createElement('div');
      text.style.cssText = `
        color: #fff;
        font-size: 22px;
        line-height: 1.4;
        margin-bottom: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        flex-shrink: 0;
      `;
      text.innerHTML = tooltipData.text.replace(/\n/g, '<br>');
      zoomedTooltip.appendChild(text);
    }

    // Add image if available
    if (imageSrc) {
      const imageContainer = document.createElement('div');
      imageContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = altText || 'Zoomed image';
      img.style.cssText = `
        max-width: calc(95vw - 40px);
        max-height: calc(90vh - ${tooltipData && tooltipData.text ? '120px' : '40px'});
        border-radius: 4px;
        display: block;
      `;

      imageContainer.appendChild(img);
      zoomedTooltip.appendChild(imageContainer);
    }

    // Close handlers - click anywhere to close
    const closeFullscreen = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escHandler);
    };

    overlay.addEventListener('click', closeFullscreen);
    zoomedTooltip.addEventListener('click', closeFullscreen);

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
//// 🔹 Home Page Initialization
function initHomePage() {
  // Load header.html first
  fetch("src/header.html")
    .then(response => response.text())
    .then(data => {
      const header = document.getElementById("header-placeholder");
      header.innerHTML = data;
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
    })
    .catch(error => { });

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
    }, 100);
  });

  // Ensure dropdowns are initialized on load
  window.addEventListener("load", () => {
    if (typeof initDropdownToggle === "function") {
      initDropdownToggle();
    }
  });
}

// 🔹 Load and display history
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
        dateSpan.textContent = formatDate(item.date);

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

// 🔹 Format date to readable format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// 🔹 Blog Page Initialization
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
      } else {
        // Desktop: toggle collapsed state
        blogList.classList.toggle("collapsed");
        const contentWrapper = document.querySelector(".content-scale-wrapper");
        if (contentWrapper) {
          contentWrapper.classList.toggle("sidebar-collapsed", blogList.classList.contains("collapsed"));
        }
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
      }
    }
  });

  // Ensure correct initial state on load and on resize
  window.addEventListener("load", () => {
    setInitialSidebarState();
    adjustSidebarHeight();
  });
  window.addEventListener("resize", () => {
    setInitialSidebarState();
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
        const title = item.textContent.toLowerCase();
        item.style.display = title.includes(search) ? "block" : "none";
      });
    });
  }
}

// 🔹 Poem Page Initialization  
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
      } else {
        // Desktop: toggle collapsed state
        poemList.classList.toggle("collapsed");
        const contentWrapper = document.querySelector(".content-scale-wrapper");
        if (contentWrapper) {
          contentWrapper.classList.toggle("sidebar-collapsed", poemList.classList.contains("collapsed"));
        }
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
      }
    }
  });

  // Event listeners
  window.addEventListener("load", () => {
    setInitialSidebarState();
    adjustSidebarHeight();
  });
  window.addEventListener("resize", () => {
    setInitialSidebarState();
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
        const title = item.textContent.toLowerCase();
        item.style.display = title.includes(search) ? "block" : "none";
      });
    });
  }
}