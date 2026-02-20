/* =========================
   CONFIG
========================= */

const PASSWORD = "4utofu";
/* =========================
   GLOBAL AUDIO (PERSISTENT)
========================= */

if (!window.globalAudio) {
  window.globalAudio = new Audio();
  window.globalAudio.loop = true;
}





/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {

  if (!window.location.pathname.includes("password")) {
    checkAuth();
  }

  applyTheme();

  // Run music on all pages
  initMusic();

  typeWriter();
  loadRemarks();
  setupStars();
  restoreRating();
});

/* =========================
   AUTH
========================= */

function unlockSite() {

  const input = document.getElementById("passwordInput");
  if (!input) return;

  if (input.value === PASSWORD) {

    localStorage.setItem("unlocked", "true");

    // Tell next page to autoplay
    localStorage.setItem("autoplay", "true");

    window.location = "home.html";

  } else {
    document.getElementById("errorMsg").innerText = "Wrong password";
  }
}

function checkAuth() {
  if (!localStorage.getItem("unlocked")) {
    window.location = "password.html";
  }
}

function logout() {
  localStorage.clear();
  window.location = "password.html";
}

function goPage(page) {
  window.location = page;
}

/* =========================
   THEME SYSTEM
========================= */

function changeTheme(theme) {
  localStorage.setItem("theme", theme);
  applyTheme();
  initMusic();
  closeThemeModal();
}

function applyTheme() {

  const theme = localStorage.getItem("theme") || "maxton";

  if (theme === "summer") {
    document.documentElement.style.setProperty("--bg",
      "linear-gradient(-45deg,#87CEEB,#FFD580,#ff9a9e,#fad0c4)");
    document.documentElement.style.setProperty("--font-main",
      "'Great Vibes', cursive");
    document.documentElement.style.setProperty("--button-bg", "#ff9a3c");
    document.documentElement.style.setProperty("--button-hover", "#ff7b00");
  }

  if (theme === "vampire") {
    document.documentElement.style.setProperty("--bg",
      "linear-gradient(-45deg,#000000,#2b0000,#8B0000,#1a0000)");
    document.documentElement.style.setProperty("--font-main",
      "'Cinzel', serif");
    document.documentElement.style.setProperty("--button-bg", "#8B0000");
    document.documentElement.style.setProperty("--button-hover", "#a30000");
  }

  if (theme === "maxton") {
    document.documentElement.style.setProperty("--bg",
      "linear-gradient(-45deg,#ff9ecb,#7da7ff,#c471f5,#fa71cd)");
    document.documentElement.style.setProperty("--font-main",
      "'Poppins', sans-serif");
    document.documentElement.style.setProperty("--button-bg", "#ff4fa3");
    document.documentElement.style.setProperty("--button-hover", "#ff2e91");
  }

}

function openThemeModal() {
  const modal = document.getElementById("themeModal");
  if (modal) modal.classList.remove("hidden");
}

function closeThemeModal() {
  const modal = document.getElementById("themeModal");
  if (modal) modal.classList.add("hidden");
}

/* =========================
   ADVANCED MUSIC PLAYER
========================= */

let audio = new Audio();
let playlist = [];
let currentTrack = 0;

function initMusic() {

  const theme = localStorage.getItem("theme") || "maxton";

  const playlists = {
    summer: [
      "assets/songs/summer/1.mp3",
      "assets/songs/summer/2.mp3",
      "assets/songs/summer/3.mp3"
    ],
    vampire: [
      "assets/songs/vampire/1.mp3",
      "assets/songs/vampire/2.mp3",
      "assets/songs/vampire/3.mp3"
    ],
    maxton: [
      "assets/songs/maxton/1.mp3",
      "assets/songs/maxton/2.mp3",
      "assets/songs/maxton/3.mp3"
    ]
  };

  playlist = playlists[theme];
  currentTrack = 0;
  audio.src = playlist[currentTrack];

  // 🔥 Autoplay if coming from unlock
  if (localStorage.getItem("autoplay") === "true") {

    audio.play().catch(() => {
      console.log("Autoplay blocked by browser");
    });

    localStorage.removeItem("autoplay");
  }

  renderPlaylistUI();
}

  playlist = playlists[theme];
  currentTrack = 0;

  audio.src = playlist[currentTrack];
  audio.loop = false;

  renderPlaylistUI();


function playMusic() {
  audio.play();
}

function pauseMusic() {
  audio.pause();
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % playlist.length;
  audio.src = playlist[currentTrack];
  audio.play();
  renderPlaylistUI();
}

function prevTrack() {
  currentTrack =
    (currentTrack - 1 + playlist.length) % playlist.length;
  audio.src = playlist[currentTrack];
  audio.play();
  renderPlaylistUI();
}

function toggleMute() {
  audio.muted = !audio.muted;
}

function renderPlaylistUI() {

  const list = document.getElementById("playlistContainer");
  if (!list) return;

  list.innerHTML = "";

  playlist.forEach((track, index) => {

    const item = document.createElement("div");
    item.innerText = "Track " + (index + 1);
    item.style.cursor = "pointer";
    item.style.margin = "8px";
    item.style.padding = "6px";
    item.style.borderRadius = "10px";

    if (index === currentTrack) {
      item.style.fontWeight = "bold";
      item.style.background = "rgba(255,255,255,0.2)";
    }

    item.onclick = () => {
      currentTrack = index;
      audio.src = playlist[currentTrack];
      audio.play();
      renderPlaylistUI();
    };

    list.appendChild(item);
  });
}

