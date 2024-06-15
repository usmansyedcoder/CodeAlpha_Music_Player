const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const volumeSlider = document.getElementById("volume");
const searchInput = document.getElementById("search");
const playlistContainer = document.getElementById("playlist");

const songs = [
  { title: "Song 1", src: "songs/song1.mp3" },
  { title: "Song 2", src: "songs/song2.mp3" },
  { title: "Song 3", src: "songs/song3.mp3" },
  // Add more songs as needed
];

let currentSongIndex = 0;

function loadPlaylist() {
  playlistContainer.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    li.dataset.index = index;
    li.addEventListener("click", () => {
      currentSongIndex = index;
      playSong();
    });
    playlistContainer.appendChild(li);
  });
}

function playSong() {
  const song = songs[currentSongIndex];
  audio.src = song.src;
  audio.play();
  playPauseBtn.textContent = "Pause";
}

function playPause() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audio.pause();
    playPauseBtn.textContent = "Play";
  }
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong();
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong();
}

playPauseBtn.addEventListener("click", playPause);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(query)
  );
  playlistContainer.innerHTML = "";
  filteredSongs.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    li.dataset.index = index;
    li.addEventListener("click", () => {
      currentSongIndex = songs.findIndex((s) => s.title === song.title);
      playSong();
    });
    playlistContainer.appendChild(li);
  });
});

loadPlaylist();
