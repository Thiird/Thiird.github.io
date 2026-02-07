let zoomLevel = 0;
const zoomScales = [1, 1.5, 2];
let currentImageIndex = 0;
let imageList = [];

window.toggleAfterthoughts = function (button) {
  const content = button.nextElementSibling;
  const isHidden = content.classList.contains('hidden');

  if (isHidden) {
    content.classList.remove('hidden');
    button.textContent = "▲";
  } else {
    content.classList.add('hidden');
    button.textContent = "▼";
  }
};

function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll(".top-menu .dropdown");
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("active");
    const menu = dropdown.querySelector(".dropdown-menu");
    if (menu) menu.style.display = "none";
  });
}

function calculateFitScale(img) {
  const isMobile = window.innerWidth <= 600;
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
  img.style.opacity = 0;
  setTimeout(() => {
    const oldRect = img.getBoundingClientRect();
    const oldWidth = oldRect.width;
    const oldHeight = oldRect.height;
    const oldLeft = parseFloat(img.style.left) || 0;
    const oldTop = parseFloat(img.style.top) || 0;

    applyScale(img, scale);
    const newRect = img.getBoundingClientRect();
    const newWidth = newRect.width;
    const newHeight = newRect.height;

    if (cursorX !== undefined && cursorY !== undefined && zoomLevel > 0) {
      const relX = (cursorX - oldRect.left) / oldWidth;
      const relY = (cursorY - oldRect.top) / oldHeight;

      const newLeft = cursorX - relX * newWidth;
      const newTop = cursorY - relY * newHeight;

      img.style.left = newLeft + "px";
      img.style.top = newTop + "px";
    } else {
      centerImageIfSmall(img, lightbox);
    }

    img.style.opacity = 1;
  }, 20);
}

function resetZoom(img, lightbox) {
  zoomLevel = 0;
  img.classList.remove("zoomed");
  const scale = calculateFitScale(img);
  fadeApply(img, lightbox, scale);

  const caption = document.getElementById("lightbox-caption");
  if (caption && caption.textContent.trim()) {
    caption.style.display = "block";
  }
}

function updateZoom(img, lightbox, cursorX, cursorY) {
  const fitScale = calculateFitScale(img);
  const scale = fitScale * zoomScales[zoomLevel];
  img.classList.toggle("zoomed", zoomLevel > 0);
  fadeApply(img, lightbox, scale, cursorX, cursorY);

  const caption = document.getElementById("lightbox-caption");
  if (caption) {
    caption.style.display = zoomLevel > 0 ? "none" : "block";
  }
}

function initDropdownToggle() {
  const dropdowns = document.querySelectorAll(".top-menu .dropdown");
  const isMobile = window.innerWidth <= 800;

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".menu-button");
    const menu = dropdown.querySelector(".dropdown-menu");
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    dropdown.classList.remove("active");
    if (menu) {
      menu.style.display = "none";
      menu.style.position = "";
      menu.style.top = "";
      menu.style.left = "";
      menu.style.transform = "";
      menu.style.zIndex = "";
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

  function positionFixedMenu(button, menu) {
    if (!button || !menu) return;
    menu.style.display = "block";
    menu.style.position = "fixed";
    menu.style.zIndex = "99999";
    menu.style.transform = "none";
    const btnRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const overlap = 0;
    const gap = 0;

    let left = btnRect.left + btnRect.width / 2 - menuRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
    let top = btnRect.bottom + gap - overlap;
    if (top + menuRect.height > window.innerHeight - 8) {
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
      button._clickHandler = (e) => {
        e.preventDefault();
        const isActive = dropdown.classList.contains("active");
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

      const menuLinks = menu.querySelectorAll("a");
      menuLinks.forEach(link => {
        link.addEventListener("click", () => {
          closeAllDropdowns();
        });
      });
    } else {
      dropdown._mouseenterHandler = (e) => {
        positionFixedMenu(button, menu);
        dropdown.classList.add("active");
        menu.style.display = "block";

        const reposition = () => positionFixedMenu(button, menu);
        window.addEventListener("scroll", reposition, { passive: true });
        window.addEventListener("resize", reposition);
        menu._reposition = reposition;

        menu._mouseenterHandler = (ev) => {
        };
        menu._mouseleaveHandler = (ev) => {
          const related = ev.relatedTarget;
          if (related && (button.contains(related) || menu.contains(related))) {
            return;
          }
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
        if (related && (button.contains(related) || menu.contains(related))) {
          return;
        }
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

      button.addEventListener("mouseenter", () => {
        if (menu.style.display !== "block") {
          positionFixedMenu(button, menu);
          dropdown.classList.add("active");
          menu.style.display = "block";
          const reposition = () => positionFixedMenu(button, menu);
          window.addEventListener("scroll", reposition, { passive: true });
          window.addEventListener("resize", reposition);
          menu._reposition = reposition;
        }
      });
    }
  });

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
    if (window.innerWidth > 800) {
      const bannerRect = banner.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

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
  if (!container) return;
}

function addTableDataLabels(container) {
  if (!container) return;

  const tables = container.querySelectorAll('.blog-text table, .content-text table');
  tables.forEach(table => {
    const headers = table.querySelectorAll('thead th');
    const headerTexts = Array.from(headers).map(th => th.textContent.trim());

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        if (headerTexts[index]) {
          cell.setAttribute('data-label', headerTexts[index]);
        }
      });

      if (rowIndex === 0) {
        row.classList.add('active');
      }
    });

    if (rows.length > 1 && window.innerWidth <= 768) {
      addTableArrows(table, rows);
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const arrows = row.querySelectorAll('.table-arrow');
          arrows.forEach(arrow => arrow.remove());
        });

        if (rows.length > 1 && window.innerWidth <= 768) {
          addTableArrows(table, rows);
        }
      });
    }, 250);
  });
}