/* =========================
   TYPEWRITER
========================= */

function typeWriter() {

  const el = document.getElementById("typewriter");
  if (!el) return;

  const text =
    "hi, i know how much of a jerk i have been... but i adore you deeply. i am sorry, truly. every part of me craves you.";

  let i = 0;

  const interval = setInterval(() => {
    el.innerHTML += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 40);

}

/* =========================
   REMARK SYSTEM
========================= */

function saveRemark() {

  const input = document.getElementById("remarkInput");
  const container = document.getElementById("remarksContainer");
  if (!input || !container) return;

  const remark = input.value.trim();
  if (remark === "") return;

  let remarks = JSON.parse(localStorage.getItem("remarks")) || [];
  remarks.push(remark);
  localStorage.setItem("remarks", JSON.stringify(remarks));

  input.value = "";
  loadRemarks();
}

function loadRemarks() {

  const container = document.getElementById("remarksContainer");
  if (!container) return;

  container.innerHTML = "";

  let remarks = JSON.parse(localStorage.getItem("remarks")) || [];

  remarks.forEach(r => {
    const p = document.createElement("p");
    p.textContent = r;
    container.appendChild(p);
  });

}

/* =========================
   FLOWER RAIN
========================= */

function startFlowerRain() {

  const container = document.getElementById("flowerContainer");
  if (!container) return;

  const flowers = ["🌻","🌸","🌷","🌼"];

  for (let i = 0; i < 35; i++) {

    const flower = document.createElement("div");
    flower.classList.add("fallingFlower");
    flower.innerText = flowers[Math.floor(Math.random()*flowers.length)];

    flower.style.left = Math.random() * 100 + "vw";
    flower.style.animationDuration = (Math.random() * 3 + 3) + "s";

    container.appendChild(flower);

    setTimeout(() => flower.remove(), 6000);
  }
}

/* =========================
   STAR RATING
========================= */

function openStarModal() {
  const modal = document.getElementById("starModal");
  if (modal) modal.classList.remove("hidden");
}

function closeStarModal() {
  const modal = document.getElementById("starModal");
  if (modal) modal.classList.add("hidden");
}

function setupStars() {

  const container = document.getElementById("starContainer");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {

    const star = document.createElement("span");
    star.innerHTML = "★";

    star.addEventListener("click", () => {
      highlightStars(i);
      showMessage(i);
      localStorage.setItem("rating", i);
    });

    container.appendChild(star);
  }
}

function highlightStars(value) {

  const stars = document.querySelectorAll("#starContainer span");

  stars.forEach((star, index) => {
    star.style.color = index < value ? "gold" : "#ccc";
  });
}

function showMessage(value) {

  const messages = {
    1: "Riz,Fuck-off",
    2: "Not Enough to impress me",
    3: "Maybe i will go for a stroll..",
    4: "movie works for me",
    5: "alright, you deserve some hickeys"
  };

  const msg = document.getElementById("ratingMessage");
  if (msg) msg.innerText = messages[value];
}

function restoreRating() {

  const saved = localStorage.getItem("rating");
  if (!saved) return;

  highlightStars(parseInt(saved));
  showMessage(parseInt(saved));
}
/* =========================
   INIT MUSIC
========================= */

function initMusic() {

  if (!localStorage.getItem("unlocked")) return;

  const theme = localStorage.getItem("theme") || "maxton";

  const playlists = {
    summer: [
      "assets/songs/summer/1.mp3",
      "assets/songs/summer/2.mp3",
      "assets/songs/summer/3.mp3"
    ],
    vampire: [
      "assets/songs/vampire/1.mp3",
      "assets/songs/vampire/2.mp3",
      "assets/songs/vampire/3.mp3"
    ],
    maxton: [
      "assets/songs/maxton/1.mp3",
      "assets/songs/maxton/2.mp3",
      "assets/songs/maxton/3.mp3"
    ]
  };

  playlist = playlists[theme];

  // Only load if audio is not already playing something
  if (!audio.src || !audio.src.includes(theme)) {
    currentTrack = 0;
    audio.src = playlist[currentTrack];
  }

  renderPlaylistUI();
}
function renderPlaylistUI() {

  const list = document.getElementById("playlistContainer");
  if (!list) return;

  list.innerHTML = "";

  playlist.forEach((track, index) => {

    const item = document.createElement("div");
    item.innerText = "Track " + (index + 1);
    item.style.cursor = "pointer";
    item.style.margin = "8px";

    if (index === currentTrack) {
      item.style.fontWeight = "bold";
    }

    item.onclick = () => {
      currentTrack = index;
      audio.src = playlist[currentTrack];
      audio.play();
      renderPlaylistUI();
    };

    list.appendChild(item);
  });
}
function revealText() {

  const text = document.getElementById("hiddenText");
  if (!text) return;

  text.classList.toggle("showHidden");

}