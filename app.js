/* ==========================================================================
   SAFEBUDDY - LUXURY DARK INTERACTIVE APPLICATION JS (STANDALONE + API)
   ========================================================================== */

// Global State Management
const AppState = {
  currentView: 'viewSplash',
  currentRole: 'user',
  activeMap: null,
  trackingMap: null,
  safetyMap: null,
  companionMarker: null,
  trackingInterval: null,
  adminChartsInitialized: false,
  revChart: null,
  catChart: null,
  flashlightActive: false,
  bookingData: {
    pickup: 'Market St & 4th St, San Francisco, CA',
    destination: 'Valencia St & 18th St, San Francisco, CA',
    category: 'Walking Companion',
    hours: 2,
    price: 47.00
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initAudioVisualizer();
  checkBackendHealth();
});

// Check Backend API Connectivity
async function checkBackendHealth() {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      const data = await res.json();
      console.log("SafeBuddy Backend API Status:", data);
    }
  } catch (err) {
    console.log("SafeBuddy running in Client Standalone Mode.");
  }
}

// --- PARTICLE BACKGROUND CANVAS ---
function initParticleCanvas() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(139, 92, 246, ' : 'rgba(6, 182, 212, ',
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#8B5CF6';
      ctx.fill();

      for (let j = idx + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// --- ROUTING / VIEW SWITCHER ---
function switchView(viewId) {
  const views = document.querySelectorAll('.app-view');
  views.forEach(view => view.classList.remove('active'));

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
    AppState.currentView = viewId;
  }

  // Update nav buttons
  const navBtns = document.querySelectorAll('.nav-tab-btn');
  navBtns.forEach(btn => {
    if (btn.getAttribute('data-view') === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Handle map invalidation and initialization when view opens
  setTimeout(() => {
    if (viewId === 'viewHome') {
      initHomeMap();
      if (AppState.activeMap) AppState.activeMap.invalidateSize();
    } else if (viewId === 'viewLiveTracking') {
      initTrackingMap();
      if (AppState.trackingMap) AppState.trackingMap.invalidateSize();
    } else if (viewId === 'viewAISafety') {
      initSafetyMap();
      if (AppState.safetyMap) AppState.safetyMap.invalidateSize();
    } else if (viewId === 'viewAdmin') {
      initAdminCharts();
    }
  }, 150);
}

// --- ROLE SWITCHER ---
function setRole(role) {
  AppState.currentRole = role;

  const btnUser = document.getElementById('btnRoleUser');
  const btnComp = document.getElementById('btnRoleCompanion');
  const btnAdmin = document.getElementById('btnRoleAdmin');

  btnUser.classList.remove('active');
  btnComp.classList.remove('active');
  btnAdmin.classList.remove('active');

  if (role === 'user') {
    btnUser.classList.add('active');
    switchView('viewHome');
  } else if (role === 'companion') {
    btnComp.classList.add('active');
    switchView('viewCompanionDashboard');
  } else if (role === 'admin') {
    btnAdmin.classList.add('active');
    fetchAdminMetrics();
    switchView('viewAdmin');
  }
}

// --- BIOMETRIC & AUTHENTICATION ---
function setAuthTab(tab) {
  document.getElementById('tabOtp').classList.remove('active');
  document.getElementById('tabGoogle').classList.remove('active');

  if (tab === 'otp') {
    document.getElementById('tabOtp').classList.add('active');
  } else {
    document.getElementById('tabGoogle').classList.add('active');
    triggerGoogleAuth();
  }
}

async function triggerGoogleAuth() {
  try {
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'google_oauth' })
    });
    if (res.ok) {
      const data = await res.json();
      console.log("Google Auth API Response:", data);
    }
  } catch (err) {}
  alert("1-Tap Google OAuth Verified!");
  completeAuth();
}

async function completeAuth() {
  try {
    const phone = document.getElementById('authPhone').value;
    await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, otp: "8529" })
    });
  } catch (e) {}
  switchView('viewHome');
}

