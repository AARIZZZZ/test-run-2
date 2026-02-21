/* =============================================
   CONFIG
============================================= */
const PASSWORD = "4utofu";

/* =============================================
   PATH HELPER (fixes GitHub Pages routing)
============================================= */
function getPath(page) {
  const base = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
  return base + page;
}

/* =============================================
   AUDIO (single instance, persistent)
============================================= */
let audio = window._siteAudio || (window._siteAudio = new Audio());
let playlist = [];
let currentTrack = 0;
let isPlaying = false;

/* =============================================
   DOMContentLoaded
============================================= */
document.addEventListener("DOMContentLoaded", () => {
  const isPasswordPage = window.location.pathname.includes("password");

  if (!isPasswordPage) {
    checkAuth();
    applyTheme();
    initMusic();
    setupStars();
    restoreRating();
    setupSidebar();
    typeWriter();
    loadRemarks();
    playApologySong();
  } else {
    applyTheme(); // keep gradient on lock screen too
  }
});

/* =============================================
   AUTH
============================================= */
function unlockSite() {
  const input = document.getElementById("passwordInput");
  const errMsg = document.getElementById("errorMsg");
  if (!input) return;

  if (input.value === PASSWORD) {
    localStorage.setItem("unlocked", "true");
    localStorage.setItem("autoplay", "true");
    window.location.href = getPath("home.html");
  } else {
    errMsg.innerText = "Wrong password 🔐";
    input.value = "";
    // Re-trigger shake animation
    errMsg.style.animation = "none";
    void errMsg.offsetWidth;
    errMsg.style.animation = "";
  }
}

// Allow Enter key on password page
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.getElementById("passwordInput")) {
    unlockSite();
  }
});

function checkAuth() {
  if (!localStorage.getItem("unlocked")) {
    window.location.href = getPath("password.html");
  }
}

function logout() {
  audio.pause();
  audio.src = "";
  isPlaying = false;
  localStorage.clear();
  window.location.href = getPath("password.html");
}

function goPage(page) {
  window.location.href = getPath(page);
}

/* =============================================
   SIDEBAR
============================================= */
function setupSidebar() {
  // Create sidebar HTML if it doesn't already exist
  if (document.getElementById("sidebar")) return;

  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  overlay.id = "sidebarOverlay";
  overlay.onclick = closeSidebar;

  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.id = "sidebar";
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h2>For Tofu ♡</h2>
      <p>your little corner of the internet</p>
    </div>
    <nav class="sidebar-nav">
      <a onclick="goPage('gallery.html')">
        <span class="nav-icon">🖼</span>
        <span class="nav-label">Gallery</span>
      </a>
      <a onclick="goPage('apology.html')">
        <span class="nav-icon">💌</span>
        <span class="nav-label">Apology</span>
      </a>
      <a onclick="goPage('remark.html')">
        <span class="nav-icon">📝</span>
        <span class="nav-label">Leave a Remark</span>
      </a>
      <a onclick="goPage('music.html')">
        <span class="nav-icon">🎵</span>
        <span class="nav-label">Music Player</span>
      </a>
      <div class="sidebar-divider"></div>
      <a onclick="openThemeModal(); closeSidebar();">
        <span class="nav-icon">🎨</span>
        <span class="nav-label">Change Theme</span>
      </a>
      <a onclick="openStarModal(); closeSidebar();">
        <span class="nav-icon">⭐</span>
        <span class="nav-label">Rate Me</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <a onclick="logout()">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Logout</span>
      </a>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(sidebar);
}

function openSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("sidebarOverlay")?.classList.add("active");
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("active");
}

/* =============================================
   THEME
============================================= */
const themes = {
  summer: {
    bg: "linear-gradient(-45deg,#87CEEB,#FFD580,#ff9a9e,#fad0c4)",
    font: "'Great Vibes', cursive",
    buttonBg: "#ff9a3c",
    buttonHover: "#ff7b00"
  },
  vampire: {
    bg: "linear-gradient(-45deg,#000000,#2b0000,#8B0000,#1a0000)",
    font: "'Cinzel', serif",
    buttonBg: "#8B0000",
    buttonHover: "#a30000"
  },
  maxton: {
    bg: "linear-gradient(-45deg,#ff9ecb,#7da7ff,#c471f5,#fa71cd)",
    font: "'Poppins', sans-serif",
    buttonBg: "#ff4fa3",
    buttonHover: "#ff2e91"
  }
};

function changeTheme(theme) {
  localStorage.setItem("theme", theme);
  window._activeTheme = null; // force initMusic to treat this as a new theme
  applyTheme();
  initMusic();
  closeThemeModal();
}

function applyTheme() {
  const theme = localStorage.getItem("theme") || "maxton";
  const t = themes[theme] || themes.maxton;
  const r = document.documentElement;
  r.style.setProperty("--bg", t.bg);
  r.style.setProperty("--font-main", t.font);
  r.style.setProperty("--button-bg", t.buttonBg);
  r.style.setProperty("--button-hover", t.buttonHover);
}

