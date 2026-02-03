// Music Library - Using your local MP3 files
const musicLibrary = [
  {
    id: 1,
    title: "Song 1",
    artist: "Artist 1",
    duration: "3:45",
    src: "Songs/song1.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
  },
  {
    id: 2,
    title: "Song 2",
    artist: "Artist 2",
    duration: "4:20",
    src: "Songs/song2.mp3",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400"
  },
  {
    id: 3,
    title: "Song 3",
    artist: "Artist 3",
    duration: "3:15",
    src: "Songs/song3.mp3",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400"
  },
  // You can add more songs here following the same format
  // {
  //   id: 4,
  //   title: "Song 4",
  //   artist: "Artist 4",
  //   duration: "3:30",
  //   src: "Songs/song4.mp3",
  //   cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
  // }
];

// DOM Elements
const audio = document.getElementById('audio');
const playlist = document.getElementById('playlist');
const searchInput = document.getElementById('search');
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeSlider = document.getElementById('volume');

// Player State
let currentSongIndex = 0;
let isPlaying = false;
let filteredSongs = [...musicLibrary];

// Initialize player
function initPlayer() {
  renderPlaylist();
  loadSong(currentSongIndex);
  updatePlayPauseButton();
  
  // Set initial volume
  audio.volume = volumeSlider.value;
  
  // Add event listeners
  audio.addEventListener('ended', playNextSong);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateSongDuration);
  volumeSlider.addEventListener('input', updateVolume);
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Render playlist
function renderPlaylist() {
  playlist.innerHTML = '';
  
  if (filteredSongs.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-playlist';
    emptyState.textContent = 'No songs found. Try a different search.';
    playlist.appendChild(emptyState);
    return;
  }
  
  filteredSongs.forEach((song, index) => {
    const songItem = document.createElement('li');
    songItem.className = `song-item ${index === currentSongIndex ? 'playing' : ''}`;
    songItem.dataset.index = index;
    
    // Add animation delay for staggered appearance
    songItem.style.animationDelay = `${index * 0.1}s`;
    
    songItem.innerHTML = `
      <div class="song-info">
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
      </div>
      <span class="song-duration">${song.duration}</span>
    `;
    
    songItem.addEventListener('click', () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      playSong();
      highlightPlayingSong();
    });
    
    playlist.appendChild(songItem);
  });
  
  // Create progress bar if it doesn't exist
  if (!document.querySelector('.progress-container')) {
    createProgressBar();
  }
}

// Create progress bar
function createProgressBar() {
  const controlsContainer = document.querySelector('.controls');
  const progressHTML = `
    <div class="progress-container" id="progress-container">
      <div class="progress-bar" id="progress-bar"></div>
    </div>
    <div class="time-display">
      <span id="current-time">0:00</span>
      <span id="duration">0:00</span>
    </div>
  `;
  
  controlsContainer.insertAdjacentHTML('beforebegin', progressHTML);
  
  // Add click event to progress container
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  
  progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    if (duration) {
      audio.currentTime = (clickX / width) * duration;
    }
  });
}

// Load a song
function loadSong(index) {
  const song = filteredSongs[index];
  
  // Check if file exists
  fetch(song.src, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        audio.src = song.src;
        updateNowPlaying(song);
        highlightPlayingSong();
        
        // When audio is loaded, update duration
        audio.onloadedmetadata = () => {
          if (audio.duration) {
            const durationElement = document.getElementById('duration');
            if (durationElement) {
              durationElement.textContent = formatTime(audio.duration);
            }
          }
        };
      } else {
        console.error(`File not found: ${song.src}`);
        alert(`File not found: ${song.title}`);
      }
    })
    .catch(error => {
      console.error('Error loading song:', error);
      alert(`Error loading: ${song.title}`);
    });
}

