// 🔹 Zoom variables for lightbox
let zoomLevel = 0;
const zoomScales = [0, 2, 4]; // 0: fit-to-viewport, 2: 2x natural, 4: 4x natural

// 🔹 Calculate scale to fit 90% of viewport
function calculateFitScale(img) {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  if (imgWidth === 0 || imgHeight === 0) {
    console.warn("Image dimensions unavailable:", img.src);
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
function fadeApply(img, lightbox, scale) {
  img.style.opacity = 0; // Fade out
  setTimeout(() => {
    applyScale(img, scale);
    img.style.left = "0px";
    img.style.top = "0px";
    if (scale === calculateFitScale(img)) {
      setTimeout(() => centerImageIfSmall(img, lightbox), 0);
    }
    img.style.opacity = 1; // Fade in
  }, 50);
}

// 🔹 Reset zoom
function resetZoom(img, lightbox) {
  zoomLevel = 0;
  img.classList.remove("zoomed");
  const scale = calculateFitScale(img);
  fadeApply(img, lightbox, scale);
}

// 🔹 Update zoom
function updateZoom(img, lightbox) {
  const fitScale = calculateFitScale(img);
  const scale = zoomLevel === 0 ? fitScale : zoomScales[zoomLevel];
  img.classList.toggle("zoomed", zoomLevel > 0);
  fadeApply(img, lightbox, scale);
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
  if (banner) {
    const bannerBottom = banner.getBoundingClientRect().bottom;
    const offset = Math.max(0, bannerBottom);
    document.querySelectorAll(".blog-list, .poem-list").forEach((sidebar) => {
      sidebar.style.top = offset + "px";
    });
  }
}

// 🔹 Function to get URL parameter
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 🔹 Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dropdown toggle
  initDropdownToggle();

  // Update sidebar position
  updateSidebarTop();

  // 🔹 Lightbox Initialization
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  const img = document.createElement("img");
  img.id = "lightbox-img";
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);

  // 🔹 Zoom on image click
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    zoomLevel = (zoomLevel + 1) % zoomScales.length;
    updateZoom(img, lightbox);
  });

  // 🔹 Close lightbox on click outside or Escape key
  lightbox.addEventListener("click", (e) => {
    if (e.target !== img) {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetZoom(img, lightbox);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.style.display === "block") {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetZoom(img, lightbox);
    }
  });

  // 🔹 Handle window resize
  window.addEventListener("resize", () => {
    if (lightbox.style.display === "block" && zoomLevel === 0) {
      resetZoom(img, lightbox);
    }
  });

  // 🔹 Attach click event to images with .click-zoom class
  function attachLightboxEvents() {
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
        img.src = thumbnail.src;
        const openLightbox = () => {
          lightbox.style.display = "block";
          document.body.classList.add("lightbox-active");
          resetZoom(img, lightbox);
        };
        if (img.complete && img.naturalWidth) openLightbox();
        else img.onload = openLightbox;
      };
      thumbnail.addEventListener("click", thumbnail._lightboxHandler);
    });
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
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const loopBtn = document.getElementById("loopBtn");
  let isLooping = false;

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
            console.error("Audio play failed:", err);
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
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      playPauseBtn.textContent = "▶";
      progressBar.style.width = "0%";
      currentTimeEl.textContent = "0:00";
      durationEl.textContent = "0:00";
    });

    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;
      if (duration && isFinite(duration)) {
        audio.currentTime = (clickX / width) * duration;
      }
    });

    if (loopBtn) {
      loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        audio.loop = isLooping;
        loopBtn.style.color = isLooping ? "#3498db" : "#d3d7db";
      });
    }

    function formatTime(time) {
      if (!isFinite(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
      return `${minutes}:${seconds}`;
    }
  } else {
    console.warn("Audio player elements missing:", {
      audio,
      playPauseBtn,
      progressContainer,
      progressBar,
      currentTimeEl,
      durationEl,
      loopBtn,
    });
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
    fetch("poems/poems_manifest.json")
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
      .catch((err) => console.error("Error loading poems manifest:", err));
  }

  function formatPoemTitle(filename) {
    let title = filename;
    if (filename.toLowerCase().endsWith(".mp3")) {
      title = title.replace(/^\d+[.\s]*/, "").replace(/\.mp3$/i, "");
    } else if (filename.toLowerCase().endsWith(".md")) {
      title = title.replace(/^(\d+)\./, "$1 ").replace(/\.md$/i, "");
    }
    title = title.replace(/_/g, " ");
    title = title.replace(/\b\w/g, (char) => char.toUpperCase());
    return title.trim();
  }

  function buildPoemList(poems) {
    const poemListItems = document.getElementById("poemListItems");
    if (!poemListItems) {
      console.error("poemListItems not found");
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
        const poem = JSON.parse(link.getAttribute("data-poem"));
        const index = link.dataset.index;
        loadPoem(poem);
        history.pushState({ poemIndex: index }, "", `?poem=${index}`);
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
      console.warn("Audio player or element missing");
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
    fetch("poems/" + poem.name)
      .then((res) => {
        if (!res.ok) throw new Error("Poem not found");
        return res.text();
      })
      .then((md) => {
        document.getElementById("poemText").innerHTML = marked.parse(md);
        attachLightboxEvents();
      })
      .catch((err) => {
        console.error("Error loading poem:", err);
        document.getElementById("poemText").innerHTML =
          "<p>Error loading poem.</p>";
      });
    if (poem.audio) {
      const audioPlayer = document.getElementById("audioPlayer");
      const audioElement = document.getElementById("audioElement");
      const audioPath = "poems/" + encodeURIComponent(poem.audio);
      fetch(audioPath, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            audioElement.src = audioPath;
            audioElement.loop = true;
            isLooping = true;
            if (loopBtn) {
              loopBtn.style.color = "#3498db";
            }
            audioPlayer.setAttribute("data-title", formatPoemTitle(poem.audio));
            audioPlayer.style.display = "block";
          } else {
            console.error("Audio file not found:", audioPath);
            audioPlayer.style.display = "none";
          }
        })
        .catch((err) => {
          console.error("Error checking audio file:", err);
          audioPlayer.style.display = "none";
        });
    }
  }

  // 🔹 Blog Functions
  let blogsCache = [];
  function initBlogs() {
    fetch("blogs/blogs_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blogs manifest");
        return res.json();
      })
      .then((blogs) => {
        blogsCache = blogs;
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
      .catch((err) => console.error("Error loading blogs manifest:", err));
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
        const blog = JSON.parse(link.getAttribute("data-blog"));
        const index = link.dataset.index;
        loadBlogPost(blog);
        history.pushState({ blogIndex: index }, "", `?blog=${index}`);
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
    const mdPath = "blogs/" + encodeURIComponent(blog.folder) + "/text.md";
    fetch(mdPath)
      .then((res) => {
        if (!res.ok) throw new Error("Blog post not found");
        return res.text();
      })
      .then((md) => {
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
          classes = [...new Set([...classes, "click-zoom"])];
          const newClassAttr = `class="${classes.join(" ")}"`;
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
            classes = [...new Set([...classes, "click-zoom"])];
            const newClassAttr = `class="${classes.join(" ")}"`;
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
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<embed${before}src="blogs/${blog.folder}/res/${src}"${after}>`;
            }
            return match;
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
        target.innerHTML = marked.parse(md);
        if (window.hljs) {
          hljs.highlightAll();
        }
        attachLightboxEvents();
        enableInternalAnchorScrolling(target);

        // NEW: if URL contains a hash when the post loads, scroll to it
        if (location.hash) {
          // small timeout to ensure elements are laid out
          setTimeout(() => scrollToAnchor(location.hash), 50);
        }
      })
      .catch((err) => {
        console.error(err);
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