function addTableArrows(table, rows) {
  let currentIndex = 0;

  const updateArrows = () => {
    rows.forEach((row, index) => {
      const leftArrow = row.querySelector('.table-arrow-left');
      const rightArrow = row.querySelector('.table-arrow-right');

      if (leftArrow && rightArrow) {
        if (currentIndex === 0) {
          leftArrow.classList.add('disabled');
        } else {
          leftArrow.classList.remove('disabled');
        }

        if (currentIndex === rows.length - 1) {
          rightArrow.classList.add('disabled');
        } else {
          rightArrow.classList.remove('disabled');
        }
      }
    });
  };

  rows.forEach((row, rowIndex) => {
    const firstCell = row.querySelector('td:first-child');
    if (!firstCell) return;

    const leftArrow = document.createElement('button');
    leftArrow.className = 'table-arrow table-arrow-left';
    leftArrow.innerHTML = '◀';
    leftArrow.setAttribute('aria-label', 'Previous item');

    const rightArrow = document.createElement('button');
    rightArrow.className = 'table-arrow table-arrow-right';
    rightArrow.innerHTML = '▶';
    rightArrow.setAttribute('aria-label', 'Next item');

    leftArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        rows[currentIndex].classList.remove('active');
        currentIndex--;
        rows[currentIndex].classList.add('active');
        updateArrows();
      }
    });

    rightArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex < rows.length - 1) {
        rows[currentIndex].classList.remove('active');
        currentIndex++;
        rows[currentIndex].classList.add('active');
        updateArrows();
      }
    });

    firstCell.insertBefore(leftArrow, firstCell.firstChild);
    firstCell.appendChild(rightArrow);
  });

  updateArrows();
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

  const prevBtn = document.createElement("button");
  prevBtn.id = "lightbox-prev";
  prevBtn.innerHTML = "‹";
  prevBtn.setAttribute("aria-label", "Previous image");

  const nextBtn = document.createElement("button");
  nextBtn.id = "lightbox-next";
  nextBtn.innerHTML = "›";
  nextBtn.setAttribute("aria-label", "Next image");

  const caption = document.createElement("div");
  caption.id = "lightbox-caption";

  lightbox.appendChild(prevBtn);
  lightbox.appendChild(img);
  lightbox.appendChild(nextBtn);
  lightbox.appendChild(caption);
  document.body.appendChild(lightbox);

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
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      const scale = visualViewport.scale;
      return scale > 1.01;
    }
    const scale = window.outerWidth / window.innerWidth;
    return scale > 1.01;
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    const pageZoomed = isPageZoomed();
    const clickZoomed = zoomLevel > 0;
    const isZoomed = pageZoomed || clickZoomed;

    if (!isZoomed) {
      if (swipeDistance > 0) {
        navigateImage(-1);
      } else {
        navigateImage(1);
      }
    }
  }

  function attachLightboxEvents() {
    const gridImages = document.querySelectorAll(".image-grid img.click-zoom");
    imageList = Array.from(gridImages);

    document.querySelectorAll("img.click-zoom").forEach((thumbnail) => {
      thumbnail.style.cursor = "pointer";
      thumbnail.removeEventListener("click", thumbnail._lightboxHandler);
      thumbnail._lightboxHandler = () => {
        currentImageIndex = imageList.indexOf(thumbnail);
        img.src = thumbnail.src;

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

  function navigateImage(direction) {
    if (imageList.length === 0 || currentImageIndex < 0) return;
    zoomLevel = 0;
    currentImageIndex = (currentImageIndex + direction + imageList.length) % imageList.length;
    const currentImg = imageList[currentImageIndex];
    img.src = currentImg.src;

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

  function updateNavigationVisibility() {
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    if (lightbox.style.display === "block" && currentImageIndex >= 0 && imageList.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  attachLightboxEvents();

  function initOverviewSlideshow() {
    const container = document.querySelector('#overview-slideshow .slideshow-images');
    if (!container) return;
    const manifestPath = 'src/resources/images/overview/overview_manifest.json';

    fetch(manifestPath)
      .then((res) => {
        if (!res.ok) throw new Error('No manifest');
        return res.json();
      })
      .then((list) => {
        if (!Array.isArray(list) || list.length === 0) return;

        let current = 0;
        const slot1 = document.createElement('div');
        slot1.className = 'slideshow-image1';
        const img1 = document.createElement('img');
        img1.className = 'slideshow-img click-zoom';
        slot1.appendChild(img1);

        const slot2 = document.createElement('div');
        slot2.className = 'slideshow-image2';
        const img2 = document.createElement('img');
        img2.className = 'slideshow-img click-zoom';
        slot2.appendChild(img2);

        container.innerHTML = '';
        container.appendChild(slot1);
        container.appendChild(slot2);

        function pathFor(name) {
          return 'src/resources/images/overview/' + encodeURIComponent(name).replace(/%2F/g, '/');
        }

        function setSrc(imgEl, idx) {
          const name = list[idx];
          imgEl.src = pathFor(name);
          imgEl.alt = '';
        }

        setSrc(img1, current);
        setSrc(img2, (current + 1) % list.length);

        function applyOrientation(imgEl) {
          try {
            const isVertical = imgEl.naturalHeight >= imgEl.naturalWidth;
            if (isVertical) {
              container.classList.add('vertical');
              container.classList.remove('horizontal');
            } else {
              container.classList.add('horizontal');
              container.classList.remove('vertical');
            }

            container.querySelectorAll('.slideshow-img').forEach((ie) => {
              ie.classList.add('contain');
              ie.classList.remove('cover');
            });
          } catch (e) {
          }
        }

        img1.addEventListener('load', () => applyOrientation(img1));
        img2.addEventListener('load', () => applyOrientation(img1));

        if (img1.complete && img1.naturalWidth) applyOrientation(img1);

        const prevBtn = document.querySelector('.slideshow-prev');
        const nextBtn = document.querySelector('.slideshow-next');
        let animating = false;

        function show(direction) {
          if (animating) return;
          animating = true;
          const nextIndex = (current + (direction > 0 ? 1 : -1) + list.length) % list.length;

          if (direction > 0) {
            setSrc(img2, nextIndex);
            slot1.classList.add('fade-out-in-place');
            slot2.classList.add('slide-left-overlap');
            setTimeout(() => {
              setSrc(img1, nextIndex);
              slot1.classList.remove('fade-out-in-place');
              slot2.classList.remove('slide-left-overlap');
              current = nextIndex;
              setSrc(img2, (current + 1) % list.length);
              animating = false;
              attachLightboxEvents();
            }, 520);
          } else {
            setSrc(img2, nextIndex);
            slot2.classList.add('fade-in-on-right');
            slot1.classList.add('fade-out-in-place');
            setTimeout(() => {
              setSrc(img1, nextIndex);
              slot1.classList.remove('fade-out-in-place');
              slot2.classList.remove('fade-in-on-right');
              current = nextIndex;
              setSrc(img2, (current + 1) % list.length);
              animating = false;
              attachLightboxEvents();
            }, 520);
          }
        }

        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); show(-1); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); show(1); });

        let interval = setInterval(() => show(1), 6000);
        container.addEventListener('mouseenter', () => clearInterval(interval));
        container.addEventListener('mouseleave', () => { clearInterval(interval); interval = setInterval(() => show(1), 6000); });

        attachLightboxEvents();
      })
      .catch(() => {
      });
  }

  initOverviewSlideshow();
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
      updateNoResultsMessage(itemsListId);
    });
  }

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

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateProgressUI() {
    if (!audio || !progressBar || !progressHandle) return;
    const pct = (audio.duration && isFinite(audio.duration)) ? (audio.currentTime / audio.duration) * 100 : 0;
    progressBar.style.width = pct + "%";
    progressHandle.style.left = pct + "%";
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

    progressContainer.addEventListener("click", (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = (e.clientX !== undefined) ? e.clientX - rect.left : e.touches && e.touches[0] ? e.touches[0].clientX - rect.left : 0;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = pct * audio.duration;
        updateProgressUI();
      }
    });

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
        const pct = rectToPct(ev.clientX);
        if (audio.duration && isFinite(audio.duration)) {
          audio.currentTime = pct * audio.duration;
        }
        if (progressHandle.releasePointerCapture) progressHandle.releasePointerCapture(ev.pointerId);
      });

      progressHandle.addEventListener("keydown", (ev) => {
        if (!audio || !audio.duration || !isFinite(audio.duration)) return;
        const step = Math.max(1, Math.floor(audio.duration * 0.02));
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

    backToTopBtn.addEventListener("touchstart", (e) => {
      e.currentTarget.blur();
    });

    backToTopBtn.addEventListener("click", (e) => {
      e.currentTarget.blur();

      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      window.scrollTo({
        top: 0,
        behavior: "auto",
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
            const folderNum = parseInt(poemParam);
            selectedPoem = poems.find(p => {
              const match = p.folder.match(/^(\d+)/);
              return match && parseInt(match[1]) === folderNum;
            });
          }
          selectedPoem = selectedPoem || poems[0];
          loadPoem(selectedPoem);
          const loadedIndex = poems.indexOf(selectedPoem);
          setActiveListItem('poemListItems', loadedIndex);
        }
      })
      .catch((err) => { });
  }

  function formatPoemTitle(filename) {
    let title = filename;
    if (filename.toLowerCase().endsWith(".mp3")) {
      title = title.replace(/\.mp3$/i, "");
    } else if (filename.toLowerCase().endsWith(".md")) {
      title = title.replace(/\.md$/i, "");
    }
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
      const currentYear = poem.date ? new Date(poem.date).getFullYear() : null;

      if (previousYear !== null && currentYear !== null && currentYear !== previousYear) {
        const separator = document.createElement("hr");
        separator.className = "year-separator";
        poemListItems.appendChild(separator);
      }
      previousYear = currentYear;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      let displayPoemTitle = formatPoemTitle(poem.name || poem.folder);
      displayPoemTitle = displayPoemTitle.replace(/^\s*\d+\s*[-\.]?\s*/, '').trim();
      const chronologicalIndex = poems.length - 1 - index;

      const titleSpan = document.createElement("span");
      titleSpan.className = "list-item-title";
      titleSpan.textContent = `${chronologicalIndex} - ${displayPoemTitle}`;

      a.appendChild(titleSpan);

      if (poem.date) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "list-item-date";
        const date = new Date(poem.date);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        dateSpan.textContent = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
        a.appendChild(dateSpan);
      }

      a.dataset.poem = JSON.stringify(poem);
      a.dataset.index = index;
      a.classList.add("poem-link");

      let preventNextClick = false;

      a.addEventListener('touchend', (e) => {
        if (!a.classList.contains('show-date') && poem.date) {
          e.preventDefault();
          e.stopPropagation();
          preventNextClick = true;

          document.querySelectorAll('.poem-link.show-date').forEach(link => {
            link.classList.remove('show-date');
          });
          a.classList.add('show-date');

          setTimeout(() => { preventNextClick = false; }, 100);
        }
      });

      li.appendChild(a);
      poemListItems.appendChild(li);
    });
    poemListItems.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();


        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice && window.innerWidth <= 800 && !link.classList.contains('show-date')) {
          return;
        }

        const index = link.dataset.index;
        const poem = JSON.parse(link.getAttribute("data-poem"));
        const currentPoemParam = getUrlParameter('poem');

        const folderMatch = poem.folder.match(/^(\d+)/);
        const folderNum = folderMatch ? folderMatch[1] : null;

        if (folderNum !== null && folderNum === currentPoemParam) {
          if (window.innerWidth <= 800) {
            closeSidebarAfterSelect();
            clearSidebarSearchInputs();
          }
          return;
        }

        loadPoem(poem);
        history.pushState({ poemIndex: index }, "", `?poem=${folderNum}`);
        clearSidebarSearchInputs();
        if (window.innerWidth <= 800) {
          closeSidebarAfterSelect();
        }
        setActiveListItem('poemListItems', parseInt(index, 10));
      });
    });

    setTimeout(() => addTruncatedTextOverlays(), 100);
  }

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
    window.scrollTo(0, 0);
    resetAudioPlayer();

    window.currentPoem = poem;

    if (window.readingModeManager) {
      window.readingModeManager.checkDynamicModeAvailable(poem);
    }

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

        let dateStr = null;
        md = md.replace(/^date:\s*(\d{4}-\d{2}(?:-\d{2})?)\s*$/m, (match, extractedDate) => {
          dateStr = extractedDate;
          return '';
        });


        md = md.replace(/^\s*---\s*$/m, '');

        // Custom parsing: convert lines to paragraphs, preserve blank lines as spacing
        const lines = md.split('\n');
        let html = '';
        let inParagraph = false;
        let inUnclosedTag = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          // Check for horizontal rule (---)
          if (trimmed === '---') {
            if (inParagraph) {
              html += '</p>';
              inParagraph = false;
            }
            html += '<hr>';
            inUnclosedTag = false;
          }
          // Check for markdown headings
          else if (/^#{1,6}\s/.test(trimmed)) {
            if (inParagraph) {
              html += '</p>';
              inParagraph = false;
            }
            // Convert markdown heading to HTML
            const level = trimmed.match(/^#{1,6}/)[0].length;
            const headingText = trimmed.replace(/^#{1,6}\s/, '');
            html += `<h${level}>${headingText}</h${level}>`;
            inUnclosedTag = false;
          }
          // Check if line is already HTML (starts with <)
          else if (trimmed.startsWith('<')) {
            // Check if it's a block-level HTML element (p, div, h1-h6, etc.)
            const isBlockElement = /^<(p|div|h[1-6]|ul|ol|li|blockquote|pre|hr|table)\b/i.test(trimmed);

            // Check if this line opens a tag without closing it
            const hasOpenTag = /<(\w+)[^>]*>/.test(trimmed);
            const hasCloseTag = /<\/\w+>/.test(trimmed);

            if (isBlockElement) {
              // Close current paragraph if open
              if (inParagraph) {
                html += '</p>';
                inParagraph = false;
              }
              // Add block element directly
              html += line + '\n';
              inUnclosedTag = false;
            } else {
              // Inline HTML element - keep in paragraph
              if (!inParagraph) {
                html += '<p>';
                inParagraph = true;
              } else if (!inUnclosedTag) {
                // Only add line break if we're not inside an unclosed tag
                html += '<br>';
              }

              // Process markdown syntax inside HTML tags
              let processedLine = line;
              // Check if there's markdown heading syntax inside the tag
              const headingMatch = processedLine.match(/^(<[^>]+>)(#{1,6}\s+)(.+?)(<\/[^>]+>)$/);
              if (headingMatch) {
                const [, openTag, hashes, content, closeTag] = headingMatch;
                const level = hashes.trim().length;
                processedLine = `${openTag}<h${level} style="display:inline">${content}</h${level}>${closeTag}`;
              }

              html += processedLine + '\n';

              // Track if we're inside an unclosed tag
              if (hasOpenTag && !hasCloseTag) {
                inUnclosedTag = true;
              } else if (hasCloseTag) {
                inUnclosedTag = false;
              }
            }
          }
          else if (trimmed === '') {
            // Blank line - close paragraph and add spacing
            if (inParagraph) {
              html += '</p>';
              inParagraph = false;
            }
            html += '<p class="blank-line"></p>';
            inUnclosedTag = false;
          }
          else {
            // Regular text line
            if (!inParagraph) {
              html += '<p>';
              inParagraph = true;
            } else if (!inUnclosedTag) {
              // Only add line break if we're not inside an unclosed tag
              html += '<br>';
            }
            // Process inline markdown (bold, italic, etc.)
            html += trimmed;
          }
        } if (inParagraph) {
          html += '</p>';
        }

        // Use marked only for inline formatting
        marked.setOptions({
          breaks: false,
          gfm: true
        });

        // Process each paragraph's content through marked for inline markdown
        let processedHtml = html.replace(/<p>(.*?)<\/p>/gs, (match, content) => {
          if (content.trim() === '' || content.includes('class="blank-line"')) {
            return match;
          }
          const processed = marked.parseInline(content);
          return '<p>' + processed + '</p>';
        });

        // Split content at second <hr> to separate poem from afterthoughts
        const firstHrIndex = processedHtml.indexOf('<hr>');
        if (firstHrIndex !== -1) {
          const remainingHtml = processedHtml.substring(firstHrIndex + 4);
          const secondHrIndex = remainingHtml.indexOf('<hr>');

          if (secondHrIndex !== -1) {
            const beforeSecondHr = processedHtml.substring(0, firstHrIndex + 4 + secondHrIndex + 4);
            const afterthoughtsPart = remainingHtml.substring(secondHrIndex + 4).trim();

            // Check if there's actual content (not just whitespace or empty paragraphs)
            const hasContent = afterthoughtsPart &&
              afterthoughtsPart.replace(/<p[^>]*>\s*<\/p>/g, '').trim() !== '';

            if (hasContent) {
              processedHtml = beforeSecondHr +
                '<div class="afterthoughts-toggle" onclick="window.toggleAfterthoughts(this)">▼</div>' +
                '<div class="afterthoughts-content hidden">' + afterthoughtsPart + '</div>';
            }
          }
        }

        poemText.innerHTML = processedHtml;

        if (dateStr && poemContent) {
          const existingDate = poemContent.querySelector('.poem-date');
          if (existingDate) {
            existingDate.remove();
          }

          const formatted = formatDate(dateStr);

          const dateElement = document.createElement('p');
          dateElement.className = 'poem-date';
          dateElement.textContent = formatted;

          poemContent.insertBefore(dateElement, poemContent.firstChild);
        }

        applyImageScaling(poemText);

        addTableDataLabels(poemText);

        attachLightboxEvents();

        if (window.tooltipManager) {
          window.tooltipManager.reinitialize(poem.folder, 'poems');
        }

        if (window.readingModeManager) {
          window.readingModeManager.checkTooltipsForPoem(poem.folder);
        }
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
        window.blogsCache = blogs;
        const target = document.getElementById("blogText");
        if (target) target.innerHTML = "Loading blog post...";
        buildBlogList(blogs);
        const blogParam = getUrlParameter("blog");
        if (blogs.length > 0) {
          let selectedBlog;
          if (blogParam !== null) {
            const folderNum = parseInt(blogParam);
            selectedBlog = blogs.find(b => {
              const match = b.folder.match(/^(\d+)/);
              return match && parseInt(match[1]) === folderNum;
            });
          }
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
      const currentYear = blog.date ? new Date(blog.date).getFullYear() : null;


      if (previousYear !== null && currentYear !== null && currentYear !== previousYear) {
        const separator = document.createElement("hr");
        separator.className = "year-separator";
        listEl.appendChild(separator);
      }
      previousYear = currentYear;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      let displayBlogTitle = (blog.title || formatBlogTitle(blog.folder)).toString();
      displayBlogTitle = displayBlogTitle.replace(/^\s*\d+\s*[-\.]?\s*/, '').trim();
      const chronologicalIndex = blogs.length - 1 - index;


      const titleSpan = document.createElement("span");
      titleSpan.className = "list-item-title";
      titleSpan.textContent = `${chronologicalIndex} - ${displayBlogTitle}`;

      a.appendChild(titleSpan);


      if (blog.date) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "list-item-date";
        const date = new Date(blog.date);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        dateSpan.textContent = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
        a.appendChild(dateSpan);
      }

      a.dataset.blog = JSON.stringify(blog);
      a.dataset.index = index;
      a.classList.add("blog-link");


      let preventNextClick = false;

      a.addEventListener('touchend', (e) => {

        if (!a.classList.contains('show-date') && blog.date) {
          e.preventDefault();
          e.stopPropagation();
          preventNextClick = true;


          document.querySelectorAll('.blog-link.show-date').forEach(link => {
            link.classList.remove('show-date');
          });

          a.classList.add('show-date');


          setTimeout(() => { preventNextClick = false; }, 100);
        }
      });

      li.appendChild(a);
      listEl.appendChild(li);
    });
    listEl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();


        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice && window.innerWidth <= 800 && !link.classList.contains('show-date')) {
          return;
        }

        const index = link.dataset.index;
        const blog = JSON.parse(link.getAttribute("data-blog"));
        const currentBlogParam = getUrlParameter('blog');


        const folderMatch = blog.folder.match(/^(\d+)/);
        const folderNum = folderMatch ? folderMatch[1] : null;


        if (folderNum !== null && folderNum === currentBlogParam) {

          if (window.innerWidth <= 800) {
            closeSidebarAfterSelect();
            clearSidebarSearchInputs();
          }

          return;
        }


        loadBlogPost(blog);
        history.pushState({ blogIndex: index }, "", `?blog=${folderNum}`);

        clearSidebarSearchInputs();

        if (window.innerWidth <= 800) {
          closeSidebarAfterSelect();
        }

        setActiveListItem('blogListItems', parseInt(index, 10));
      });
    });


    setTimeout(() => addTruncatedTextOverlays(), 100);


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

    title = title.replace(/(\d+)-/, "$1 - ");
    title = title.replace(/\b\w/g, (char) => char.toUpperCase());
    return title.trim();
  }

  function loadBlogPost(blog) {
    window.scrollTo(0, 0);
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

        let dateStr = null;
        md = md.replace(/^date:\s*(\d{4}-\d{2}(?:-\d{2})?)\s*$/m, (match, extractedDate) => {
          dateStr = extractedDate;
          return '';
        });


        md = md.replace(/^\s*---\s*$/m, '');


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
        target.innerHTML = dateHtml + marked.parse(md);
        try {
          wrapBlogSections(target);
        } catch (e) {
        }
        if (window.hljs) {
          hljs.highlightAll();
        }

        applyImageScaling(target);

        addTableDataLabels(target);

        setTimeout(() => {
          if (window.tooltipManager) {
            window.tooltipManager.reinitialize(blog.folder);
          }
          if (typeof handleAnchorHighlight === 'function') {
            handleAnchorHighlight();
          }
        }, 100);

        attachLightboxEvents();
        enableInternalAnchorScrolling(target);

        if (location.hash) {
          setTimeout(() => scrollToAnchor(location.hash), 50);
        }
      })
      .catch((err) => {
        target.innerHTML = "Failed to load blog post.";
      });
  }


  window.addEventListener("popstate", (event) => {

    closeAllDropdowns();


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

        setActiveListItem('blogListItems', blogIndex);
      }
    }
  });

  window.addEventListener("load", () => {
    initDropdownToggle();
    updateSidebarTop();
  });

  function updateFloatingToggleVisibility() {
    const ft = document.getElementById("sidebarFloatingToggle");
    if (!ft) return;
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
      ft.removeAttribute("aria-hidden");
    }
  }

  updateFloatingToggleVisibility();
  window.addEventListener("resize", updateFloatingToggleVisibility);
  window.addEventListener("orientationchange", updateFloatingToggleVisibility);
});