async function triggerFaceIDScan() {
  const overlay = document.getElementById('faceScanOverlay');
  overlay.classList.add('active');

  try {
    await fetch('/api/auth/biometrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_type: "Face ID" })
    });
  } catch (e) {}

  setTimeout(() => {
    overlay.classList.remove('active');
    completeAuth();
  }, 2200);
}

function triggerFingerprintScan() {
  alert("Fingerprint Sensor Active. Place thumb on screen sensor...");
  setTimeout(() => {
    alert("Biometric Signature Matched!");
    completeAuth();
  }, 800);
}

// --- MAP 1: HOME MAP ---
function initHomeMap() {
  if (AppState.activeMap) {
    AppState.activeMap.invalidateSize();
    return;
  }

  const mapElem = document.getElementById('homeMap');
  if (!mapElem) return;

  const sfLat = 37.7749;
  const sfLng = -122.4194;

  const map = L.map('homeMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([sfLat, sfLng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const userIcon = L.divIcon({
    className: 'custom-user-pin',
    html: `<div style="width: 24px; height: 24px; background: #8B5CF6; border: 3px solid #FFF; border-radius: 50%; box-shadow: 0 0 20px #8B5CF6;"></div>`,
    iconSize: [24, 24]
  });
  L.marker([sfLat, sfLng], { icon: userIcon }).addTo(map).bindPopup("<b>You are here</b><br>Elena Rostova").openPopup();

  const companions = [
    { name: "Sarah Jenkins", lat: 37.7780, lng: -122.4150 },
    { name: "Marcus Vance", lat: 37.7710, lng: -122.4230 },
    { name: "Aisha Patel", lat: 37.7760, lng: -122.4280 },
    { name: "Elena Cruz", lat: 37.7690, lng: -122.4110 }
  ];

  const companionIcon = L.divIcon({
    className: 'custom-companion-pin',
    html: `<div style="width: 18px; height: 18px; background: #06B6D4; border: 2px solid #FFF; border-radius: 50%; box-shadow: 0 0 15px #06B6D4;"></div>`,
    iconSize: [18, 18]
  });

  companions.forEach(c => {
    L.marker([c.lat, c.lng], { icon: companionIcon })
      .addTo(map)
      .bindPopup(`<b>${c.name}</b><br>Verified Escort • 0.3 miles`);
  });

  AppState.activeMap = map;
}

function toggleMapLayer(type) {
  document.getElementById('chipCompanions').classList.remove('active');
  document.getElementById('chipSafeHavens').classList.remove('active');
  document.getElementById('chipHeatmap').classList.remove('active');

  if (type === 'companions') {
    document.getElementById('chipCompanions').classList.add('active');
  } else if (type === 'havens') {
    document.getElementById('chipSafeHavens').classList.add('active');
    alert("Displaying Police Stations & 24/7 Hospitals on map.");
  } else {
    document.getElementById('chipHeatmap').classList.add('active');
    alert("Displaying AI Safety Heatmap Layer.");
  }
}

// --- COMPANION PROFILE MODAL / VIEW ---
function openCompanionProfile(name, photoPath) {
  document.getElementById('profileDetailName').innerText = name;
  if (photoPath) {
    document.getElementById('profileDetailImg').src = photoPath;
  }
  switchView('viewCompanionProfile');
}

// --- BOOKING ENGINE ---
function startBookingFlow(categoryName) {
  AppState.bookingData.category = categoryName;
  document.getElementById('selectCategory').value = categoryName;
  goToBookingStep(1);
  switchView('viewBooking');
}

function goToBookingStep(step) {
  document.getElementById('bookingStep1').style.display = 'none';
  document.getElementById('bookingStep2').style.display = 'none';
  document.getElementById('bookingStep3').style.display = 'none';

  document.getElementById('stepInd1').classList.remove('active');
  document.getElementById('stepInd2').classList.remove('active');
  document.getElementById('stepInd3').classList.remove('active');

  if (step === 1) {
    document.getElementById('bookingStep1').style.display = 'block';
    document.getElementById('stepInd1').classList.add('active');
  } else if (step === 2) {
    document.getElementById('bookingStep2').style.display = 'block';
    document.getElementById('stepInd2').classList.add('active');
  } else if (step === 3) {
    document.getElementById('bookingStep3').style.display = 'block';
    document.getElementById('stepInd3').classList.add('active');
    updatePriceEstimate();
  }
}