function openThemeModal() {
  document.getElementById("themeModal")?.classList.remove("hidden");
}

function closeThemeModal() {
  document.getElementById("themeModal")?.classList.add("hidden");
}

/* =============================================
   MUSIC PLAYER  ← FIXED
============================================= */
const playlists = {
  summer:  ["assets/songs/summer/1.mp3","assets/songs/summer/2.mp3","assets/songs/summer/3.mp3"],
  vampire: ["assets/songs/vampire/1.mp3","assets/songs/vampire/2.mp3","assets/songs/vampire/3.mp3"],
  maxton:  ["assets/songs/maxton/1.mp3","assets/songs/maxton/2.mp3","assets/songs/maxton/3.mp3"]
};

const trackNames = {

  summer:  ["West Coast","Steal My Girl","Paper Rings"],

  vampire: ["Arabella","Earned It","Sweater Weather"],

  maxton:  ["Apocalypse","Do I Wanna Know?","Moth To A Flame"]

};

function initMusic() {
  if (!localStorage.getItem("unlocked")) return;

  const theme = localStorage.getItem("theme") || "maxton";
  const newPlaylist = playlists[theme];

  // Always reset playlist when theme changes
  const lastTheme = window._activeTheme;
  if (lastTheme !== theme) {
    window._activeTheme = theme;
    playlist = newPlaylist;
    currentTrack = 0;
    const wasPlaying = isPlaying;
    audio.pause();
    audio.src = playlist[currentTrack];
    audio.load();
    audio.loop = false;
    audio.preload = "auto";
    // Resume playing if music was already going
    if (wasPlaying) {
      audio.play().then(() => { isPlaying = true; updatePlayerUI(); }).catch(() => {});
    }
  } else {
    // Same theme, just make sure playlist reference is current
    playlist = newPlaylist;
  }

  // Auto-advance tracks
  audio.onended = nextTrack;

  // Autoplay after login
  if (localStorage.getItem("autoplay") === "true") {
    localStorage.removeItem("autoplay");
    audio.play().then(() => {
      isPlaying = true;
      updatePlayerUI();
    }).catch(() => {
      // Browser blocked — set flag so user click will resume
      isPlaying = false;
    });
  }

  renderPlaylistUI();
  updatePlayerUI();
  startProgressUpdater();
}

function playMusic() {
  if (playlist.length === 0) return;
  if (!audio.src || audio.src === window.location.href) {
    audio.src = playlist[currentTrack];
  }
  audio.play().then(() => {
    isPlaying = true;
    updatePlayerUI();
  });
}

function pauseMusic() {
  audio.pause();
  isPlaying = false;
  updatePlayerUI();
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % playlist.length;
  audio.src = playlist[currentTrack];
  audio.play().then(() => {
    isPlaying = true;
    updatePlayerUI();
    renderPlaylistUI();
  });
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  audio.src = playlist[currentTrack];
  audio.play().then(() => {
    isPlaying = true;
    updatePlayerUI();
    renderPlaylistUI();
  });
}

function toggleMute() {
  audio.muted = !audio.muted;
  const btn = document.getElementById("muteBtn");
  if (btn) btn.textContent = audio.muted ? "🔇" : "🔊";
}

function setVolume(val) {
  audio.volume = val;
}

function seekTo(e) {
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
}

function startProgressUpdater() {
  if (window._progressInterval) clearInterval(window._progressInterval);
  window._progressInterval = setInterval(() => {
    const bar = document.querySelector(".progress-bar");
    if (!bar || !audio.duration) return;
    bar.style.width = (audio.currentTime / audio.duration * 100) + "%";
  }, 800);
}

function updatePlayerUI() {
  const theme = localStorage.getItem("theme") || "maxton";
  const names = trackNames[theme] || trackNames.maxton;

  const nameEl = document.querySelector(".music-track-name");
  const subEl  = document.querySelector(".music-track-sub");
  const art    = document.querySelector(".music-album-art");
  const playBtn = document.getElementById("playPauseBtn");

  if (nameEl) nameEl.textContent = names[currentTrack] || `Track ${currentTrack + 1}`;
  if (subEl)  subEl.textContent  = `Track ${currentTrack + 1} of ${playlist.length}`;
  if (art)    art.classList.toggle("playing", isPlaying);
  if (playBtn) playBtn.textContent = isPlaying ? "⏸" : "▶";

  renderPlaylistUI();
}

function renderPlaylistUI() {
  const list = document.getElementById("playlistContainer");
  if (!list) return;

  const theme = localStorage.getItem("theme") || "maxton";
  const names = trackNames[theme] || trackNames.maxton;

  list.innerHTML = "";
  playlist.forEach((_, i) => {
    const item = document.createElement("div");
    item.className = "playlist-item" + (i === currentTrack ? " active" : "");
    item.innerHTML = `
      <span class="track-num">${i === currentTrack ? "▶" : (i + 1)}</span>
      <span>${names[i] || "Track " + (i + 1)}</span>
    `;
    item.onclick = () => {
      currentTrack = i;
      audio.src = playlist[i];
      audio.play().then(() => {
        isPlaying = true;
        updatePlayerUI();
      });
    };
    list.appendChild(item);
  });
}