function toggleEmail() {
  const emailRow = document.getElementById("email-row");
  emailRow.style.display =
    emailRow.style.display === "none" ? "block" : "none";
}

function scrollToAnchor(hash) {
  if (!hash) return;
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const targetEl = document.getElementById(id);
  if (!targetEl) return;
  const banner = document.getElementById("banner-placeholder");
  const bannerHeight = banner ? banner.getBoundingClientRect().height : 0;
  targetEl.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
  requestAnimationFrame(() => {
    window.scrollBy(0, -Math.ceil(bannerHeight) - 8);
  });
}

function enableInternalAnchorScrolling(container) {
  if (!container) return;
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
      scrollToAnchor(hash);
      try {
        history.pushState({ anchor: id }, "", hash);
      } catch (err) {
      }
      if (typeof handleAnchorHighlight === 'function') {
        setTimeout(handleAnchorHighlight, 30);
      }
    }
  };
  container.addEventListener("click", container._delegatedAnchorHandler);
}

window.addEventListener("hashchange", () => {
  scrollToAnchor(location.hash);
});

function closeSidebarAfterSelect() {
  const poemList = document.getElementById("poemList");
  const blogList = document.getElementById("blogList");
  const floatingToggle = document.getElementById("sidebarFloatingToggle");
  if (window.innerWidth <= 800) {
    if (poemList) poemList.classList.remove("show");
    if (blogList) blogList.classList.remove("show");
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
    if (floatingToggle) floatingToggle.classList.remove("hidden");
    clearSidebarSearchInputs();
  }
}

