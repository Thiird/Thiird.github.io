// 🔹 Global resize timer to prevent duplicate declarations

// 🔹 Function to initialize dropdown toggle for mobile and ensure desktop reset
function initDropdownToggle() {
  const dropdowns = document.querySelectorAll(".top-menu .dropdown");
  const isMobile = window.innerWidth <= 800;

  // Remove existing event listeners to prevent duplicates
  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".menu-button");
    const menu = dropdown.querySelector(".dropdown-menu");
    // Clone button to remove old listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Reset active state and menu visibility
    dropdown.classList.remove("active");
    if (menu) menu.style.display = "none";
  });

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".menu-button");
    const menu = dropdown.querySelector(".dropdown-menu");

    // Remove any existing listeners to prevent duplicates
    dropdown.removeEventListener("mouseenter", dropdown._mouseenterHandler);
    dropdown.removeEventListener("mouseleave", dropdown._mouseleaveHandler);
    button.removeEventListener("click", button._clickHandler);

    if (isMobile) {
      // Mobile: Toggle on click
      button._clickHandler = (e) => {
        e.preventDefault(); // Prevent default link behavior
        const isActive = dropdown.classList.contains("active");
        // Close all other dropdowns
        document.querySelectorAll(".top-menu .dropdown").forEach((d) => {
          if (d !== dropdown) {
            d.classList.remove("active");
            const otherMenu = d.querySelector(".dropdown-menu");
            if (otherMenu) otherMenu.style.display = "none";
          }
        });
        // Toggle current dropdown
        dropdown.classList.toggle("active");
        menu.style.display = isActive ? "none" : "block";
      };
      button.addEventListener("click", button._clickHandler);
    } else {
      // Desktop: Show/hide on hover
      dropdown._mouseenterHandler = () => {
        menu.style.display = "block";
      };
      dropdown._mouseleaveHandler = () => {
        menu.style.display = "none";
      };
      dropdown.addEventListener("mouseenter", dropdown._mouseenterHandler);
      dropdown.addEventListener("mouseleave", dropdown._mouseleaveHandler);
    }
  });

  // Close dropdowns when clicking outside (mobile only)
  document.removeEventListener("click", handleOutsideClick); // Remove previous listener
  if (isMobile) {
    document.addEventListener("click", handleOutsideClick);
  }
  function handleOutsideClick(e) {
    if (!e.target.closest(".dropdown")) {
      dropdowns.forEach((d) => {
        d.classList.remove("active");
        const menu = d.querySelector(".dropdown-menu");
        if (menu) menu.style.display = "none";
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
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "image-wrapper";
  const img = document.createElement("img");
  imageWrapper.appendChild(img);
  lightbox.appendChild(imageWrapper);
  document.body.appendChild(lightbox);

  // 🔹 Zoom cycle
  let zoomLevel = 0; // 0: initial (CSS-sized), 1: 2x natural, 2: 4x natural
  const zoomScales = [0, 2, 4]; // 0: no transform, 2: 2x natural, 4: 4x natural

  // 🔹 Calculate scale to fill 90% of viewport (for wrapper sizing)
  function calculateBaseScale(img) {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    if (imgWidth === 0 || imgHeight === 0) {
      console.warn("Image dimensions unavailable:", img.src);
      return 1;
    }
    const scaleX = maxWidth / imgWidth;
    const scaleY = maxHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY);
    console.log(
      `Image: ${img.src}, natural: ${imgWidth}x${imgHeight}, viewport: ${maxWidth}x${maxHeight}, baseScale: ${scale}`
    );
    return scale;
  }

  // 🔹 Set wrapper aspect ratio to match image
  function setWrapperAspectRatio(img) {
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    if (imgWidth === 0 || imgHeight === 0) {
      console.warn("Cannot set aspect ratio, dimensions unavailable:", img.src);
      return;
    }
    imageWrapper.style.aspectRatio = `${imgWidth} / ${imgHeight}`;
    console.log(`Set aspect ratio: ${imgWidth}/${imgHeight}`);
  }

  // 🔹 Reset transform
  function resetTransform() {
    zoomLevel = 0;
    img.classList.remove("zoomed");
    img.style.transform = "none";
    lightbox.style.overflow = "auto"; // Use scrollbars
    console.log(`Reset transform: zoomLevel=${zoomLevel}, transform=none`);
  }

  // 🔹 Update transform
  function updateTransform() {
    if (zoomLevel === 0) {
      img.style.transform = "none";
      console.log(`Update transform: zoomLevel=${zoomLevel}, transform=none`);
    } else {
      const scale = zoomScales[zoomLevel];
      img.style.transform = `scale(${scale})`;
      console.log(`Update transform: zoomLevel=${zoomLevel}, scale=${scale}`);
    }
  }

  // 🔹 Toggle zoom on image click
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    zoomLevel = (zoomLevel + 1) % zoomScales.length;
    img.classList.toggle("zoomed", zoomLevel > 0);
    lightbox.style.overflow = "auto"; // Always use scrollbars
    updateTransform();
  });

  // 🔹 Close lightbox on click outside image
  lightbox.addEventListener("click", (e) => {
    if (e.target !== img) {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetTransform();
      imageWrapper.style.aspectRatio = "";
      console.log("Lightbox closed via click outside");
    }
  });

  // 🔹 Close lightbox on Escape key
  document.addEventListener("keydown", (e) => {
    const isVisible = window.getComputedStyle(lightbox).display !== "none";
    if (e.key === "Escape" && isVisible) {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetTransform();
      imageWrapper.style.aspectRatio = "";
      console.log("Lightbox closed via Escape key");
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
      thumbnail.addEventListener("click", () => {
        img.src = thumbnail.src;
        img.style.transform = "none";
        img.onload = () => {
          calculateBaseScale(img);
          setWrapperAspectRatio(img);
          resetTransform();
        };
        if (img.complete && img.naturalWidth) {
          calculateBaseScale(img);
          setWrapperAspectRatio(img);
          resetTransform();
        }
        lightbox.style.display = "flex";
        document.body.classList.add("lightbox-active");
        console.log("Lightbox opened for image:", thumbnail.src);
      });
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
      console.log(
        "Play/Pause button clicked, paused:",
        audio.paused,
        "src:",
        audio.src
      );
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            console.log("Audio playing");
            playPauseBtn.textContent = "⏸";
          })
          .catch((err) => {
            console.error("Audio play failed:", err);
            playPauseBtn.textContent = "▶";
          });
      } else {
        audio.pause();
        console.log("Audio paused");
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
      console.log("Audio metadata loaded, duration:", audio.duration);
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
        console.log("Seek to:", audio.currentTime);
      }
    });

    if (loopBtn) {
      loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        audio.loop = isLooping;
        loopBtn.style.color = isLooping ? "#3498db" : "#d3d7db";
        console.log("Loop toggled:", isLooping);
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
  function initPoems() {
    fetch("poems/poems_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load poems manifest");
        return res.json();
      })
      .then((poems) => {
        console.log("Poems loaded:", poems);
        buildPoemList(poems);
        // Get poem index from URL parameter
        const poemIndex = parseInt(getUrlParameter("poem")) || 0;
        // Load the poem at the specified index, default to 0 if out of range
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
    const poemListItems = document.getElementById("poemListItems"); // Target ul directly
    if (!poemListItems) {
      console.error("poemListItems not found");
      return;
    }
    poemListItems.innerHTML = "";
    poems.forEach((poem) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = formatPoemTitle(poem.name);
      a.dataset.poem = JSON.stringify(poem);
      a.classList.add("poem-link");
      li.appendChild(a);
      poemListItems.appendChild(li);
    });
    poemListItems.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const poem = JSON.parse(link.getAttribute("data-poem"));
        loadPoem(poem);
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
    isLooping = false; // Reset looping state
    if (loopBtn) {
      loopBtn.style.color = "#d3d7db"; // Reset loop button color
    }
    console.log("Audio player reset");
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
      console.log("Attempting to load audio:", audioPath);
      fetch(audioPath, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            audioElement.src = audioPath;
            audioElement.loop = true; // Enable looping by default
            isLooping = true; // Update looping state
            if (loopBtn) {
              loopBtn.style.color = "#3498db"; // Set loop button to active color
            }
            audioPlayer.setAttribute("data-title", formatPoemTitle(poem.audio));
            audioPlayer.style.display = "block";
            console.log(
              "Audio player set, src:",
              audioPath,
              "looping:",
              audioElement.loop
            );
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
  function initBlogs() {
    fetch("blogs/blogs_manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blogs manifest");
        return res.json();
      })
      .then((blogs) => {
        blogs.sort((a, b) => b.folder.localeCompare(a.folder));
        const target = document.getElementById("blogText");
        if (target) target.innerHTML = "Loading blog post...";
        buildBlogList(blogs);
        // Get blog index from URL parameter
        const blogIndex = parseInt(getUrlParameter("blog")) || 0;
        // Load the blog at the specified index, default to 0 if out of range
        if (blogs.length > 0) {
          const selectedBlog = blogs[Math.min(Math.max(blogIndex, 0), blogs.length - 1)];
          loadBlogPost(selectedBlog);
        }
      })
      .catch((err) => console.error("Error loading blogs manifest:", err));
  }

  function buildBlogList(blogs) {
    const listEl = document.getElementById("blogListItems"); // Correctly target the list container
    if (!listEl) return;

    listEl.innerHTML = ""; // Clear only the list items, not the header

    blogs.forEach((blog) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = blog.title || formatBlogTitle(blog.folder);
      a.dataset.blog = JSON.stringify(blog);
      a.classList.add("blog-link");
      li.appendChild(a);
      listEl.appendChild(li);
    });

    // Add event listeners to the blog links
    listEl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const blog = JSON.parse(link.getAttribute("data-blog"));
        loadBlogPost(blog);
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
        // Process Markdown images
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
        // Process Markdown-linked images
        md = md.replace(/\[<img([^>]+)>\]\(([^)]+)\)/g, (match, attrs, src) => {
          let classAttr = attrs.match(/class=["']([^"']*)["']/i);
          let classes = classAttr ? classAttr[1].split(/\s+/) : [];
          const newClassAttr = `class="${classes.join(" ")}"`;
          attrs = attrs.replace(/class=["'][^"']*["']/i, "").trim();
          if (!src.startsWith("http") && !src.includes("/")) {
            return `<div class="image-wrapper"><img ${attrs} ${newClassAttr} src="blogs/${blog.folder}/res/${src}"></div>`;
          }
          return `<div class="image-wrapper"><img ${attrs} ${newClassAttr} src="${src}"></div>`;
        });
        // Process standalone <img> tags
        md = md.replace(
          /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            let classAttr = before.match(/class=["']([^"']*)["']/i);
            let classes = classAttr ? classAttr[1].split(/\s+/) : [];
            const newClassAttr = classes.length
              ? `class="${classes.join(" ")}"`
              : "";
            before = before.replace(/class=["'][^"']*["']/i, "").trim();
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<div class="image-wrapper"><img ${before} ${newClassAttr} src="blogs/${blog.folder}/res/${src}" ${after}></div>`;
            }
            return `<div class="image-wrapper"><img ${before} ${newClassAttr} src="${src}" ${after}></div>`;
          }
        );
        // Process <embed> tags
        md = md.replace(
          /<embed([^>]+)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<embed${before}src="blogs/${blog.folder}/res/${src}"${after}>`;
            }
            return match;
          }
        );
        // Process <video> tags
        md = md.replace(
          /<video([^>]*)>\s*<source([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/video>/g,
          (match, videoAttrs, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<video${videoAttrs}> <source${before}src="blogs/${blog.folder}/res/${src}"${after}> </video>`;
            }
            return match;
          }
        );
        // Process !video syntax
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
        // Attach lightbox events
        const lightbox = document.getElementById("lightbox");
        const lightboxImg = lightbox.querySelector("img");
        const imageWrapper = lightbox.querySelector(".image-wrapper");
        target.querySelectorAll("img.click-zoom").forEach((thumbnail) => {
          if (!thumbnail.parentElement.classList.contains("image-wrapper")) {
            const wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";
            thumbnail.parentElement.insertBefore(wrapper, thumbnail);
            wrapper.appendChild(thumbnail);
          }
          thumbnail.style.cursor = "pointer";
          thumbnail.removeEventListener("click", thumbnail._lightboxHandler);
          thumbnail._lightboxHandler = () => {
            lightboxImg.src = thumbnail.src;
            lightboxImg.style.transform = "none";
            lightboxImg.onload = () => {
              calculateBaseScale(lightboxImg);
              setWrapperAspectRatio(lightboxImg);
              resetTransform();
            };
            if (lightboxImg.complete && lightboxImg.naturalWidth) {
              calculateBaseScale(lightboxImg);
              setWrapperAspectRatio(lightboxImg);
              resetTransform();
            }
            lightbox.style.display = "flex";
            document.body.classList.add("lightbox-active");
            console.log("Lightbox opened for image:", thumbnail.src);
          };
          thumbnail.addEventListener("click", thumbnail._lightboxHandler);
        });
      })
      .catch((err) => {
        console.error(err);
        target.innerHTML = "Failed to load blog post.";
      });
  }
});

// 🔹 Ensure initialization on load
window.addEventListener("load", () => {
  initDropdownToggle();
  updateSidebarTop();
});