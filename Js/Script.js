// Music Library - Sample songs (You can replace these with your own music files)
const musicLibrary = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    duration: "3:20",
    src: "https://assets.codepen.io/4358584/Blinding-Lights.mp3",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400"
  },
  {
    id: 2,
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    duration: "2:21",
    src: "https://assets.codepen.io/4358584/Stay.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w-400"
  },
  {
    id: 3,
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    duration: "2:58",
    src: "https://assets.codepen.io/4358584/Good-4-U.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"
  },
  {
    id: 4,
    title: "Levitating",
    artist: "Dua Lipa",
    duration: "3:23",
    src: "https://assets.codepen.io/4358584/Levitating.mp3",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400"
  },
  {
    id: 5,
    title: "Heat Waves",
    artist: "Glass Animals",
    duration: "3:58",
    src: "https://assets.codepen.io/4358584/Heat-Waves.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
  },
  {
    id: 6,
    title: "Save Your Tears",
    artist: "The Weeknd",
    duration: "3:35",
    src: "https://assets.codepen.io/4358584/Save-Your-Tears.mp3",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400"
  },
  {
    id: 7,
    title: "Industry Baby",
    artist: "Lil Nas X",
    duration: "3:32",
    src: "https://assets.codepen.io/4358584/Industry-Baby.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400"
  },
  {
    id: 8,
    title: "Shivers",
    artist: "Ed Sheeran",
    duration: "3:27",
    src: "https://assets.codepen.io/4358584/Shivers.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
  }
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
    
    audio.currentTime = (clickX / width) * duration;
  });
}

// Load a song
function loadSong(index) {
  const song = filteredSongs[index];
  audio.src = song.src;
  
  // Update now playing display
  updateNowPlaying(song);
  
  // Highlight current song in playlist
  highlightPlayingSong();
}

// Play song
function playSong() {
  audio.play();
  isPlaying = true;
  updatePlayPauseButton();
  
  // Add visual feedback
  const playPauseBtn = document.getElementById('play-pause');
  playPauseBtn.classList.add('playing');
}

// Pause song
function pauseSong() {
  audio.pause();
  isPlaying = false;
  updatePlayPauseButton();
  
  // Remove visual feedback
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
  playPauseBtn.innerHTML = isPlaying ? 
    '<i class="fas fa-pause"></i> Pause' : 
    '<i class="fas fa-play"></i> Play';
}

// Update volume
function updateVolume() {
  audio.volume = volumeSlider.value;
  
  // Visual feedback for volume
  const volumeValue = Math.round(volumeSlider.value * 100);
  volumeSlider.title = `Volume: ${volumeValue}%`;
}

// Update progress bar
function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const currentTime = document.getElementById('current-time');
  const duration = document.getElementById('duration');
  
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update time display
    currentTime.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
  }
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
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
    
    // If we're currently playing and the current song is no longer in filtered list
    if (isPlaying && !filteredSongs.find(song => song.id === musicLibrary[currentSongIndex].id)) {
      pauseSong();
    }
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
  
  // Add some visual effects
  document.querySelectorAll('.controls button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
});

// Add Font Awesome icons (optional - you can remove if not needed)
const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
document.head.appendChild(fontAwesomeLink);