function clearSidebarSearchInputs() {
  const blogSearch = document.getElementById('blogSearch');
  const poemSearch = document.getElementById('poemSearch');
  [blogSearch, poemSearch].forEach((input) => {
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  document.querySelectorAll('.poem-link.show-date, .blog-link.show-date').forEach(link => {
    link.classList.remove('show-date');
  });
}

function updateNoResultsMessage(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const items = Array.from(list.querySelectorAll('li')).filter(li => !li.classList.contains('no-results'));
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

    window.addEventListener('scroll', () => {
      const isMobile = window.innerWidth <= 800;
      const hasAudio = this.tooltip && this.tooltip.classList.contains('has-audio');

      if (isMobile || hasAudio) {
        return;
      }

      if (this.tooltip && this.currentTrigger) {
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
          this.positionTooltipAtTrigger(this.tooltip, this.currentTrigger, tooltipData, null);
        }
      }
    });
  }

  stopAllOtherAudio(currentAudio) {
    this.allAudioElements.forEach(audio => {
      if (audio !== currentAudio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    this.audioPlaying = currentAudio && !currentAudio.paused;
  }

  async loadTooltipData(folder, contentType = 'blogs') {
    const tooltipPath = `${contentType}/${folder}/res/tooltips.json`;

    try {
      const response = await fetch(tooltipPath);

      if (response.ok) {
        const data = await response.json();

        Object.entries(data).forEach(([id, tooltipData]) => {
          if (tooltipData.media && !tooltipData.media.startsWith('blogs/') && !tooltipData.media.startsWith('poems/') && !tooltipData.media.startsWith('http')) {
            tooltipData.media = `${contentType}/${folder}/res/${tooltipData.media}`;
          }
          this.tooltipData.set(id, tooltipData);

        });

      } else {

      }
    } catch (error) {

    }
  }

  detectBlogFolder() {
    const urlParams = new URLSearchParams(window.location.search);
    const blogIndex = urlParams.get('blog');

    if (blogIndex !== null && window.blogsCache && window.blogsCache[blogIndex]) {
      const folder = window.blogsCache[blogIndex].folder;

      return folder;
    }

    return null;
  }

  showTooltip(trigger, data, mouseX = null) {
    document.querySelectorAll('.tooltip.show').forEach(tip => {
      tip.classList.remove('show');
      setTimeout(() => {
        if (tip.parentNode) tip.parentNode.removeChild(tip);
      }, 300);
    });
    this.hideActiveTooltip();

    const tooltip = this.createTooltip(data);

    const mediaImg = tooltip.querySelector('.tooltip-gif');
    if (mediaImg && data.media) {
      const originalSrc = data.media;
      mediaImg.src = originalSrc + '?t=' + Date.now();
    }

    const blogContainer = document.getElementById('blog-container');
    const container = blogContainer || document.body;
    container.appendChild(tooltip);

    this.positionTooltipAtTrigger(tooltip, trigger, data, mouseX);

    tooltip.offsetHeight;

    if (this.overlay) {
      this.overlay.classList.add('show');
    }

    tooltip.classList.add('show');

    trigger.classList.add('active');

    if (data.media && (data.media.endsWith('.jpg') || data.media.endsWith('.jpeg') ||
      data.media.endsWith('.png') || data.media.endsWith('.gif') ||
      data.media.endsWith('.webp'))) {

      const imageWrapper = tooltip.querySelector('.tooltip-image-wrapper');
      const image = tooltip.querySelector('.tooltip-gif');
      if (imageWrapper) imageWrapper.classList.add('clickable');
      if (image) {
        image.classList.add('clickable');
        image.style.cursor = 'pointer';

        image.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hideActiveTooltip();
          this.showImageFullscreen(data.media, data.alt || data.text, data);
        });
      }
    }

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

  createTooltip(data) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    const content = document.createElement('div');
    content.className = 'tooltip-content';

    if (!data) {
      console.warn('Tooltip data is null or undefined');
      tooltip.appendChild(content);
      return tooltip;
    }

    if (data.text) {
      const text = document.createElement('div');
      text.className = 'tooltip-text';
      let formattedText = data.text
        .replace(/<bold>/g, '<strong>')
        .replace(/<\/bold>/g, '</strong>')
        .replace(/<italics>/g, '<em>')
        .replace(/<\/italics>/g, '</em>')
        .replace(/\n/g, '<br>');

      text.innerHTML = formattedText;
      content.appendChild(text);
    }

    if (data.media) {
      if (data.media.endsWith('.mp3') || data.media.endsWith('.wav') || data.media.endsWith('.ogg')) {
        tooltip.classList.add('has-audio');
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

        this.allAudioElements.add(audioElement);
        this.activeTooltipAudio = audioElement;

        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

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
        audioPlayer.appendChild(audioElement);
        content.appendChild(audioPlayer);

        this.currentAudio = audioElement;
      } else {

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'tooltip-image-wrapper';

        const mediaEl = document.createElement('img');
        mediaEl.className = 'tooltip-gif';
        mediaEl.src = data.media;
        mediaEl.alt = data.text || 'Tooltip media';
        mediaEl.onerror = () => { };

        imageWrapper.appendChild(mediaEl);
        content.appendChild(imageWrapper);


        if (data.alt) {
          const altText = document.createElement('div');
          altText.className = 'tooltip-alt';
          altText.style.fontStyle = 'italic';
          altText.style.marginTop = '8px';
          altText.style.fontSize = '0.9em';
          altText.style.textAlign = 'center';
          altText.innerHTML = data.alt;
          content.appendChild(altText);
        }
      }
    }

    tooltip.appendChild(content);
    return tooltip;
  }


  initializeTooltips() {
    const triggers = document.querySelectorAll('[data-tooltip], [tt]');


    this.tooltipDimensions.clear();

    triggers.forEach(trigger => {
      this.setupTooltip(trigger);

      this.precalculateTooltipDimensions(trigger);
    });
  }


  precalculateTooltipDimensions(element) {
    const tooltipId = element.getAttribute('tt');
    let tooltipData;

    if (tooltipId) {
      tooltipData = this.tooltipData.get(tooltipId);
      if (!tooltipData) {
        console.warn(`Missing tooltip data for: "${tooltipId}"`);
        return;
      }
    } else {
      try {
        tooltipData = JSON.parse(element.getAttribute('data-tooltip'));
      } catch (e) {
        console.warn('Failed to parse data-tooltip attribute:', e);
        return;
      }
      if (!tooltipData) {
        return;
      }
    }

    const dataKey = JSON.stringify(tooltipData);


    if (this.tooltipDimensions.has(dataKey)) {
      return;
    }


    const tempTooltip = this.createTooltip(tooltipData);
    tempTooltip.style.position = 'absolute';
    tempTooltip.style.left = '-9999px';
    tempTooltip.style.top = '-9999px';
    tempTooltip.style.visibility = 'hidden';
    document.body.appendChild(tempTooltip);


    const gifImg = tempTooltip.querySelector('.tooltip-gif');

    const measureAndStore = () => {

      tempTooltip.offsetHeight;


      const rect = tempTooltip.getBoundingClientRect();
      this.tooltipDimensions.set(dataKey, {
        width: rect.width,
        height: rect.height
      });


      document.body.removeChild(tempTooltip);

    };

    if (gifImg) {

      if (gifImg.complete) {
        measureAndStore();
      } else {
        gifImg.onload = measureAndStore;
        gifImg.onerror = measureAndStore;
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
    element.removeEventListener('click', element._tooltipClick);

    element._tooltipMouseEnter = (e) => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }

      if (this.tooltip && this.currentTrigger === element) {
        return;
      }


      const mouseX = e.clientX;
      element._tooltipTimeout = setTimeout(() => {
        this.showTooltip(element, tooltipData, mouseX);
      }, this.showDelay);
    };

    element._tooltipMouseLeave = (e) => {
      const relatedTarget = e.relatedTarget;


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


      if (element._justClicked) {
        return;
      }

      this.hideTimeout = setTimeout(() => {
        if (!this.audioPlaying) {
          this.hideActiveTooltip();
        }
      }, this.hideDelay);
    };


    element._tooltipClick = (e) => {

      element._justClicked = true;


      setTimeout(() => {
        element._justClicked = false;
      }, 500);


      if (this.tooltip && this.currentTrigger === element) {
        return;
      }


      if (element._tooltipTimeout) {
        clearTimeout(element._tooltipTimeout);
        element._tooltipTimeout = null;
      }


      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }


      this.showTooltip(element, tooltipData, e.clientX);
    };

    element.addEventListener('mouseenter', element._tooltipMouseEnter);
    element.addEventListener('mouseleave', element._tooltipMouseLeave);
    element.addEventListener('click', element._tooltipClick);
  }


  positionTooltipAtTrigger(tooltip, trigger, data, mouseX = null) {
    const dataKey = JSON.stringify(data);


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


    const triggerRect = trigger.getBoundingClientRect();


    const range = document.createRange();
    range.selectNodeContents(trigger);
    const rects = range.getClientRects();
    let topLineRect = triggerRect;
    let bottomLineRect = triggerRect;
    if (rects.length > 0) {
      topLineRect = rects[0];
      bottomLineRect = rects[rects.length - 1];
    }


    let sidebarWidth = 0;
    const isMobile = window.innerWidth <= 800;

    if (!isMobile) {
      const blogList = document.querySelector('.blog-list');
      const poemList = document.querySelector('.poem-list');
      const sidebar = blogList || poemList;
      if (sidebar && !sidebar.classList.contains('show')) {
        const sidebarRect = sidebar.getBoundingClientRect();

        if (sidebarRect.left === 0 && sidebarRect.width > 0) {
          sidebarWidth = sidebarRect.width;
        }
      }
    }


    const margin = isMobile ? 8 : 10;
    const leftBoundary = sidebarWidth + margin;
    const rightBoundary = window.innerWidth - margin;


    let left;
    if (mouseX !== null && mouseX !== undefined) {

      left = mouseX - (tooltipWidth / 2);
    } else {

      left = topLineRect.left + (topLineRect.width / 2) - (tooltipWidth / 2);
    }


    let top;
    const spaceAbove = topLineRect.top;
    const spaceBelow = window.innerHeight - bottomLineRect.bottom;
    const requiredSpace = tooltipHeight + this.verticalOffset + margin;


    const hasAudio = tooltip.classList.contains('has-audio');


    const useAbsolutePosition = isMobile || hasAudio;

    if (useAbsolutePosition) {

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;


      if (spaceAbove >= requiredSpace || spaceAbove > spaceBelow) {

        top = topLineRect.top + scrollTop - tooltipHeight - this.verticalOffset;
        tooltip.classList.remove('bottom');
      } else {

        top = bottomLineRect.bottom + scrollTop + this.verticalOffset;
        tooltip.classList.add('bottom');
      }

      left = left + scrollLeft;
    } else {


      if (spaceAbove >= requiredSpace || spaceAbove > spaceBelow) {

        top = topLineRect.top - tooltipHeight - this.verticalOffset;
        tooltip.classList.remove('bottom');
      } else {

        top = bottomLineRect.bottom + this.verticalOffset;
        tooltip.classList.add('bottom');
      }
    }


    if (left < leftBoundary) left = leftBoundary;
    if (left + tooltipWidth > rightBoundary) {
      left = rightBoundary - tooltipWidth;
    }


    if (isMobile) {
      const maxTooltipWidth = window.innerWidth - (margin * 2);
      if (tooltipWidth > maxTooltipWidth) {
        tooltip.style.maxWidth = maxTooltipWidth + 'px';
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        left = margin + scrollLeft;
      }
    }


    if (!useAbsolutePosition) {
      if (top + tooltipHeight > window.innerHeight - margin) {
        top = window.innerHeight - tooltipHeight - margin;
      }

      if (top < margin) {
        top = margin;
      }
    }

    tooltip.style.position = useAbsolutePosition ? 'absolute' : 'fixed';
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.right = '';
    if (!isMobile) {
      tooltip.style.width = '';
    }
  }

  hideActiveTooltip() {
    if (this.tooltip) {
      if (this.currentTrigger) {
        this.currentTrigger.classList.remove('active');
      }

      if (this.activeTooltipAudio && !this.activeTooltipAudio.paused) {
        this.activeTooltipAudio.pause();
        this.activeTooltipAudio.currentTime = 0;
        this.audioPlaying = false;
      }

      this.tooltip.classList.remove('show');

      if (this.overlay) {
        this.overlay.classList.remove('show');
      }

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

  async reinitialize(folder, contentType = 'blogs') {

    const actualFolder = folder || this.detectBlogFolder();

    if (actualFolder) {
      await this.loadTooltipData(actualFolder, contentType);

    } else {

    }

    this.initializeTooltips();
  }

  showImageFullscreen(imageSrc, altText, tooltipData) {
    const overlay = document.createElement('div');
    overlay.className = 'tooltip-fullscreen-overlay';

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'tooltip-loading-spinner';
    overlay.appendChild(loadingSpinner);

    const zoomedTooltip = document.createElement('div');
    zoomedTooltip.className = 'tooltip-zoomed';

    if (tooltipData && tooltipData.text) {
      const text = document.createElement('div');
      text.className = 'tooltip-zoomed-text';
      let formattedText = tooltipData.text
        .replace(/<bold>/g, '<strong>')
        .replace(/<\/bold>/g, '</strong>')
        .replace(/<italics>/g, '<em>')
        .replace(/<\/italics>/g, '</em>')
        .replace(/\n/g, '<br>');
      text.innerHTML = formattedText;
      zoomedTooltip.appendChild(text);
    }

    if (imageSrc) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'tooltip-zoomed-image-container';

      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = altText || '';
      img.className = 'tooltip-zoomed-image';

      img.onload = () => {
        loadingSpinner.style.display = 'none';
      };

      img.onerror = () => {
        loadingSpinner.style.display = 'none';
      };

      imageContainer.appendChild(img);
      zoomedTooltip.appendChild(imageContainer);

      if (tooltipData && tooltipData.alt) {
        const altTextEl = document.createElement('div');
        altTextEl.className = 'tooltip-zoomed-alt';
        altTextEl.style.fontStyle = 'italic';
        altTextEl.style.marginTop = '12px';
        altTextEl.style.fontSize = '0.95em';
        altTextEl.style.textAlign = 'center';
        altTextEl.innerHTML = tooltipData.alt;
        zoomedTooltip.appendChild(altTextEl);
      }
    }

    if (tooltipData && tooltipData.credit) {
      const creditEl = document.createElement('div');
      creditEl.className = 'tooltip-zoomed-credit';
      creditEl.style.fontStyle = 'italic';
      creditEl.style.fontSize = '0.85em';
      creditEl.style.marginTop = 'auto';
      creditEl.style.textAlign = 'left';
      creditEl.style.opacity = '0.7';
      creditEl.innerHTML = tooltipData.credit;
      zoomedTooltip.appendChild(creditEl);
    }

    const closeFullscreen = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escHandler);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeFullscreen();
      }
    });

    zoomedTooltip.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      }
    };
    document.addEventListener('keydown', escHandler);

    overlay.appendChild(zoomedTooltip);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }
}

