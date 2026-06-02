# MoodStream 🎵✨

MoodStream is a premium, immersive mood-based music and video streaming web application. Express your current mood, discover tailored bilingual tracks, search with typo-tolerant fuzzy logic, and stream full-length songs via custom YouTube integration. 

The application is built on a modern glassmorphic theme and is fully compliant as an installable **Progressive Web App (PWA)** for both desktop and mobile devices.

---

## 🚀 Key Features

### 1. 📺 Dedicated "Now Playing" Screen (`/now-playing`)
*   **Immersive Visuals**: Pushes standard player controls to a full-screen layout featuring a large spinning record visualizer, seek progress bar, volume controls, and repeat/shuffle toggles.
*   **Uninterrupted Playback**: Keep the background HTML5 audio and YouTube player engines continuously mounted, maintaining smooth, uninterrupted streams during route transitions.
*   **Audio/Video Toggle**: Play track audio in the background or expand a large aspect-ratio YouTube player to center-stage.
*   **Smooth Mini-Player Transitions**: Click the persistent bottom player bar to slide back into the full-screen visualizer panel.

### 2. 🔐 Two-Step Registration & Forgot Password (Email OTP)
*   **Verification Engine**: Generates secure 6-digit verification codes sent via real SMTP emails (Gmail/Nodemailer support) with a 5-minute timeout.
*   **Local Console Logging**: Prominently logs verification codes to the server terminal console for frictionless local development.
*   **Forgot Password recovery**: Users can securely request reset codes sent to their email to set new passwords.
*   **Verification Lockout**: Locks out unverified accounts and redirects them to the verification step.

### 3. 🔍 typo-tolerant Fuzzy Search
*   **Dynamic Search-As-You-Type**: Debounces search queries (400ms) for instantaneous, live catalog filters.
*   **Levenshtein Distance Scoring**: Employs fuzzy character edit-distance matches so approximate inputs (e.g. searching `"puspha"` for `"Pushpa"`, `"sreya"` for `"Shreya"`, or `"tum hi"` for `"Tum Hi Ho"`) return the closest catalog songs instead of empty results.
*   **Bilingual Category Filters**: Instantly filters catalog recommendations by language flags (**All Languages**, **English**, **Indian**).

### 4. 🛟 Database Auto-Fallback
*   **In-Memory Database**: If a local MongoDB instance is offline or not installed, the application automatically boots into in-memory mock constructors for Users, Playlists, and Libraries.
*   **Instant Testing**: Enables full registration, login, verification, and playlist curation CRUD operations out-of-the-box.

### 5. 📲 Progressive Web App (PWA)
*   **Standalone Window**: Hides browser toolbars and addresses for native app window display.
*   **Custom High-Res Icons**: Ships with sleek, neon-style music note app shortcut icons for iOS/Android home screens.
*   **Service Worker Caching**: Registers `sw.js` for offline asset management.
*   **Inline "Install App" Button**: Intercepts install prompts to render a custom emerald-to-cyan install button in the navigation header.

---

## 🛠️ Tech Stack
*   **Frontend**: React (Vite), React Router, Axios, Lucide React (Icons).
*   **Backend**: Node.js, Express, Nodemailer.
*   **Database**: Mongoose / MongoDB (with seamless In-Memory Fallback utility).
*   **Media Engines**: HTML5 Audio & YouTube IFrame Player SDK.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB (Optional, fallback database mode will start if offline)

### 2. Quick Start
1.  **Install dependencies** across root, server, and client:
    ```bash
    npm run install-all
    ```
2.  **Configure environment variables**:
    Create a `.env` file in the root folder (or inside `/server`) with the following fields:
    ```env
    PORT=5000
    JWT_SECRET=your_super_jwt_secret_key
    
    # SMTP Email Configuration (For OTPs)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-gmail-app-password
    
    # (Optional) Spotify Credentials
    SPOTIFY_CLIENT_ID=your_spotify_id
    SPOTIFY_CLIENT_SECRET=your_spotify_secret
    ```
3.  **Run Development Server**:
    Launch both backend and frontend servers concurrently:
    ```bash
    npm run dev
    ```
4.  **Open the App**:
    *   **Local**: [http://localhost:5173/](http://localhost:5173/)
    *   **Mobile Network**: Look at the terminal output to scan the local Wi-Fi IP address URL (e.g. `http://192.168.X.X:5173/`).

---

## 📂 Project Structure
```
├── client/
│   ├── public/             # PWA manifest, sw.js, and high-res app icons
│   └── src/
│       ├── components/     # Player, Navbar, SongCard, MoodCard
│       ├── context/        # AuthState & user session wrappers
│       ├── pages/          # Home, Playlist, Login, Register, ForgotPassword, ResetPassword
│       └── services/       # Axios API config
├── server/
│   ├── config/             # DB connection hooks
│   ├── controllers/        # Auth, Music, and YouTube-scraper logic
│   ├── models/             # User and Playlist schemas
│   ├── routes/             # Router mappings
│   ├── utils/              # otpSender, dbManager, and moodMapper catalog
│   └── server.js           # Server boot entry point
└── package.json            # Dev scripts (concurrent runner)
```
