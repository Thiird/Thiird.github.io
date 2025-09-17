document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Lightbox Initialization
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "image-wrapper";
  const img = document.createElement("img");
  imageWrapper.appendChild(img);
  lightbox.appendChild(imageWrapper);
  document.body.appendChild(lightbox);

  // 🔹 Zoom cycle and panning variables
  let zoomLevel = 0; // 0: initial (CSS-sized), 1: 2x natural, 2: 4x natural
  const zoomScales = [0, 2, 4]; // 0: no transform, 2: 2x natural, 4: 4x natural
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

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
    translateX = 0;
    translateY = 0;
    img.classList.remove("zoomed", "panning", "grabbing");
    img.style.transform = "none";
    lightbox.style.overflow = "hidden";
    console.log(`Reset transform: zoomLevel=${zoomLevel}, transform=none`);
  }

  // 🔹 Update transform
  function updateTransform() {
    if (zoomLevel === 0) {
      img.style.transform = "none";
      console.log(`Update transform: zoomLevel=${zoomLevel}, transform=none`);
    } else {
      const scale = zoomScales[zoomLevel];
      img.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      console.log(
        `Update transform: zoomLevel=${zoomLevel}, scale=${scale}, translate=${translateX},${translateY}`
      );
    }
  }

  // 🔹 Toggle zoom on image click
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    zoomLevel = (zoomLevel + 1) % zoomScales.length;
    img.classList.toggle("zoomed", zoomLevel > 0);
    img.classList.toggle("panning", zoomLevel > 0);
    translateX = 0;
    translateY = 0;
    lightbox.style.overflow = zoomLevel > 0 ? "auto" : "hidden";
    updateTransform();
  });

  // 🔹 Panning
  img.addEventListener("mousedown", (e) => {
    if (zoomLevel > 0) {
      e.preventDefault();
      isPanning = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      img.classList.add("grabbing");
    }
  });

  img.addEventListener("mousemove", (e) => {
    if (isPanning && zoomLevel > 0) {
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  });

  img.addEventListener("mouseup", () => {
    isPanning = false;
    img.classList.remove("grabbing");
  });

  img.addEventListener("mouseleave", () => {
    isPanning = false;
    img.classList.remove("grabbing");
  });

  // 🔹 Close lightbox on click outside image
  lightbox.addEventListener("click", (e) => {
    if (e.target !== img) {
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetTransform();
      imageWrapper.style.aspectRatio = "";
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
    document.getElementById("poemList") &&
    window.location.pathname.includes("blogs")
  ) {
    initBlogs();
  }

  // 🔹 Search filter
  const searchInput = document.getElementById("poemSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll("#poemList li").forEach((item) => {
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
        if (poems.length > 0) {
          loadPoem(poems[0]);
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
    const poemList = document.getElementById("poemList");
    poemList.innerHTML = "";
    poems.forEach((poem) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = formatPoemTitle(poem.name);
      a.dataset.poem = JSON.stringify(poem);
      a.classList.add("poem-link");
      li.appendChild(a);
      poemList.appendChild(li);
    });
    poemList.querySelectorAll("a").forEach((link) => {
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
        const target = document.getElementById("poemText");
        if (target) target.innerHTML = "Loading blog post...";
        buildBlogList(blogs);
        if (blogs.length > 0) {
          loadBlogPost(blogs[0]);
        }
      })
      .catch((err) => console.error("Error loading blogs manifest:", err));
  }

  function buildBlogList(blogs) {
    const listEl = document.getElementById("poemList");
    if (!listEl) return;
    listEl.innerHTML = "";
    blogs.forEach((blog) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = blog.title || formatBlogTitle(blog.folder);
      a.dataset.blog = JSON.stringify(blog);
      a.classList.add("poem-link");
      li.appendChild(a);
      listEl.appendChild(li);
    });
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
    const target = document.getElementById("poemText");
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
          if (!src.startsWith("http") && !src.includes("/")) {
            return `![${alt}](blogs/${blog.folder}/res/${src})`;
          }
          return match;
        });

        md = md.replace(/\[<img([^>]+)>\]\(([^)]+)\)/g, (match, attrs, src) => {
          if (!src.startsWith("http") && !src.includes("/")) {
            return `[<img${attrs} src="blogs/${blog.folder}/res/${src}">](blogs/${blog.folder}/res/${src})`;
          }
          return match;
        });

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
          /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<div class="image-wrapper"><img${before}src="blogs/${blog.folder}/res/${src}"${after}></div>`;
            }
            return `<div class="image-wrapper"><img${before}src="${src}"${after}></div>`;
          }
        );

        md = md.replace(
          /<video([^>]*)>\s*<source([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/video>/g,
          (match, videoAttrs, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<video${videoAttrs}>
        <source${before}src="blogs/${blog.folder}/res/${src}"${after}>
      </video>`;
            }
            return match;
          }
        );

        md = md.replace(/!video\(([^)]+)\)/g, (match, src) => {
          if (!src.startsWith("http") && !src.includes("/")) {
            return `
            <video controls class="video-player">
              <source src="blogs/${blog.folder}/res/${src}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          `;
          }
          return `
          <video controls class="video-player">
            <source src="${src}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `;
        });

        target.innerHTML = marked.parse(md);

        if (window.hljs) {
          hljs.highlightAll();
        }

        const lightboxImg = lightbox.querySelector("img");
        target.querySelectorAll("img.click-zoom").forEach((thumbnail) => {
          if (!thumbnail.parentElement.classList.contains("image-wrapper")) {
            const wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";
            thumbnail.parentElement.insertBefore(wrapper, thumbnail);
            wrapper.appendChild(thumbnail);
          }
          thumbnail.style.cursor = "pointer";
          thumbnail.addEventListener("click", () => {
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
          });
        });
      })
      .catch((err) => {
        console.error("Error loading blog post:", err);
        target.innerHTML = "<p>Error loading blog post.</p>";
      });
  }
});