function updatePriceEstimate() {
  const hours = parseInt(document.getElementById('rangeHours').value);
  AppState.bookingData.hours = hours;
  document.getElementById('valHoursText').innerText = `${hours} Hours`;

  const total = (hours * 20) + 7.00;
  AppState.bookingData.price = total;
  document.getElementById('lblTotalPrice').innerText = `$${total.toFixed(2)}`;
}

async function confirmBookingAndLaunchTracking() {
  const pickup = document.getElementById('inputPickup').value;
  const destination = document.getElementById('inputDestination').value;
  const category = document.getElementById('selectCategory').value;
  const hours = AppState.bookingData.hours;

  try {
    await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: pickup,
        destination: destination,
        category: category,
        hours: hours
      })
    });
  } catch (err) {}

  switchView('viewLiveTracking');
}

// --- MAP 2: LIVE TRACKING MAP ---
function initTrackingMap() {
  if (AppState.trackingMap) {
    AppState.trackingMap.invalidateSize();
    return;
  }

  const mapElem = document.getElementById('trackingMap');
  if (!mapElem) return;

  const pickupLat = 37.7749;
  const pickupLng = -122.4194;

  const map = L.map('trackingMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([pickupLat, pickupLng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  const routePoints = [
    [37.7749, -122.4194],
    [37.7765, -122.4170],
    [37.7780, -122.4150]
  ];

  L.polyline(routePoints, { color: '#8B5CF6', weight: 5, opacity: 0.8, dashArray: '8, 8' }).addTo(map);

  const companionIcon = L.divIcon({
    className: 'custom-moving-pin',
    html: `<div style="width: 28px; height: 28px; background: #06B6D4; border: 3px solid #FFF; border-radius: 50%; box-shadow: 0 0 25px #06B6D4; display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 10px;">SJ</div>`,
    iconSize: [28, 28]
  });

  const marker = L.marker([37.7780, -122.4150], { icon: companionIcon }).addTo(map);
  AppState.companionMarker = marker;

  let step = 0;
  if (AppState.trackingInterval) clearInterval(AppState.trackingInterval);

  AppState.trackingInterval = setInterval(() => {
    step = (step + 1) % routePoints.length;
    const nextPt = routePoints[step];
    AppState.companionMarker.setLatLng(nextPt);
  }, 4000);

  AppState.trackingMap = map;
}

// --- CHAT SYSTEM ---
async function sendChatMessage() {
  const input = document.getElementById('chatInputText');
  const text = input.value.trim();
  if (!text) return;

  const msgBox = document.getElementById('chatMessagesBox');
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg outgoing';
  userMsg.innerText = text;
  msgBox.appendChild(userMsg);

  input.value = '';
  msgBox.scrollTop = msgBox.scrollHeight;

  let replyText = "Received! I'm watching your location live on GPS.";
  try {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) replyText = data.reply;
    }
  } catch (e) {}

  setTimeout(() => {
    const compMsg = document.createElement('div');
    compMsg.className = 'chat-msg incoming';
    compMsg.innerText = replyText;
    msgBox.appendChild(compMsg);
    msgBox.scrollTop = msgBox.scrollHeight;
  }, 1000);
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