function initHomePage() {
  let headerLoaded = false;
  let bannerLoaded = false;

  function adjustThemeTogglePosition() {
    requestAnimationFrame(() => {
      const banner = document.getElementById("banner-placeholder");
      const themeToggle = document.getElementById("themeToggle");
      if (banner && themeToggle) {
        const bannerRect = banner.getBoundingClientRect();
        const bannerBottom = Math.max(0, bannerRect.bottom);
        themeToggle.style.top = `${bannerBottom + 10}px`;
        themeToggle.classList.add("positioned");

        adjustModeControlsPosition();
      }
    });
  }

  function adjustModeControlsPosition() {
    requestAnimationFrame(() => {
      const themeToggle = document.getElementById("themeToggle");
      const modeControls = document.getElementById("readingModeControls");

      if (themeToggle && modeControls) {
        const themeRect = themeToggle.getBoundingClientRect();
        const themeBottom = themeRect.bottom;
        modeControls.style.top = `${themeBottom + 8}px`;
      }
    });
  }

  window.adjustModeControlsPosition = adjustModeControlsPosition;

  function checkAndPositionThemeToggle() {
    if (headerLoaded && bannerLoaded) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          adjustThemeTogglePosition();
        });
      });
    }
  }

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

  fetch("src/header.html")
    .then(response => response.text())
    .then(data => {
      const header = document.getElementById("header-placeholder");
      header.innerHTML = data;
      waitForHeaderImages();
    })
    .catch(error => { });

  fetch("src/banner.html")
    .then(response => response.text())
    .then(data => {
      const banner = document.getElementById("banner-placeholder");
      banner.innerHTML = data;
      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }
      bannerLoaded = true;
      checkAndPositionThemeToggle();
    })
    .catch(error => { });

  window.addEventListener("scroll", adjustThemeTogglePosition);
  window.addEventListener("touchmove", adjustThemeTogglePosition, { passive: true });

  window.addEventListener("load", adjustThemeTogglePosition);

  window.addEventListener("resize", () => {
    adjustThemeTogglePosition();
  });

  loadHistory();

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

function formatDate(dateString) {
  const parts = dateString.split('-');

  if (parts.length === 2) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const date = new Date(Date.UTC(year, month, 1));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
  } else if (parts.length === 3) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  return dateString;
}

function initBlogPage() {
  fetch("banner.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("banner-placeholder").innerHTML = data;


      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }

      adjustSidebarHeight();
    })
    .catch((error) => { });

  function adjustSidebarHeight() {
    requestAnimationFrame(() => {
      const banner = document.getElementById("banner-placeholder");
      const blogList = document.getElementById("blogList");
      const mobileToggle = document.getElementById("sidebarFloatingToggle");
      if (banner && blogList) {
        const bannerRect = banner.getBoundingClientRect();

        const bannerBottom = Math.max(0, bannerRect.bottom);

        blogList.style.top = `${bannerBottom}px`;
        blogList.style.height = `calc(100vh - ${bannerBottom}px)`;


        if (mobileToggle) {
          mobileToggle.style.top = `${bannerBottom}px`;
        }


        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
          themeToggle.style.top = `${bannerBottom + 10}px`;
          themeToggle.classList.add("positioned");
        }
      }
    });
  }


  function setInitialSidebarState() {
    const blogList = document.getElementById("blogList");
    const floatingToggle = document.getElementById("sidebarFloatingToggle");
    if (!blogList) return;

    if (window.innerWidth <= 800) {

      blogList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "block";
        floatingToggle.classList.remove("hidden");
      }
    } else {

      blogList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "none";
      }
    }
  }


  const toggleBlogList = document.getElementById("toggleBlogList");
  if (toggleBlogList) {
    toggleBlogList.addEventListener("click", (e) => {
      e.stopPropagation();
      const blogList = document.getElementById("blogList");
      if (window.innerWidth <= 800) {

        const isOpen = blogList.classList.toggle("show");
        document.body.classList.toggle("no-scroll", isOpen);
        document.documentElement.classList.toggle("no-scroll", isOpen);
        const floatingToggle = document.getElementById("sidebarFloatingToggle");
        if (floatingToggle) floatingToggle.classList.toggle("hidden", isOpen);

        if (!isOpen) clearSidebarSearchInputs();
      } else {

        blogList.classList.toggle("collapsed");
        const contentWrapper = document.querySelector(".content-scale-wrapper");
        if (contentWrapper) {
          contentWrapper.classList.toggle("sidebar-collapsed", blogList.classList.contains("collapsed"));
        }

        if (blogList.classList.contains("collapsed")) clearSidebarSearchInputs();
      }
    });
  }


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


  let lastWidth = window.innerWidth;
  window.addEventListener("load", () => {
    setInitialSidebarState();
    adjustSidebarHeight();
    lastWidth = window.innerWidth;


    setTimeout(() => {
      const ecuElement = document.querySelector('[data-tooltip="ecu"]');
      if (ecuElement && window.tooltipManager) {
        const tooltipData = window.tooltipManager.tooltips.get('ecu');
        if (tooltipData) {
          window.tooltipManager.showTooltip(ecuElement, tooltipData);
        }
      }
    }, 1000);
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


  const blogSearch = document.getElementById("blogSearch");
  if (blogSearch) {
    blogSearch.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll("#blogListItems li").forEach((item) => {

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

  fetch("banner.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("banner-placeholder").innerHTML = data;


      if (typeof initDropdownToggle === "function") {
        initDropdownToggle();
      }


      adjustSidebarHeight();
    })
    .catch((error) => { });


  function adjustSidebarHeight() {
    requestAnimationFrame(() => {
      const banner = document.getElementById("banner-placeholder");
      const poemList = document.getElementById("poemList");
      const mobileToggle = document.getElementById("sidebarFloatingToggle");
      if (banner && poemList) {
        const bannerRect = banner.getBoundingClientRect();


        const bannerBottom = Math.max(0, bannerRect.bottom);


        poemList.style.top = `${bannerBottom}px`;
        poemList.style.height = `calc(100vh - ${bannerBottom}px)`;


        if (mobileToggle) {
          mobileToggle.style.top = `${bannerBottom}px`;
        }


        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
          themeToggle.style.top = `${bannerBottom + 10}px`;
          themeToggle.classList.add("positioned");


          const modeControls = document.getElementById("readingModeControls");
          if (modeControls) {
            const themeRect = themeToggle.getBoundingClientRect();
            const themeBottom = themeRect.bottom;
            modeControls.style.top = `${themeBottom + 8}px`;
          }
        }
      }
    });
  }


  function setInitialSidebarState() {
    const poemList = document.getElementById("poemList");
    const floatingToggle = document.getElementById("sidebarFloatingToggle");
    if (!poemList) return;

    if (window.innerWidth <= 800) {

      poemList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "block";
        floatingToggle.classList.remove("hidden");
      }
    } else {

      poemList.classList.remove("show");
      if (floatingToggle) {
        floatingToggle.style.display = "none";
      }
    }
  }


  const toggleSidebar = document.getElementById("toggleSidebar");
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", (e) => {
      e.stopPropagation();
      const poemList = document.getElementById("poemList");
      if (window.innerWidth <= 800) {

        const isOpen = poemList.classList.toggle("show");
        document.body.classList.toggle("no-scroll", isOpen);
        document.documentElement.classList.toggle("no-scroll", isOpen);
        const floatingToggle = document.getElementById("sidebarFloatingToggle");
        if (floatingToggle) floatingToggle.classList.toggle("hidden", isOpen);

        if (!isOpen) clearSidebarSearchInputs();
      } else {

        poemList.classList.toggle("collapsed");
        const contentWrapper = document.querySelector(".content-scale-wrapper");
        if (contentWrapper) {
          contentWrapper.classList.toggle("sidebar-collapsed", poemList.classList.contains("collapsed"));
        }

        if (poemList.classList.contains("collapsed")) clearSidebarSearchInputs();
      }
    });
  }


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


  let lastWidth = window.innerWidth;
  window.addEventListener("load", () => {
    setInitialSidebarState();
    adjustSidebarHeight();
    lastWidth = window.innerWidth;
  });
  window.addEventListener("scroll", adjustSidebarHeight);
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


  const poemSearch = document.getElementById("poemSearch");
  if (poemSearch) {
    poemSearch.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll("#poemListItems li").forEach((item) => {

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

  setTimeout(initOverviewSlideshow, 0);
}

function initShowcaseSlideshow() {
  const MANIFEST = 'src/resources/images/overview/overview_manifest.json';
  const container = document.getElementById('image-showcase-container');
  if (!container) return;

  let images = [];
  let current = 0;
  let animating = false;
  let autoTimer = null;

  function render() {
    if (!images || images.length === 0) return;
    const isMobile = window.innerWidth <= 799;

    const window1 = container.querySelector('.showcase-window-1');
    const window2 = container.querySelector('.showcase-window-2');
    if (!window1) return;


    window1.innerHTML = '';
    if (window2) window2.innerHTML = '';


    const img1 = document.createElement('img');
    img1.className = 'showcase-img contain click-zoom';
    img1.src = images[current];
    img1.alt = `Overview image ${current + 1}`;
    img1.style.cursor = 'zoom-in';
    img1.style.pointerEvents = 'auto';
    img1.addEventListener('click', () => openImageFullscreen(img1.src, img1.alt));
    window1.appendChild(img1);


    if (!isMobile && window2) {
      const img2 = document.createElement('img');
      img2.className = 'showcase-img contain click-zoom';
      img2.src = images[(current + 1) % images.length];
      img2.alt = `Overview image ${(current + 2)}`;
      img2.style.cursor = 'zoom-in';
      img2.style.pointerEvents = 'auto';
      img2.addEventListener('click', () => openImageFullscreen(img2.src, img2.alt));
      window2.appendChild(img2);
    }
  }

  function next() {
    if (animating) return;
    animating = true;

    const isMobile = window.innerWidth <= 799;
    const window1 = container.querySelector('.showcase-window-1');
    const window2 = container.querySelector('.showcase-window-2');

    if (isMobile || !window2) {

      current = (current + 1) % images.length;
      render();
      animating = false;
      return;
    }


    const img1 = window1.querySelector('img');
    const img2 = window2.querySelector('img');
    if (!img1 || !img2) { animating = false; return; }


    const window1Rect = window1.getBoundingClientRect();
    const window2Rect = window2.getBoundingClientRect();
    const slideDistance = window2Rect.left - window1Rect.left;


    img1.style.transition = 'opacity 0.45s';
    img1.style.opacity = '0';
    window2.style.transition = 'transform 0.45s cubic-bezier(.4, 0, .2, 1)';
    window2.style.transform = `translateX(-${slideDistance}px)`;

    setTimeout(() => {

      img1.src = img2.src;
      img1.alt = img2.alt;
      img1.style.opacity = '1';
      img1.style.transition = 'none';
      img1.style.borderRadius = '12px';


      const nextIdx = (current + 2) % images.length;
      img2.style.opacity = '0';
      img2.src = images[nextIdx];
      img2.alt = `Overview image ${nextIdx + 1}`;

      img2.onload = () => { img2.style.opacity = '1'; };
      window2.style.transform = 'translateX(0)';
      window2.style.transition = 'none';

      current = (current + 1) % images.length;
      animating = false;
    }, 470);
  }

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer);

    const interval = window.innerWidth <= 799 ? 2000 : 3000;
    autoTimer = setInterval(next, interval);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }


  fetch(MANIFEST).then(r => r.json()).then(list => {
    if (!Array.isArray(list) || list.length === 0) return;
    images = list.map(n => 'src/resources/images/overview/' + encodeURIComponent(n).replace(/%2F/g, '/'));
    render();
    startAuto();
  }).catch(() => {

  });

  window.addEventListener('resize', () => {
    render();
  });
}

