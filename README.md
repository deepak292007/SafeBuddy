# SafeBuddy — AI-Powered Personal Safety Companion Platform 🛡️✨

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.9%2B-violet)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Production-emerald)](https://fastapi.tiangolo.com/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet.js-cyan)](https://leafletjs.com/)
[![UI Theme](https://img.shields.io/badge/Aesthetic-Luxury%20Dark-purple)](#design-system)

> **"Never Walk Alone."**  
> SafeBuddy is an AI-powered safety companion platform ("Uber for trusted personal safety") that lets users instantly book background-verified physical escorts instead of transportation. Built with a luxury dark aesthetic inspired by Apple, Stripe, Tesla, and Linear.app.

---

## 🌟 Key Features

- 🛡️ **Splash Screen**: Glowing 3D shield logo with particle canvas background and luxury dark glassmorphism.
- 🔒 **Biometric Authentication**: Phone OTP, 1-tap Google OAuth, Face ID scanner with laser scan overlay, and Fingerprint scanner simulator.
- 📍 **Interactive Safety Map**: Dynamic map displaying nearby verified escorts, police safe havens, and crime heatmaps.
- 👥 **8 Companion Categories**:
  - *Walking Companion*
  - *Bike Companion*
  - *Car Companion*
  - *Hospital Escort*
  - *Shopping Escort*
  - *Event Companion*
  - *Elderly Assist*
  - *Night Shift Escort*
- 👤 **Companion Profiles**: Police background verification badges, government ID verification, ratings, experience stats, and spoken languages.
- ⚡ **Multi-Step Booking Flow**: Route selector, duration slider, gender & language preferences, real-time AI Safety Score algorithm, and price estimator.
- 🛰️ **Live Trip Tracking**: Moving companion marker along safe routes, real-time ETA countdown, encrypted live chat simulator, and Web Audio waveform recorder.
- 🧠 **AI Safety Center**: Crime heatmap overlay, safe route recommendations, nearby police/hospital directory, and predictive risk alerts.
- 🚨 **Emergency SOS Center**: 1-Tap SOS pulse button, fake incoming call simulator with custom ringing tones, strobe flashlight, and live video stream simulator.
- 🚗 **Companion Dashboard (Driver Mode)**: Online/offline toggle, job request alert drawer with countdown timer, today's earnings widget, and turn-by-turn navigation HUD.
- 📊 **Admin Command Center**: Platform KPIs ($1.42M ARR, 128K Users), Chart.js revenue & category graphs, and live active session triage table.

---

## 📐 Technology Architecture

```
                       ┌─────────────────────────┐
                       │   SafeBuddy Web App     │
                       │ (HTML5 / Vanilla CSS)   │
                       └────────────┬────────────┘
                                    │
                               REST / WebSockets
                                    │
                       ┌────────────▼────────────┐
                       │  Python FastAPI Server  │
                       │    (server.py / API)    │
                       └────┬──────────────┬─────┘
                            │              │
       ┌────────────────────▼────┐    ┌────▼────────────────────┐
       │   PostgreSQL + PostGIS  │    │  Redis Geo-Spatial      │
       │ (Encrypted Geo-Storage) │    │  (Sub-10ms Pub/Sub)    │
       └─────────────────────────┘    └─────────────────────────┘
```

- **Backend**: Python 3 standard library / FastAPI / Uvicorn
- **Frontend**: HTML5, Vanilla CSS Design System, ES6 JavaScript
- **Maps Engine**: Leaflet.js with Dark Mode vector styling
- **Analytics & Visuals**: Chart.js, Lucide Icons, Canvas Particle Physics API
- **Biometrics & Audio**: Web Audio API Synthesizer, CSS Keyframe Viewfinder Scan

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/safebuddy.git
cd safebuddy
```

### 2. Run the Server
```bash
python server.py
```

### 3. Open in Browser
Navigate to **`http://localhost:8080`** in your browser.

---

## 📂 Project Structure

```
safebuddy/
├── assets/
│   ├── safebuddy_logo.jpg           # Official 3D Shield Brand Logo
│   ├── police_verified_badge.jpg    # 3D Police Verification Seal
│   ├── female_escort.jpg            # Formal Female Escort Portrait
│   └── male_escort.jpg              # Formal Male Escort Portrait
├── index.html                       # Single-Page Web App Shell (All 10 Views)
├── styles.css                       # Luxury Dark Design System & Glassmorphism
├── app.js                           # Interactive JS Logic & API Integrations
├── server.py                        # Python REST API Server
├── README.md                        # Documentation
├── LICENSE                          # MIT License
└── .gitignore                       # Git ignore file
```

---

## 📡 API Reference Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/status` | `GET` | System health check (AI Safety Engine, Redis, PostGIS) |
| `/api/auth/otp` | `POST` | Phone OTP authentication & JWT token generation |
| `/api/auth/biometrics` | `POST` | Face ID & Fingerprint vector scan verification |
| `/api/companions/nearby` | `GET` | Geo-spatial query returning active verified companions |
| `/api/bookings/create` | `POST` | Dispatches companion, calculates AI route score, and creates booking record |
| `/api/chat/send` | `POST` | Encrypted chat response stream |
| `/api/emergency/sos` | `POST` | Critical SOS broadcast & armed police dispatch trigger |
| `/api/admin/metrics` | `GET` | Returns live platform telemetry & revenue analytics |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