// --- MAP 3: AI SAFETY MAP ---
function initSafetyMap() {
  if (AppState.safetyMap) {
    AppState.safetyMap.invalidateSize();
    return;
  }

  const mapElem = document.getElementById('safetyMap');
  if (!mapElem) return;

  const map = L.map('safetyMap', { zoomControl: false, attributionControl: false }).setView([37.7749, -122.4194], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  L.circle([37.7749, -122.4194], { color: '#10B981', fillColor: '#10B981', fillOpacity: 0.3, radius: 400 }).addTo(map);
  L.circle([37.7810, -122.4090], { color: '#F43F5E', fillColor: '#F43F5E', fillOpacity: 0.45, radius: 300 }).addTo(map);

  AppState.safetyMap = map;
}

// --- AUDIO WAVEFORM VISUALIZER ---
function initAudioVisualizer() {
  const canvas = document.getElementById('audioWaveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function renderWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#F43F5E';

    const time = Date.now() * 0.005;
    for (let i = 0; i < 20; i++) {
      const height = Math.sin(time + i * 0.4) * 10 + 12;
      ctx.fillRect(i * 7 + 5, 16 - height / 2, 4, height);
    }
    requestAnimationFrame(renderWave);
  }

  renderWave();
}

// --- EMERGENCY SUITE ---
async function triggerFullSOSAlert() {
  playSoundTone(880, 0.5);

  try {
    const res = await fetch('/api/emergency/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'MANUAL_SOS' })
    });
    if (res.ok) {
      const data = await res.json();
      alert(`🚨 EMERGENCY SOS DISPATCHED!\n\nStatus: ${data.status}\nMessage: ${data.message}\nPolice Unit: ${data.police_unit_id}`);
      return;
    }
  } catch (err) {}

  alert("🚨 EMERGENCY SOS BROADCAST ACTIVATED!\n\n1. Dispatched local armed patrol to your live GPS coordinates.\n2. Uploading encrypted audio/video to cloud security vault.\n3. Calling emergency contacts.");
}

function triggerFakeCall() {
  playSoundTone(440, 0.3);
  document.getElementById('fakeCallOverlay').classList.add('active');
}

function closeFakeCall() {
  document.getElementById('fakeCallOverlay').classList.remove('active');
}

function answerFakeCall() {
  alert("Fake Incoming Call Answered. Audio playback active: 'Hey, I am waiting for you right around the corner! Are you almost here?'");
  closeFakeCall();
}

function toggleFlashlight() {
  AppState.flashlightActive = !AppState.flashlightActive;
  if (AppState.flashlightActive) {
    document.body.style.backgroundColor = '#FFFFFF';
    setTimeout(() => { document.body.style.backgroundColor = 'var(--bg-darker)'; AppState.flashlightActive = false; }, 2000);
  }
}

function playSoundTone(freq, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// --- COMPANION DASHBOARD LOGIC ---
function toggleCompanionOnlineStatus() {
  alert("Companion status updated to Offline.");
}

function acceptCompanionJob() {
  alert("Job Accepted! Turning on turn-by-turn navigation HUD...");
  switchView('viewLiveTracking');
}

// --- ADMIN DASHBOARD CHARTS & METRICS ---
async function fetchAdminMetrics() {
  try {
    const res = await fetch('/api/admin/metrics');
    if (res.ok) {
      const data = await res.json();
      if (data.metrics) {
        document.getElementById('adminUsersVal').innerText = data.metrics.total_users.toLocaleString();
        document.getElementById('adminCompanionsVal').innerText = data.metrics.active_companions.toLocaleString();
        document.getElementById('adminRevVal').innerText = `$${data.metrics.monthly_revenue.toLocaleString()}`;
      }
    }
  } catch (e) {}
}

function initAdminCharts() {
  if (AppState.adminChartsInitialized) return;

  const ctxRev = document.getElementById('adminRevenueChart');
  if (ctxRev) {
    AppState.revChart = new Chart(ctxRev, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Monthly Revenue ($)',
          data: [420000, 680000, 890000, 1100000, 1250000, 1380000, 1428900],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  const ctxCat = document.getElementById('adminCategoryChart');
  if (ctxCat) {
    AppState.catChart = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: ['Walking', 'Night Escort', 'Car', 'Hospital', 'Bike'],
        datasets: [{
          data: [45, 25, 15, 10, 5],
          backgroundColor: ['#8B5CF6', '#06B6D4', '#6366F1', '#10B981', '#F59E0B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } } }
      }
    });
  }

  AppState.adminChartsInitialized = true;
}

// --- TECH ARCHITECTURE MODAL ---
function openArchModal() {
  document.getElementById('archModal').classList.add('active');
}

function closeArchModal() {
  document.getElementById('archModal').classList.remove('active');
}