/* =============================================
   APOLOGY SONG
============================================= */
function playApologySong() {
  if (!window.location.pathname.includes("apology")) return;

  // Fade out current theme music, then play the apology track
  const fadeOut = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume = Math.max(0, audio.volume - 0.05);
    } else {
      clearInterval(fadeOut);
      audio.pause();
      audio.volume = 1;
      audio.src = "assets/songs/apology.mp3";
      audio.loop = true;
      audio.play().catch(() => {});
      isPlaying = true;
    }
  }, 80);
}

/* =============================================
   TYPEWRITER
============================================= */
function typeWriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  const text = "hi, i know how much of a jerk i have been... but i adore you deeply. i am sorry, truly. every part of me craves you.";
  el.classList.add("typing-cursor");
  let i = 0;

  const interval = setInterval(() => {
    el.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      el.classList.remove("typing-cursor");
    }
  }, 42);
}

/* =============================================
   REVEAL TEXT
============================================= */
function revealText() {
  document.getElementById("hiddenText")?.classList.toggle("showHidden");
}

/* =============================================
   REMARK SYSTEM
============================================= */
function saveRemark() {
  const input = document.getElementById("remarkInput");
  if (!input) return;

  const remark = input.value.trim();
  if (!remark) return;

  let remarks = JSON.parse(localStorage.getItem("remarks") || "[]");
  remarks.unshift({ text: remark, date: new Date().toLocaleDateString() });
  localStorage.setItem("remarks", JSON.stringify(remarks));

  input.value = "";
  loadRemarks();
}

function loadRemarks() {
  const container = document.getElementById("remarksContainer");
  if (!container) return;

  const remarks = JSON.parse(localStorage.getItem("remarks") || "[]");
  container.innerHTML = "";

  remarks.forEach(r => {
    const card = document.createElement("div");
    card.className = "remark-card";
    const text = typeof r === "string" ? r : r.text;
    const date = typeof r === "object" && r.date ? r.date : "";
    card.innerHTML = `<p>${text}</p>${date ? `<div class="remark-date">${date}</div>` : ""}`;
    container.appendChild(card);
  });
}

/* =============================================
   FLOWER RAIN
============================================= */
function startFlowerRain() {
  const container = document.getElementById("flowerContainer");
  if (!container) return;

  const flowers = ["🌻","🌸","🌷","🌼","🌺","💐","🌹"];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const flower = document.createElement("div");
      flower.className = "fallingFlower";
      flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
      flower.style.left = Math.random() * 100 + "vw";
      flower.style.animationDuration = (Math.random() * 3 + 3) + "s";
      flower.style.animationDelay = "0s";
      container.appendChild(flower);
      setTimeout(() => flower.remove(), 7000);
    }, i * 80);
  }
}

/* =============================================
   GALLERY LIGHTBOX
============================================= */
function openLightbox(src) {
  let lb = document.getElementById("lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.id = "lightbox";
    lb.innerHTML = `
      <img id="lightboxImg" src="" alt="">
      <button class="lightbox-close" onclick="closeLightbox()">✕</button>
    `;
    lb.onclick = (e) => { if (e.target === lb) closeLightbox(); };
    document.body.appendChild(lb);
  }
  document.getElementById("lightboxImg").src = src;
  requestAnimationFrame(() => lb.classList.add("active"));
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.remove("active");
}

/* =============================================
   STAR RATING
============================================= */
function openStarModal() {
  document.getElementById("starModal")?.classList.remove("hidden");
}

function closeStarModal() {
  document.getElementById("starModal")?.classList.add("hidden");
}

function setupStars() {
  const container = document.getElementById("starContainer");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = "★";

    star.addEventListener("mouseover", () => highlightStars(i, true));
    star.addEventListener("mouseleave", () => {
      const saved = parseInt(localStorage.getItem("rating") || "0");
      highlightStars(saved, false);
    });
    star.addEventListener("click", () => {
      highlightStars(i, false);
      showMessage(i);
      localStorage.setItem("rating", i);
    });

    container.appendChild(star);
  }
}

function highlightStars(value, hover = false) {
  const stars = document.querySelectorAll("#starContainer span");
  stars.forEach((star, idx) => {
    star.style.color = idx < value ? "gold" : "rgba(255,255,255,0.25)";
    star.style.textShadow = idx < value ? "0 0 12px rgba(255,215,0,0.6)" : "none";
  });
}

function showMessage(value) {
  const messages = {
    1: "Riz, Fuck-off 😒",
    2: "Not enough to impress me 🙄",
    3: "Maybe I'll go for a stroll.. 🤔",
    4: "Movie works for me 🎬",
    5: "Alright, you deserve some hickeys 💋"
  };
  const msg = document.getElementById("ratingMessage");
  if (msg) msg.textContent = messages[value] || "";
}

function restoreRating() {
  const saved = localStorage.getItem("rating");
  if (!saved) return;
  const val = parseInt(saved);
  highlightStars(val, false);
  showMessage(val);
}