function initOverviewSlideshow() {
  const MANIFEST = 'src/resources/images/overview/overview_manifest.json';
  const container = document.querySelector('#overview-slideshow .slideshow-images');
  const prevBtn = document.querySelector('#overview-slideshow .slideshow-prev');
  const nextBtn = document.querySelector('#overview-slideshow .slideshow-next');
  if (!container) return;

  let images = [];
  let current = 0;
  let animating = false;
  let autoTimer = null;

  function readCSSVar(name, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return val ? parseInt(val.trim(), 10) : fallback;
  }

  function computeSizing(isVertical) {
    const isMobile = window.innerWidth <= 800;
    const styles = getComputedStyle(document.documentElement);
    const cssMaxHeight = readCSSVar('--slideshow-max-height', 480);

    const wVar = isVertical ? (isMobile ? '--slideshow-mobile-vertical-width' : '--slideshow-vertical-width') : (isMobile ? '--slideshow-mobile-horizontal-width' : '--slideshow-horizontal-width');
    const hVar = isVertical ? (isMobile ? '--slideshow-mobile-vertical-height' : '--slideshow-vertical-height') : (isMobile ? '--slideshow-mobile-horizontal-height' : '--slideshow-horizontal-height');

    const orientationW = readCSSVar(wVar, isVertical ? 320 : 420);
    const orientationH = readCSSVar(hVar, isVertical ? 480 : 260);

    const historyEl = document.getElementById('historySection');
    const halfHistory = historyEl ? Math.floor(historyEl.clientWidth / 2) : Math.floor(document.documentElement.clientWidth / 2);

    const finalWidth = Math.min(orientationW, halfHistory);
    const finalHeight = Math.min(orientationH, cssMaxHeight);
    return { width: finalWidth, height: finalHeight };
  }

  function applySizingForImage(imgEl) {
    const isVertical = imgEl.naturalHeight >= imgEl.naturalWidth;
    const sizing = computeSizing(isVertical);

    container.style.width = sizing.width + 'px';
    container.style.height = sizing.height + 'px';

    container.querySelectorAll('.slideshow-img').forEach((ie) => {
      ie.classList.add('contain');
      ie.classList.remove('cover');

      ie.style.width = '';
      ie.style.height = '';
    });
  }

  function render() {
    if (!images || images.length === 0) return;
    container.innerHTML = '';
    if (window.innerWidth < 800) {
      const img = document.createElement('img');
      img.className = 'slideshow-img contain click-zoom';
      img.src = images[current];
      img.alt = `Overview image ${current + 1}`;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openImageFullscreen(img.src, img.alt));
      img.addEventListener('load', () => applySizingForImage(img));
      container.appendChild(img);
    } else {
      const div1 = document.createElement('div');
      div1.className = 'slideshow-image1';
      const img1 = document.createElement('img');
      img1.className = 'slideshow-img contain click-zoom';
      img1.src = images[current];
      img1.alt = `Overview image ${current + 1}`;
      img1.style.cursor = 'zoom-in';
      img1.addEventListener('click', () => openImageFullscreen(img1.src, img1.alt));
      div1.appendChild(img1);

      const div2 = document.createElement('div');
      div2.className = 'slideshow-image2';
      const img2 = document.createElement('img');
      img2.className = 'slideshow-img contain click-zoom';
      img2.src = images[(current + 1) % images.length];
      img2.alt = `Overview image ${(current + 2)}`;
      img2.style.cursor = 'zoom-in';
      img2.addEventListener('click', () => openImageFullscreen(img2.src, img2.alt));
      div2.appendChild(img2);

      container.appendChild(div1);
      container.appendChild(div2);

      img1.addEventListener('load', () => applySizingForImage(img1));
      img2.addEventListener('load', () => applySizingForImage(img1));
      if (img1.complete && img1.naturalWidth) applySizingForImage(img1);
    }
  }

  function next() {
    if (animating) return;
    animating = true;
    if (window.innerWidth < 800) {
      current = (current + 1) % images.length;
      render();
      animating = false;
      return;
    }
    const div1 = container.querySelector('.slideshow-image1');
    const div2 = container.querySelector('.slideshow-image2');
    if (!div1 || !div2) { animating = false; return; }
    div1.classList.add('fade-out-in-place');
    div2.classList.add('slide-left-overlap');
    setTimeout(() => {
      const img1 = div1.querySelector('img');
      const img2 = div2.querySelector('img');
      img1.src = img2.src;
      img1.alt = img2.alt;
      div1.classList.remove('fade-out-in-place');
      const nextIdx = (current + 2) % images.length;
      img2.src = images[nextIdx];
      img2.alt = `Overview image ${nextIdx + 1}`;
      div2.classList.remove('slide-left-overlap');
      div2.classList.add('fade-in-on-right');
      setTimeout(() => {
        div2.classList.remove('fade-in-on-right');
        animating = false;
        current = (current + 1) % images.length;
      }, 470);
    }, 470);
  }

  function prev() {
    if (animating) return;
    animating = true;
    current = (current - 1 + images.length) % images.length;
    render();
    animating = false;
  }

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(next, 4000);
  }

  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }


  fetch(MANIFEST).then(r => r.json()).then(list => {
    if (!Array.isArray(list) || list.length === 0) return;
    images = list.map(n => 'src/resources/images/overview/' + encodeURIComponent(n).replace(/%2F/g, '/'));
    render();
    startAuto();
  }).catch(() => {

  });

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); stopAuto(); prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); stopAuto(); next(); startAuto(); });

  window.addEventListener('resize', () => {

    const firstImg = container.querySelector('.slideshow-img');
    if (firstImg) applySizingForImage(firstImg);
  });
}

function openImageFullscreen(src, alt) {

  const oldOverlay = document.getElementById('fullscreen-image-overlay');
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement('div');
  overlay.id = 'fullscreen-image-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.95)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 99999;
  overlay.style.cursor = 'zoom-out';

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  img.style.maxWidth = '95vw';
  img.style.maxHeight = '95vh';
  img.style.boxShadow = '0 0 32px #000a';
  img.style.borderRadius = '8px';
  img.style.background = '#222';

  overlay.appendChild(img);


  overlay.addEventListener('click', () => overlay.remove());
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.body.appendChild(overlay);
}

