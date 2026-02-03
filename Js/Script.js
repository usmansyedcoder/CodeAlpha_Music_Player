
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
  audio.addEventListener('canplaythrough', handleAudioReady);
  volumeSlider.addEventListener('input', updateVolume);
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle when audio is ready to play
function handleAudioReady() {
  // If we were waiting to play after load, play now
  if (window.shouldPlayAfterLoad) {
    playSong();
    window.shouldPlayAfterLoad = false;
  }
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
    songItem.className = `song-item ${index === currentSongIndex && isPlaying ? 'playing' : ''}`;
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
      // If clicking the same song that's already playing, toggle pause
      if (currentSongIndex === index && isPlaying) {
        pauseSong();
        return;
      }
      
      // If clicking a different song or song is paused, play it
      currentSongIndex = index;
      loadSong(currentSongIndex, true); // true means play after loading
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
  
  progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    if (duration) {
      audio.currentTime = (clickX / width) * duration;
    }
  });
}

// Load a song (with optional autoPlay parameter)
function loadSong(index, autoPlay = false) {
  const song = filteredSongs[index];
  
  // Pause current song if playing
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    updatePlayPauseButton();
  }
  
  // Show loading state
  updateNowPlaying(`Loading: ${song.title}...`);
  
  // Check if file exists and load it
  fetch(song.src, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        audio.src = song.src;
        updateNowPlaying(`Loaded: ${song.title} by ${song.artist}`);
        
        // When audio metadata is loaded, update duration
        audio.onloadedmetadata = () => {
          if (audio.duration) {
            const durationElement = document.getElementById('duration');
            if (durationElement) {
              durationElement.textContent = formatTime(audio.duration);
            }
          }
          
          // If autoPlay is true, play the song
          if (autoPlay) {
            // Check if audio is ready to play
            if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or more
              playSong();
            } else {
              // Wait for audio to be ready
              window.shouldPlayAfterLoad = true;
            }
          }
        };
        
        highlightPlayingSong();
      } else {
        console.error(`File not found: ${song.src}`);
        updateNowPlaying(`Error: File not found - ${song.title}`);
        alert(`File not found: ${song.title}`);
      }
    })
    .catch(error => {
      console.error('Error loading song:', error);
      updateNowPlaying(`Error loading: ${song.title}`);
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
  if (!audio.src) {
    console.error('No audio source to play');
    return;
  }
  
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        updatePlayPauseButton();
        highlightPlayingSong();
        updateNowPlaying(`Now Playing: ${filteredSongs[currentSongIndex].title}`);
        
        // Add visual feedback
        const playPauseBtn = document.getElementById('play-pause');
        playPauseBtn.classList.add('playing');
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        isPlaying = false;
        updatePlayPauseButton();
        
        // Handle autoplay restrictions
        if (error.name === 'NotAllowedError') {
          updateNowPlaying('Click play button to start (autoplay blocked)');
          alert('Please click the play button to start playback (autoplay is blocked by browser)');
        }
      });
  }
}

// Pause song
function pauseSong() {
  audio.pause();
  isPlaying = false;
  updatePlayPauseButton();
  highlightPlayingSong();
  
  // Remove visual feedback
  const playPauseBtn = document.getElementById('play-pause');
  playPauseBtn.classList.remove('playing');
  
  updateNowPlaying(`Paused: ${filteredSongs[currentSongIndex].title}`);
}

// Toggle play/pause
function togglePlayPause() {
  if (!audio.src) {
    // If no song is loaded, load and play the first song
    currentSongIndex = 0;
    loadSong(currentSongIndex, true);
    return;
  }
  
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

// Play next song
function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % filteredSongs.length;
  loadSong(currentSongIndex, true);
}

// Play previous song
function playPrevSong() {
  currentSongIndex = (currentSongIndex - 1 + filteredSongs.length) % filteredSongs.length;
  loadSong(currentSongIndex, true);
}

// Update play/pause button
function updatePlayPauseButton() {
  const playPauseBtn = document.getElementById('play-pause');
  if (isPlaying) {
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  } else {
    playPauseBtn.textContent = 'Play';
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
  }
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
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  
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
function updateNowPlaying(message) {
  let nowPlaying = document.querySelector('.now-playing');
  if (!nowPlaying) {
    nowPlaying = document.createElement('div');
    nowPlaying.className = 'now-playing';
    document.querySelector('.player-container').appendChild(nowPlaying);
  }
  
  // Check if message is already formatted or plain text
  if (typeof message === 'string' && !message.includes('<span>')) {
    // Format plain text messages
    if (message.startsWith('Now Playing:')) {
      const songTitle = filteredSongs[currentSongIndex]?.title || '';
      const artist = filteredSongs[currentSongIndex]?.artist || '';
      nowPlaying.innerHTML = `Now Playing: <span>${songTitle}</span> by ${artist}`;
    } else if (message.startsWith('Paused:')) {
      const songTitle = filteredSongs[currentSongIndex]?.title || '';
      nowPlaying.innerHTML = `Paused: <span>${songTitle}</span>`;
    } else {
      nowPlaying.innerHTML = message;
    }
  } else {
    nowPlaying.innerHTML = message;
  }
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
    if (isPlaying && !filteredSongs.find(song => song.id === musicLibrary[currentSongIndex]?.id)) {
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
  
  // Add button click animations
  document.querySelectorAll('.controls button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
  
  // Initial message
  updateNowPlaying('Select a song from the playlist to play');
});
