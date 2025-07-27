document.addEventListener('DOMContentLoaded', () => {
  fetch('poems/poems_manifest.json')
    .then(res => res.json())
    .then(poems => {
      buildPoemList(poems);
      if (poems.length > 0) {
        loadPoem(poems[0]);
      }
    })
    .catch(err => console.error('Error loading poems manifest:', err));
});

function buildPoemList(poems) {
  const poemList = document.getElementById('poemList');
  
  // Clear the list before rebuilding
  poemList.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = poem.name.replace(/\.md$/i, '');  // Remove .md here
    a.dataset.poem = JSON.stringify(poem);
    li.appendChild(a);
    poemList.appendChild(li);
  });

  // Add click listeners
  poemList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const poem = JSON.parse(link.getAttribute('data-poem'));
      loadPoem(poem);
    });
  });
}


function loadPoem(poem) {
  // Remove previous "no audio" message if exists
  document.getElementById('noAudioMsg')?.remove();

  // Load and render poem markdown from poems/ folder
  fetch('poems/' + poem.name)
    .then(res => {
      if (!res.ok) throw new Error('Poem not found');
      return res.text();
    })
    .then(md => {
      document.getElementById('poemText').innerHTML = marked.parse(md);
    })
    .catch(err => {
      console.error('Error loading poem:', err);
      document.getElementById('poemText').innerHTML = '<p>Error loading poem.</p>';
    });

  const audioPlayer = document.querySelector('.audio-player');
  const audioTitle = document.querySelector('.audio-title');
  const audioElement = document.querySelector('audio');

  if (poem.audio) {
    fetch(poem.audio, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          audioTitle.textContent = poem.name.replace(/\.md$/i, '');
          audioElement.src = poem.audio;
          audioPlayer.style.display = 'block';
        } else {
          showNoAudio();
        }
      })
      .catch(err => {
        console.error('Error checking audio file:', err);
        showNoAudio();
      });
  } else {
    showNoAudio();
  }
}


function showNoAudio() {
  const audioPlayer = document.querySelector('.audio-player');
  const audioTitle = document.querySelector('.audio-title');
  const audioElement = document.querySelector('audio');

  audioTitle.textContent = '';
  audioElement.src = '';
  audioPlayer.style.display = 'none';

  const msg = document.createElement('p');
  msg.id = 'noAudioMsg';
  msg.innerHTML = '<i>No audio inspo associated with this poem</i>';
  document.getElementById('poemText').insertAdjacentElement('beforebegin', msg);
}

// Search functionality
document.getElementById('poemSearch').addEventListener('input', e => {
  const search = e.target.value.toLowerCase();
  document.querySelectorAll('#poemList li').forEach(item => {
    const title = item.textContent.toLowerCase();
    item.style.display = title.includes(search) ? 'block' : 'none';
  });
});