function handleAnchorHighlight() {
  const hash = window.location.hash;
  if (hash) {
    const targetElement = document.querySelector(hash);
    if (targetElement) {

      const id = targetElement.id;
      let highlightEl = null;


      if (targetElement.matches('h1, h2, h3, h4, h5, h6')) {
        const block = targetElement.closest('.anchor-block') || (id ? document.querySelector(`.anchor-block[data-anchor-id='${CSS.escape(id)}']`) : null);
        highlightEl = block || targetElement;
      } else if (targetElement.matches('div, section, article, aside') && targetElement.id) {

        highlightEl = targetElement;
      } else {

        const nearestLi = targetElement.closest('li');
        const nearestBlock = targetElement.closest('p, pre, blockquote, table, dl, ol, ul, .image-wrapper, .pdf-placeholder, .video-player');
        if (nearestLi) {
          highlightEl = nearestLi;
        } else if (nearestBlock) {

          if (nearestBlock.tagName && (nearestBlock.tagName.toLowerCase() === 'ul' || nearestBlock.tagName.toLowerCase() === 'ol')) {

            const block = targetElement.closest('.anchor-block') || (id ? document.querySelector(`.anchor-block[data-anchor-id='${CSS.escape(id)}']`) : null);
            highlightEl = block || targetElement;
          } else {
            highlightEl = nearestBlock;
          }
        } else {
          const block = targetElement.closest('.anchor-block') || (id ? document.querySelector(`.anchor-block[data-anchor-id='${CSS.escape(id)}']`) : null);
          highlightEl = block || targetElement;
        }
      }


      highlightEl.classList.remove('anchor-highlight');


      void highlightEl.offsetWidth;


      highlightEl.classList.add('anchor-highlight');
      setTimeout(() => {
        highlightEl.classList.remove('anchor-highlight');
      }, 2000);
    }
  }
}

function wrapBlogSections(root) {
  if (!root) return;
  const headingSelector = 'h1, h2, h3, h4, h5, h6';
  const nodes = Array.from(root.childNodes);
  let currentBlock = null;
  nodes.forEach((node) => {
    if (node.nodeType === 1 && node.matches(headingSelector)) {

      const block = document.createElement('div');
      block.className = 'anchor-block';
      const hid = node.id;
      if (hid) block.setAttribute('data-anchor-id', hid);
      node.parentNode.insertBefore(block, node);
      block.appendChild(node);
      currentBlock = block;
    } else if (currentBlock) {
      currentBlock.appendChild(node);
    }
  });
}

window.addEventListener('hashchange', () => {
  setTimeout(handleAnchorHighlight, 50);
});

window.addEventListener('load', () => {
  setTimeout(handleAnchorHighlight, 100);
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    initOverviewSlideshow();
  } catch (e) {
    console.warn('[Slideshow] initOverviewSlideshow failed to start on DOMContentLoaded', e);
  }
});

function addTruncatedTextOverlays() {

  if (window.innerWidth <= 800) {
    return;
  }

  let activeOverlay = null;

  function showOverlay(element, overlayClass) {

    if (activeOverlay) {
      activeOverlay.remove();
      activeOverlay = null;
    }


    const linkElement = element.closest('a');
    const dateElement = linkElement ? linkElement.querySelector('.list-item-date') : null;


    const overlay = document.createElement('div');
    overlay.className = overlayClass;


    const titleSpan = document.createElement('span');
    titleSpan.textContent = element.textContent;
    titleSpan.style.marginRight = dateElement ? '8px' : '0';
    overlay.appendChild(titleSpan);


    if (dateElement) {
      const dateSpan = document.createElement('span');
      dateSpan.textContent = dateElement.textContent;
      dateSpan.style.fontStyle = 'italic';
      dateSpan.style.fontSize = '0.85em';
      dateSpan.style.color = 'var(--text-secondary)';
      dateSpan.style.marginLeft = 'auto';
      dateSpan.style.flexShrink = '0';
      overlay.appendChild(dateSpan);
    }


    const computedStyle = window.getComputedStyle(element);
    const linkStyle = linkElement ? window.getComputedStyle(linkElement) : null;

    overlay.style.fontSize = computedStyle.fontSize;
    overlay.style.fontWeight = computedStyle.fontWeight;
    overlay.style.fontFamily = computedStyle.fontFamily;
    overlay.style.padding = computedStyle.padding;
    overlay.style.display = linkStyle ? linkStyle.display : 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.gap = '8px';


    document.body.appendChild(overlay);
    activeOverlay = overlay;


    const rect = element.getBoundingClientRect();
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.lineHeight = rect.height + 'px';


    overlay.style.maxWidth = 'max-content';
    const overlayRect = overlay.getBoundingClientRect();
    const maxRight = window.innerWidth - 20;
    if (overlayRect.right > maxRight) {
      overlay.style.maxWidth = (maxRight - rect.left) + 'px';
    }


    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('show');
      });
    });
  }

  function hideOverlay() {
    if (activeOverlay) {
      activeOverlay.classList.remove('show');
      const overlayToRemove = activeOverlay;
      setTimeout(() => overlayToRemove.remove(), 200);
      activeOverlay = null;
    }
  }


  document.querySelectorAll('.list-item-title').forEach(el => {
    if (el.scrollWidth > el.clientWidth) {
      const linkElement = el.closest('a');
      if (linkElement) {
        linkElement.addEventListener('mouseenter', () => showOverlay(el, 'list-item-title-overlay'));
        linkElement.addEventListener('mouseleave', hideOverlay);
      }
    }
  });
}

class ReadingModeManager {
  constructor() {
    this.currentMode = 'static';
    this.tooltipsEnabled = false;
    this.paragraphs = [];
    this.currentParagraphIndex = 0;
    this.poemTitle = '';
    this.animationTimeout = null;
    this.initialTimeout = null;
    this.audioElement = null;

    this.loadPreferences();
    this.checkTooltipsAvailable();
    this.initializeUI();
    this.attachEventListeners();
  }

  loadPreferences() {


    this.tooltipsEnabled = false;
  }

  savePreferences() {
    localStorage.setItem('tooltipsEnabled', this.tooltipsEnabled);
  }

  checkTooltipsAvailable() {

    if (window.currentPoem) {
      this.checkTooltipsForPoem(window.currentPoem.folder);
    }
  }

  checkDynamicModeAvailable(poem) {
    const dynamicBtn = document.getElementById('dynamicModeBtn');
    if (!dynamicBtn) return;

    // Exit dynamic mode if currently active (cleanup on poem change)
    if (this.currentMode === 'dynamic') {
      this.exitDynamicMode();
    }

    if (poem && poem.noDynamicMode) {
      dynamicBtn.style.display = 'none';
      dynamicBtn.classList.remove('positioned');
      return;
    }

    // Check if current poem has the required structure (at least 2 HR elements)
    setTimeout(() => {
      const poemText = document.getElementById('poemText');
      if (poemText) {
        const hrs = poemText.querySelectorAll('hr');
        if (hrs.length >= 2) {
          dynamicBtn.style.display = 'flex';
          setTimeout(() => dynamicBtn.classList.add('positioned'), 100);
        } else {
          console.log('Dynamic mode disabled: poem needs at least 2 HR elements, found', hrs.length);
          dynamicBtn.style.display = 'none';
          dynamicBtn.classList.remove('positioned');
        }
      }
    }, 100);


    if (window.adjustModeControlsPosition) {
      window.adjustModeControlsPosition();
    }
  }

  checkTooltipsForPoem(poemFolder) {
    const tooltipToggle = document.getElementById('tooltipToggleIcon');
    if (!tooltipToggle) return;

    const poemText = document.getElementById('poemText');
    const tooltipElements = poemText ? [
      ...poemText.querySelectorAll('[tt]'),
      ...poemText.querySelectorAll('[data-tooltip]')
    ] : [];

    // Check if there are tooltip elements AND if tooltip data is available
    const hasTooltipData = window.tooltipManager && window.tooltipManager.tooltipData &&
      window.tooltipManager.tooltipData.size > 0;

    if (tooltipElements.length > 0 && hasTooltipData) {
      tooltipToggle.style.display = 'flex';
      setTimeout(() => tooltipToggle.classList.add('positioned'), 100);
    } else {
      tooltipToggle.style.display = 'none';
      tooltipToggle.classList.remove('positioned');
    }

    if (window.adjustModeControlsPosition) {
      window.adjustModeControlsPosition();
    }
  }

  initializeUI() {

    const tooltipToggle = document.getElementById('tooltipToggleIcon');
    if (tooltipToggle) {
      tooltipToggle.style.display = 'none';
    }


    document.body.classList.add('tooltips-disabled');


    setTimeout(() => {
      const dynamicBtn = document.getElementById('dynamicModeBtn');
      if (dynamicBtn) dynamicBtn.classList.add('positioned');


      if (window.adjustModeControlsPosition) {
        window.adjustModeControlsPosition();
      } else {

        setTimeout(() => {
          if (window.adjustModeControlsPosition) {
            window.adjustModeControlsPosition();
          }
        }, 500);
      }
    }, 100);

    this.updateTooltipUI();
  }

  attachEventListeners() {

    document.getElementById('dynamicModeBtn')?.addEventListener('click', () => {
      if (this.currentMode === 'static') {
        this.enterDynamicMode();
      } else {
        // If in dynamic mode, show all content then exit
        this.showAllContent();
        // Small delay to let the fade-in happen before exiting
        setTimeout(() => {
          this.exitDynamicMode();
        }, 100);
      }
    });

    document.getElementById('dynamicDownBtn')?.addEventListener('click', () => {
      this.navigateParagraph(1);
    });

    document.getElementById('tooltipToggleIcon')?.addEventListener('click', () => this.toggleTooltips());
  }


  toggleTooltips() {
    this.tooltipsEnabled = !this.tooltipsEnabled;
    this.savePreferences();
    this.updateTooltipUI();
  }

