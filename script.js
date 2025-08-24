document.addEventListener("DOMContentLoaded", () => {
  // Load poems manifest on poems pages
  if (
    document.getElementById("poemList") &&
    window.location.pathname.includes("poems")
  ) {
    initPoems();
  }

  // Load blogs manifest on blogs pages
  if (
    document.getElementById("poemList") &&
    window.location.pathname.includes("blogs")
  ) {
    initBlogs();
  }

  // 🔍 Search filter (works for both poems and blogs list)
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
});

/* ----------------------------
   POEMS
----------------------------- */
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

function loadPoem(poem) {
  document.getElementById("noAudioMsg")?.remove();

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

  const audioPlayer = document.getElementById("audioPlayer");
  const audioElement = document.getElementById("audioElement");

  if (poem.audio) {
    const audioPath = "poems/" + encodeURIComponent(poem.audio);

    fetch(audioPath, { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          const formattedTitle = formatPoemTitle(poem.audio);
          audioPlayer.setAttribute("data-title", formattedTitle); // tooltip
          audioElement.src = audioPath;
          audioElement.loop = true;
          audioPlayer.style.display = "block";
        } else {
          showNoAudio();
        }
      })
      .catch((err) => {
        console.error("Error checking audio file:", err);
        showNoAudio();
      });
  } else {
    showNoAudio();
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

/* ----------------------------
   BLOGS
----------------------------- */
function initBlogs() {
  fetch("blogs/blogs_manifest.json")
    .then((res) => res.json())
    .then((blogs) => {
      // 🔹 Sort descending (newest folder name first)
      blogs.sort((a, b) => b.folder.localeCompare(a.folder));

      // Clear poemText right away (so poem content doesn’t linger)
      const target = document.getElementById("poemText");
      if (target) target.innerHTML = "Loading blog post...";

      buildBlogList(blogs);

      // 🔹 Auto-load the first blog
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
    a.classList.add("poem-link"); // reuse styling
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
      // 🔹 Fix normal Markdown images ![alt](image.png)
      md = md.replace(/!\[(.*?)\]\(([^)]+)\)/g, (match, alt, src) => {
        if (!src.startsWith("http") && !src.includes("/")) {
          return `![${alt}](blogs/${blog.folder}/res/${src})`;
        }
        return match;
      });

      // 🔹 Fix clickable images [<img ...>](image.png)
      md = md.replace(/\[<img([^>]+)>\]\(([^)]+)\)/g, (match, attrs, src) => {
        if (!src.startsWith("http") && !src.includes("/")) {
          return `[<img${attrs} src="blogs/${blog.folder}/res/${src}">](blogs/${blog.folder}/res/${src})`;
        }
        return match;
      });

      target.innerHTML = marked.parse(md);
    })
    .catch((err) => {
      console.error("Error loading blog post:", err);
      target.innerHTML = "<p>Error loading blog post.</p>";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audioElement");
  const playPauseBtn = document.getElementById("playPause");
  const progressContainer = document.querySelector(".progress-container");
  const progressBar = document.getElementById("progressBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const loopBtn = document.getElementById("loopBtn");

  let isLooping = false;

  // Play/Pause
  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
    }
  });

  // Update progress bar
  audio.addEventListener("timeupdate", () => {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // Set duration once metadata is loaded
  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  // Seek
  progressContainer.addEventListener("click", (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  });

  // Loop button
  loopBtn.addEventListener("click", () => {
    isLooping = !isLooping;
    audio.loop = isLooping;
    loopBtn.style.color = isLooping ? "#3498db" : "#d3d7db";
  });

  // Helper function for time formatting
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
});
