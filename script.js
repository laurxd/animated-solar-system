// === CANVAS SETUP ===
const canvas = document.getElementById("solarCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const playAudioBtn = document.getElementById("playAudioBtn");
const volumeSlider = document.getElementById("volumeSlider");

let hoveredPlanet = null;
let isPaused = false;
let speedMultiplier = 1;

// === AUDIO API SETUP ===
let audioCtx;
let audioElement;
let track;
let isAudioPlaying = false;

// Initialize Audio Context on user interaction
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio("assets/audio/space-ambient-351305.mp3");
    audioElement.loop = true;
    audioElement.volume = parseFloat(volumeSlider.value);

    track = audioCtx.createMediaElementSource(audioElement);
    track.connect(audioCtx.destination);
  }
}

// Toggle Play / Pause
playAudioBtn.addEventListener("click", async () => {
  initAudio();
  if (!isAudioPlaying) {
    await audioCtx.resume();
    audioElement.play();
    isAudioPlaying = true;
    playAudioBtn.textContent = "Pause Audio";
  } else {
    audioElement.pause();
    isAudioPlaying = false;
    playAudioBtn.textContent = "Play / Pause Audio";
  }
});

// Volume Control
volumeSlider.addEventListener("input", (e) => {
  if (audioElement) audioElement.volume = parseFloat(e.target.value);
});

// === RESIZE HANDLER ===
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.7;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  sun.x = centerX;
  sun.y = centerY;
}
window.addEventListener("resize", resizeCanvas);

// === CENTER + SUN ===
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
const sun = { x: centerX, y: centerY, radius: 40, color: "yellow" };
let pulse = 0;

// === PLANETS ===
const planets = [
  { name: "Mercury", radius: 6, distance: 70, color: "#b1b1b1", speed: 0.04, angle: 0 },
  { name: "Venus", radius: 9, distance: 110, color: "#e6b800", speed: 0.03, angle: 0 },
  { name: "Earth", radius: 10, distance: 160, color: "#0077ff", speed: 0.02, angle: 0 },
  { name: "Mars", radius: 8, distance: 200, color: "#ff3c00", speed: 0.017, angle: 0 },
  { name: "Jupiter", radius: 20, distance: 260, color: "#ffb347", speed: 0.009, angle: 0 },
];

// === STARS ===
const stars = Array.from({ length: 100 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 1.5,
  opacity: Math.random(),
}));

function drawBackground() {
  const g = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width / 2);
  g.addColorStop(0, "#000022");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  for (let s of stars) {
    s.opacity += (Math.random() - 0.5) * 0.03;
    s.opacity = Math.max(0.2, Math.min(1, s.opacity));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
    ctx.fill();
  }
}

