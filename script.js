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
    const maxWidth = window.innerWidth * 0.9; // 90% of viewport width
    const maxHeight = window.innerHeight * 0.9; // 90% of viewport height
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    if (imgWidth === 0 || imgHeight === 0) {
      console.warn("Image dimensions unavailable:", img.src);
      return 1; // Fallback scale
    }
    const scaleX = maxWidth / imgWidth;
    const scaleY = maxHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY); // Scale to fit 90% of viewport
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
    img.style.transform = "none"; // Let CSS handle initial sizing
    lightbox.style.overflow = "hidden"; // Disable panning
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
    e.stopPropagation(); // Prevent closing lightbox
    zoomLevel = (zoomLevel + 1) % zoomScales.length; // Cycle: 0, 1, 2
    img.classList.toggle("zoomed", zoomLevel > 0); // zoomed class for 2x and 4x
    img.classList.toggle("panning", zoomLevel > 0); // Enable panning for 2x and 4x
    translateX = 0; // Reset panning
    translateY = 0;
    lightbox.style.overflow = zoomLevel > 0 ? "auto" : "hidden";
    updateTransform();
  });

  // 🔹 Panning
  img.addEventListener("mousedown", (e) => {
    if (zoomLevel > 0) {
      // Pan at 2x and 4x
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
      // Close if clicking outside
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
      resetTransform();
      imageWrapper.style.aspectRatio = ""; // Clear aspect ratio
    }
  });

  // 🔹 Attach click event to images with .click-zoom class
  function attachLightboxEvents() {
    document.querySelectorAll("img.click-zoom").forEach((thumbnail) => {
      // Wrap thumbnail in image-wrapper for grid
      if (!thumbnail.parentElement.classList.contains("image-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "image-wrapper";
        thumbnail.parentElement.insertBefore(wrapper, thumbnail);
        wrapper.appendChild(thumbnail);
      }
      thumbnail.addEventListener("click", () => {
        img.src = thumbnail.src;
        img.style.transform = "none"; // Reset transform
        img.onload = () => {
          calculateBaseScale(img); // For logging and wrapper sizing
          setWrapperAspectRatio(img);
          resetTransform();
        };
        if (img.complete && img.naturalWidth) {
          calculateBaseScale(img); // For logging and wrapper sizing
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
    durationEl &&
    loopBtn
  ) {
    playPauseBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = "⏸";
      } else {
        audio.pause();
        playPauseBtn.textContent = "▶";
      }
    });

    audio.addEventListener("timeupdate", () => {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;
      audio.currentTime = (clickX / width) * duration;
    });

    loopBtn.addEventListener("click", () => {
      isLooping = !isLooping;
      audio.loop = isLooping;
      loopBtn.style.color = isLooping ? "#3498db" : "#d3d7db";
    });

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
      return `${minutes}:${seconds}`;
    }
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
      .then((res) => res.json())
      .then((poems) => {
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
    if (!audioPlayer || !audioElement) return;
    audioElement.pause();
    audioElement.currentTime = 0;
    progressBar.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    playPauseBtn.textContent = "▶";
    audioPlayer.removeAttribute("data-title");
    audioElement.src = "";
    audioPlayer.style.display = "none";
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
      fetch(audioPath, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            audioElement.src = audioPath;
            audioElement.loop = true;
            audioPlayer.setAttribute("data-title", formatPoemTitle(poem.audio));
            audioPlayer.style.display = "block";
          }
        })
        .catch((err) => console.error("Error checking audio file:", err));
    }
  }

  function showNoAudio() {
    const audioPlayer = document.getElementById("audioPlayer");
    const audioElement = document.getElementById("audioElement");
    if (audioPlayer && audioElement) {
      audioPlayer.removeAttribute("data-title");
      audioElement.src = "";
      audioPlayer.style.display = "none";
    }
  }

  // 🔹 Blog Functions
  function initBlogs() {
    fetch("blogs/blogs_manifest.json")
      .then((res) => res.json())
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
    showNoAudio();
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
        // Fix relative image paths
        md = md.replace(/!\[(.*?)\]\(([^)]+)\)/g, (match, alt, src) => {
          if (!src.startsWith("http") && !src.includes("/")) {
            return `![${alt}](blogs/${blog.folder}/res/${src})`;
          }
          return match;
        });

        // Fix clickable images
        md = md.replace(/\[<img([^>]+)>\]\(([^)]+)\)/g, (match, attrs, src) => {
          if (!src.startsWith("http") && !src.includes("/")) {
            return `[<img${attrs} src="blogs/${blog.folder}/res/${src}">](blogs/${blog.folder}/res/${src})`;
          }
          return match;
        });

        // Fix <embed> (PDF etc.)
        md = md.replace(
          /<embed([^>]+)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<embed${before}src="blogs/${blog.folder}/res/${src}"${after}>`;
            }
            return match;
          }
        );

        // Fix raw <img> tags
        md = md.replace(
          /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/g,
          (match, before, src, after) => {
            if (!src.startsWith("http") && !src.includes("/")) {
              return `<div class="image-wrapper"><img${before}src="blogs/${blog.folder}/res/${src}"${after}></div>`;
            }
            return `<div class="image-wrapper"><img${before}src="${src}"${after}></div>`;
          }
        );

        // Fix <video> sources
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

        // 🔹 Add custom markdown for videos: !video(filename.mp4)
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

        // Highlight code if hljs is loaded
        if (window.hljs) {
          hljs.highlightAll();
        }

        // Re-attach lightbox event listeners
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
            lightboxImg.style.transform = "none"; // Reset transform
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