// Update song duration from actual audio file
function updateSongDuration() {
  const durationElement = document.getElementById('duration');
  if (durationElement && audio.duration) {
    durationElement.textContent = formatTime(audio.duration);
    
    // Update the song duration in the library if needed
    if (filteredSongs[currentSongIndex]) {
      filteredSongs[currentSongIndex].duration = formatTime(audio.duration);
    }
  }
}

// Play song
function playSong() {
  audio.play()
    .then(() => {
      isPlaying = true;
      updatePlayPauseButton();
      const playPauseBtn = document.getElementById('play-pause');
      playPauseBtn.classList.add('playing');
    })
    .catch(error => {
      console.error('Error playing audio:', error);
      alert('Error playing audio. Please check the file.');
    });
}

// Pause song
function pauseSong() {
  audio.pause();
  isPlaying = false;
  updatePlayPauseButton();
  const playPauseBtn = document.getElementById('play-pause');
  playPauseBtn.classList.remove('playing');
}

// Toggle play/pause
function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

// Play next song
function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % filteredSongs.length;
  loadSong(currentSongIndex);
  playSong();
}

// Play previous song
function playPrevSong() {
  currentSongIndex = (currentSongIndex - 1 + filteredSongs.length) % filteredSongs.length;
  loadSong(currentSongIndex);
  playSong();
}

// Update play/pause button
function updatePlayPauseButton() {
  const playPauseBtn = document.getElementById('play-pause');
  playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

// Update volume
function updateVolume() {
  audio.volume = volumeSlider.value;
  const volumeValue = Math.round(volumeSlider.value * 100);
  volumeSlider.title = `Volume: ${volumeValue}%`;
}

// Update progress bar
function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const currentTime = document.getElementById('current-time');
  
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTime.textContent = formatTime(audio.currentTime);
  }
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Highlight playing song in playlist
function highlightPlayingSong() {
  const songItems = document.querySelectorAll('.song-item');
  songItems.forEach((item, index) => {
    if (index === currentSongIndex) {
      item.classList.add('playing');
      // Scroll to playing song
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      item.classList.remove('playing');
    }
  });
}

// Update now playing display
function updateNowPlaying(song) {
  let nowPlaying = document.querySelector('.now-playing');
  if (!nowPlaying) {
    nowPlaying = document.createElement('div');
    nowPlaying.className = 'now-playing';
    document.querySelector('.player-container').appendChild(nowPlaying);
  }
  nowPlaying.innerHTML = `Now Playing: <span>${song.title}</span> by ${song.artist}`;
}

// Search functionality
function setupSearch() {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
      filteredSongs = [...musicLibrary];
    } else {
      filteredSongs = musicLibrary.filter(song => 
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
      );
    }
    
    // Reset current song index
    currentSongIndex = 0;
    renderPlaylist();
  });
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
  switch(e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowRight':
      if (e.ctrlKey) {
        e.preventDefault();
        playNextSong();
      }
      break;
    case 'ArrowLeft':
      if (e.ctrlKey) {
        e.preventDefault();
        playPrevSong();
      }
      break;
    case 'ArrowUp':
      if (e.ctrlKey) {
        e.preventDefault();
        volumeSlider.value = Math.min(1, parseFloat(volumeSlider.value) + 0.1);
        updateVolume();
      }
      break;
    case 'ArrowDown':
      if (e.ctrlKey) {
        e.preventDefault();
        volumeSlider.value = Math.max(0, parseFloat(volumeSlider.value) - 0.1);
        updateVolume();
      }
      break;
  }
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNextSong);
prevBtn.addEventListener('click', playPrevSong);

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
  setupSearch();
  
  // Add button click animations
  document.querySelectorAll('.controls button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
});

// Function to scan Songs folder for MP3 files (if you want dynamic loading)
async function scanSongsFolder() {
  // Note: This requires server-side implementation or specific configuration
  // For now, we're using the hardcoded list above
  console.log('Using predefined song list from musicLibrary array');
}

// Call scan function on load (optional)
document.addEventListener('DOMContentLoaded', scanSongsFolder);