function drawSun() {
  pulse += 0.05;
  const dynamicRadius = sun.radius + Math.sin(pulse) * 2;
  const grad = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, dynamicRadius);
  grad.addColorStop(0, "#fff8b5");
  grad.addColorStop(1, sun.color);
  ctx.shadowBlur = 35;
  ctx.shadowColor = "#ffea00";
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, dynamicRadius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// === PLANETS + LABELS ===
function drawPlanets(update = true) {
  for (let planet of planets) {
    const x = sun.x + Math.cos(planet.angle) * planet.distance;
    const y = sun.y + Math.sin(planet.angle) * planet.distance;

    ctx.beginPath();
    ctx.arc(sun.x, sun.y, planet.distance, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.shadowBlur = 10;
    ctx.shadowColor = planet.color;

    ctx.beginPath();
    ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = "12px Segoe UI";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "center";
    ctx.fillText(planet.name, x, y - planet.radius - 10);

    if (hoveredPlanet === planet) {
      ctx.beginPath();
      ctx.arc(x, y, planet.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.stroke();

      ctx.font = "13px Segoe UI";
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(x + 20, y - 25, 120, 45);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${planet.name}`, x + 80, y - 5);
      ctx.fillText(`Distance: ${planet.distance}`, x + 80, y + 10);
    }

    if (update) planet.angle += planet.speed * speedMultiplier;
  }
}

// === MAIN LOOP ===
function animate() {
  if (!isPaused) {
    ctx.fillStyle = "rgba(0, 0, 16, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawStars();
    drawSun();
    drawPlanets(true);
  }
  requestAnimationFrame(animate);
}
animate();

// === CONTROLS ===
startBtn.addEventListener("click", () => {
  isPaused = false;
  if (!isAudioPlaying) playAudioBtn.click(); // optional auto-play sound
});
pauseBtn.addEventListener("click", () => (isPaused = true));

// === SPEED SLIDER ===
const slider = document.createElement("input");
slider.type = "range";
slider.min = "0.5";
slider.max = "2";
slider.step = "0.1";
slider.value = "1";
slider.className = "form-range w-50 mt-3";
canvas.parentNode.appendChild(slider);
slider.addEventListener("input", (e) => (speedMultiplier = parseFloat(e.target.value)));

// === FULLSCREEN ===
let isExpanded = false;
const fadeOverlay = document.createElement("div");
fadeOverlay.style.position = "fixed";
fadeOverlay.style.top = "0";
fadeOverlay.style.left = "0";
fadeOverlay.style.width = "100%";
fadeOverlay.style.height = "100%";
fadeOverlay.style.background = "#000";
fadeOverlay.style.opacity = "0";
fadeOverlay.style.transition = "opacity 0.5s ease";
fadeOverlay.style.pointerEvents = "none";
document.body.appendChild(fadeOverlay);

const fsIcon = document.createElement("div");
fsIcon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white"
  class="bi bi-arrows-fullscreen" viewBox="0 0 16 16" style="cursor:pointer;">
    <path fill-rule="evenodd"
    d="M1 1v5h1V2.707l4.146 4.147.708-.708L2.707 2H6V1H1zm14 0h-5v1h3.293l-4.147 
    4.146.708.708L14 2.707V6h1V1zM1 15h5v-1H2.707l4.147-4.146-.708-.708L2 
    13.293V10H1v5zm14 0v-5h-1v3.293l-4.146-4.147-.708.708L13.293 14H10v1h5z"/>
  </svg>`;
fsIcon.style.position = "fixed";
fsIcon.style.bottom = "20px";
fsIcon.style.right = "30px";
fsIcon.style.zIndex = "1000";
fsIcon.style.opacity = "0.7";
fsIcon.style.transition = "opacity 0.3s";
fsIcon.onmouseenter = () => (fsIcon.style.opacity = "1");
fsIcon.onmouseleave = () => (fsIcon.style.opacity = "0.7");
document.body.appendChild(fsIcon);

function toggleFullscreen() {
  fadeOverlay.style.opacity = "1";
  setTimeout(() => {
    if (!isExpanded) {
      canvas.style.transition = "all 0.6s ease";
      canvas.style.transformOrigin = "center center";
      canvas.style.transform = "scale(1.5)";
      canvas.style.zIndex = "999";
      fsIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white"
        class="bi bi-fullscreen-exit" viewBox="0 0 16 16" style="cursor:pointer;">
          <path fill-rule="evenodd"
          d="M1 1v5h1V2.707l4.146 4.147.708-.708L2.707 
          2H6V1H1zm14 0h-5v1h3.293l-4.147 
          4.146.708.708L14 2.707V6h1V1zM1 
          15h5v-1H2.707l4.147-4.146-.708-.708L2 
          13.293V10H1v5zm14 0v-5h-1v3.293l-4.146-4.147-.708.708L13.293 
          14H10v1h5z"/>
        </svg>`;
      isExpanded = true;
    } else {
      canvas.style.transition = "all 0.6s ease";
      canvas.style.transform = "scale(1)";
      canvas.style.zIndex = "1";
      fsIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white"
        class="bi bi-arrows-fullscreen" viewBox="0 0 16 16" style="cursor:pointer;">
          <path fill-rule="evenodd"
          d="M1 1v5h1V2.707l4.146 4.147.708-.708L2.707 
          2H6V1H1zm14 0h-5v1h3.293l-4.147 
          4.146.708.708L14 2.707V6h1V1zM1 
          15h5v-1H2.707l4.147-4.146-.708-.708L2 
          13.293V10H1v5zm14 0v-5h-1v3.293l-4.146-4.147-.708.708L13.293 
          14H10v1h5z"/>
        </svg>`;
      isExpanded = false;
    }
    fadeOverlay.style.opacity = "0";
  }, 250);
}

fsIcon.addEventListener("click", toggleFullscreen);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isExpanded) toggleFullscreen();
});

// === MOUSE HOVER DETECTION ===
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  hoveredPlanet = null;

  for (let p of planets) {
    const x = sun.x + Math.cos(p.angle) * p.distance;
    const y = sun.y + Math.sin(p.angle) * p.distance;
    const dx = mouseX - x;
    const dy = mouseY - y;
    if (Math.sqrt(dx * dx + dy * dy) < p.radius + 5) {
      hoveredPlanet = p;
      break;
    }
  }

  if (isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawStars();
    drawSun();
    drawPlanets(false);
  }
});

// === INIT ===
resizeCanvas();
