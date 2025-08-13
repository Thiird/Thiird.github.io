document.addEventListener("DOMContentLoaded", () => {
  fetch("poems/poems_manifest.json")
    .then((res) => res.json())
    .then((poems) => {
      buildPoemList(poems);
      if (poems.length > 0) {
        loadPoem(poems[0]);
      }
    })
    .catch((err) => console.error("Error loading poems manifest:", err));
});

function formatPoemTitle(filename) {
  // Remove .md extension
  let title = filename.replace(/\.md$/i, "");
  // Replace the first dot after leading numbers with a space (keep the numbers)
  title = title.replace(/^(\d+)\./, "$1 ");
  // Replace underscores with spaces
  title = title.replace(/_/g, " ");
  // Capitalize first letter of each word
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

  const audioPlayer = document.querySelector(".audio-player");
  const audioTitle = document.querySelector(".audio-title");
  const audioElement = document.querySelector("audio");

  if (poem.audio) {
    const audioPath = "poems/" + encodeURIComponent(poem.audio);

    fetch(audioPath, { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          audioTitle.textContent = formatPoemTitle(poem.audio);
          audioElement.src = audioPath;
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
  const audioPlayer = document.querySelector(".audio-player");
  const audioTitle = document.querySelector(".audio-title");
  const audioElement = document.querySelector("audio");

  audioTitle.textContent = "";
  audioElement.src = "";
  audioPlayer.style.display = "none";
}

document.getElementById("poemSearch").addEventListener("input", (e) => {
  const search = e.target.value.toLowerCase();
  document.querySelectorAll("#poemList li").forEach((item) => {
    const title = item.textContent.toLowerCase();
    item.style.display = title.includes(search) ? "block" : "none";
  });
});