  updateTooltipUI() {
    document.body.classList.toggle('tooltips-disabled', !this.tooltipsEnabled);

    const tooltipIcon = document.getElementById('tooltipToggleIcon');

    if (tooltipIcon) {

      const iconIsVisible = tooltipIcon.style.display !== 'none';
      if (iconIsVisible) {
        tooltipIcon.classList.toggle('disabled', !this.tooltipsEnabled);
        tooltipIcon.style.opacity = this.tooltipsEnabled ? '1' : '0.4';
      }
    }


    if (!this.tooltipsEnabled) {
      document.querySelectorAll('.tooltip-box').forEach(box => {
        box.style.display = 'none';
      });
    } else {
      // Flash all tooltip triggers when enabling
      document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
        trigger.classList.add('flash');
        setTimeout(() => {
          trigger.classList.remove('flash');
        }, 1000);
      });
    }
  }

  resetToStatic(dynamicBtn) {
    this.currentMode = 'static';
    if (dynamicBtn) {
      dynamicBtn.classList.remove('active');
      dynamicBtn.style.display = 'none';
    }
  }

  enterDynamicMode() {
    // Prevent double-entry
    if (this.currentMode === 'dynamic') {
      return;
    }

    this.currentMode = 'dynamic';

    const dynamicBtn = document.getElementById('dynamicModeBtn');
    const downBtn = document.getElementById('dynamicDownBtn');

    if (dynamicBtn) {
      dynamicBtn.classList.add('active');
      dynamicBtn.blur();
      // Keep button visible during animation
    }

    // Hide navigation button (not used in new tap mode)
    if (downBtn) {
      downBtn.style.display = 'none';
    }

    const poemText = document.getElementById('poemText');
    if (!poemText) {
      this.resetToStatic(dynamicBtn);
      return;
    }

    const hrs = poemText.querySelectorAll('hr');
    if (hrs.length < 2) {
      this.resetToStatic(dynamicBtn);
      return;
    }

    const allElements = Array.from(poemText.children);
    const firstHrIndex = allElements.indexOf(hrs[0]);
    const secondHrIndex = allElements.indexOf(hrs[1]);

    allElements.forEach((el, index) => {
      if (index < firstHrIndex || index > secondHrIndex) {
        el.style.transition = 'opacity 0.8s ease';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    });

    const poemElements = allElements.slice(firstHrIndex + 1, secondHrIndex);
    const existingTitle = poemElements.find(el => el.tagName === 'H2');
    const existingParagraphs = poemElements.filter(el => el.tagName === 'P' && !el.classList.contains('blank-line'));

    if (existingParagraphs.length === 0) {
      this.resetToStatic(dynamicBtn);
      return;
    }

    existingParagraphs.forEach(p => {
      p.style.opacity = '0';
      p.style.transition = 'opacity 0.8s ease';
    });

    if (existingTitle) {
      existingTitle.style.opacity = '0';
      existingTitle.style.transition = 'opacity 0.8s ease';
    }

    this.paragraphElements = existingParagraphs;
    this.titleElement = existingTitle;
    this.hiddenElements = allElements.filter((el, index) => index < firstHrIndex || index > secondHrIndex);
    this.hrElements = [hrs[0], hrs[1]];
    this.currentParagraphIndex = -1; // Will start at 0 (title first)
    this.allContentShown = false;

    // Clear any existing timeouts before setting new ones
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
    }
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    // Create tap overlay
    this.createTapOverlay();

    // Set up click handler to advance verses (only within poem area)
    setTimeout(() => {
      this.clickHandler = (e) => {
        // Only respond to clicks within the poem area
        const poemText = document.getElementById('poemText');
        if (!poemText || !e.target.closest('#poemText')) {
          return;
        }

        // Ignore clicks on controls, audio players, and interactive elements
        if (e.target.closest('.reading-mode-controls') ||
          e.target.closest('audio') ||
          e.target.closest('video') ||
          e.target.closest('a') ||
          e.target.closest('button')) {
          return;
        }

        // Progress to next verse
        this.progressAnimation();
      };
      document.addEventListener('click', this.clickHandler, { once: false });
    }, 100);
  }

  createTapOverlay() {
    // Remove existing overlay if any
    this.removeTapOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'tapOverlay';
    overlay.className = 'tap-overlay';
    overlay.textContent = 'Tap to show';

    const poemText = document.getElementById('poemText');
    if (poemText && this.hrElements && this.hrElements.length >= 2) {
      // Set poemText to relative positioning to contain the absolute overlay
      poemText.style.position = 'relative';

      // Get the positions of the two HR lines relative to poemText
      const firstHr = this.hrElements[0];
      const secondHr = this.hrElements[1];

      const firstHrRect = firstHr.getBoundingClientRect();
      const secondHrRect = secondHr.getBoundingClientRect();
      const poemTextRect = poemText.getBoundingClientRect();

      // Calculate center point between the two HRs (relative to poemText)
      const firstHrBottom = firstHrRect.bottom - poemTextRect.top;
      const secondHrTop = secondHrRect.top - poemTextRect.top;
      let centerY = (firstHrBottom + secondHrTop) / 2;

      // Check if overlay would be visible in viewport
      // Account for overlay height (approximately 30px) and some margin
      const overlayHeight = 30;
      const margin = 20;
      const absoluteY = poemTextRect.top + centerY;

      // If overlay would be below viewport, move it to be visible
      if (absoluteY + overlayHeight > window.innerHeight) {
        // Position it near the bottom of the visible area
        centerY = window.innerHeight - poemTextRect.top - overlayHeight - margin;
      }

      // If overlay would be above viewport, move it to be visible
      if (absoluteY < margin) {
        centerY = margin - poemTextRect.top;
      }

      // Override CSS top to position between HRs (or adjusted for visibility)
      overlay.style.top = centerY + 'px';

      poemText.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
    this.tapOverlay = overlay;

    // Fade in the overlay
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 100);
  }

  removeTapOverlay() {
    if (this.tapOverlay) {
      this.tapOverlay.classList.remove('visible');
      setTimeout(() => {
        if (this.tapOverlay) {
          this.tapOverlay.remove();
          this.tapOverlay = null;
        }
      }, 300);
    }
  }

  progressAnimation() {
    // Remove tap overlay on first tap
    if (this.tapOverlay) {
      this.removeTapOverlay();
    }

    // If all content already shown, exit dynamic mode
    if (this.allContentShown) {
      this.exitDynamicMode();
      return;
    }

    // Clear any existing timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
      this.initialTimeout = null;
    }

    // First show title if it exists and hasn't been shown
    if (this.currentParagraphIndex === -1) {
      if (this.titleElement) {
        this.titleElement.style.transition = 'opacity 0.8s ease';
        requestAnimationFrame(() => {
          this.titleElement.style.opacity = '1';
        });
      }
      this.currentParagraphIndex = 0;
      return;
    }

    // Then show paragraphs one by one
    if (this.currentParagraphIndex < this.paragraphElements.length) {
      const currentPara = this.paragraphElements[this.currentParagraphIndex];
      if (currentPara) {
        currentPara.style.transition = 'opacity 0.8s ease';
        requestAnimationFrame(() => {
          currentPara.style.opacity = '1';
        });
      }
      this.currentParagraphIndex++;

      // Check if we just showed the last paragraph
      if (this.currentParagraphIndex >= this.paragraphElements.length) {
        this.allContentShown = true;
      }
      return;
    }

    // All verses shown (fallback, should already be set above)
    this.allContentShown = true;
  }

  showAllContent() {
    // Remove tap overlay
    this.removeTapOverlay();

    // Show title
    if (this.titleElement) {
      this.titleElement.style.transition = 'opacity 0.8s ease';
      this.titleElement.style.opacity = '1';
    }

    // Show all paragraphs
    if (this.paragraphElements) {
      this.paragraphElements.forEach(p => {
        p.style.transition = 'opacity 0.8s ease';
        p.style.opacity = '1';
      });
    }

    this.allContentShown = true;
    this.currentParagraphIndex = this.paragraphElements.length;
  }

  exitDynamicMode() {
    this.currentMode = 'static';

    const dynamicBtn = document.getElementById('dynamicModeBtn');
    const downBtn = document.getElementById('dynamicDownBtn');

    if (dynamicBtn) {
      dynamicBtn.classList.remove('active');
      dynamicBtn.blur();
      // Button stays visible, just remove active state
    }

    // Hide navigation button
    if (downBtn) downBtn.style.display = 'none';

    // Remove tap overlay
    this.removeTapOverlay();

    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }

    // Clear all timeouts
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
      this.initialTimeout = null;
    }

    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }


    if (this.paragraphElements) {
      this.paragraphElements.forEach(p => {
        p.style.opacity = '1';
      });
    }

    if (this.titleElement) {
      this.titleElement.style.opacity = '1';
    }


    if (this.hiddenElements) {
      this.hiddenElements.forEach(el => {
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.transition = '';
      });
    }

    // Reset state
    this.allContentShown = false;
  }

  navigateParagraph(direction) {
    // Clear any existing timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
      this.initialTimeout = null;
    }

    // Going forward - show next paragraph
    const newIndex = this.currentParagraphIndex + 1;

    // Check if we've reached the end of paragraphs
    if (newIndex >= this.paragraphElements.length) {
      // Show title
      if (this.titleElement) {
        this.titleElement.style.transition = 'opacity 0.8s ease';
        requestAnimationFrame(() => {
          this.titleElement.style.opacity = '1';
        });
      }

      // Disable down button
      const downBtn = document.getElementById('dynamicDownBtn');
      if (downBtn) {
        downBtn.disabled = true;
      }
      return;
    }

    this.currentParagraphIndex = newIndex;

    // Show new paragraph immediately
    this.showCurrentParagraph();
  }

  showCurrentParagraph() {
    const currentPara = this.paragraphElements[this.currentParagraphIndex];

    if (currentPara) {
      // Ensure transition is set and show with fade-in
      currentPara.style.transition = 'opacity 0.8s ease';
      // Use requestAnimationFrame to ensure the transition starts immediately
      requestAnimationFrame(() => {
        currentPara.style.opacity = '1';
      });

      // Update button state - don't disable until after all paragraphs AND title
      const downBtn = document.getElementById('dynamicDownBtn');
      if (downBtn) {
        // Keep enabled until we're past the last paragraph (title is next)
        downBtn.disabled = false;
      }
    }
  }

  showNextParagraph() {
    console.log('showNextParagraph called, index:', this.currentParagraphIndex, 'total paragraphs:', this.paragraphElements?.length);

    if (this.currentParagraphIndex >= this.paragraphElements.length) {
      console.log('All paragraphs shown, showing title and exiting');
      if (this.titleElement) {
        setTimeout(() => {
          this.titleElement.style.opacity = '1';
          console.log('Title shown');

          setTimeout(() => this.exitDynamicMode(), 1000);
        }, 50);
      } else {
        console.log('No title, exiting immediately');
        setTimeout(() => this.exitDynamicMode(), 1000);
      }
      return;
    }


    const currentPara = this.paragraphElements[this.currentParagraphIndex];
    console.log('Current paragraph:', currentPara);

    if (currentPara) {
      const wordCount = currentPara.textContent.trim().split(/\s+/).length;
      console.log('Paragraph word count:', wordCount);
    }
  }

  showNextParagraph() {
    this.showCurrentParagraph();
  }
}

window.initReadingModeManager = function () {
  if (document.getElementById('poemContent')) {
    window.readingModeManager = new ReadingModeManager();
    // If a poem was already loaded before the manager was initialized,
    // retroactively check dynamic mode availability to avoid missing the icon.
    if (window.currentPoem) {
      window.readingModeManager.checkDynamicModeAvailable(window.currentPoem);
    }
  }
};
