# ChatKroo — Frontend

[![CI](https://github.com/Palenzo/Frontend-Chat-App-Mern/actions/workflows/ci.yml/badge.svg)](https://github.com/Palenzo/Frontend-Chat-App-Mern/actions/workflows/ci.yml)

The React + Vite client for **ChatKroo** — real-time messaging, WebRTC audio/video
calling, group chats, file sharing, an AI assistant ("Binod"), and an admin
dashboard.

> **Backend repo:** [Backend-Chat-App-Mern](https://github.com/Palenzo/Backend-Chat-App-Mern) — Express + Socket.IO + MongoDB, deployed on Render.
> This frontend is deployed on **Vercel**.

---

## ✨ Features

- **Auth** — register (with avatar) and login against the cookie-based backend.
- **Real-time chat** — messages, typing indicators, online presence, unread badges.
- **WebRTC calling** — 1:1 audio & video, signaled over Socket.IO (no third-party SDK).
- **Groups** — create, rename, add/remove members, leave, delete.
- **Friends** — search users, send and accept friend requests.
- **AI assistant** — chat with "Binod" right in your chat list.
- **Theming** — light/dark mode and custom chat wallpapers, persisted locally.
- **Admin dashboard** — stats and user/chat/message management.

## 🧱 Tech stack

| Area       | Tech                                       |
| ---------- | ------------------------------------------ |
| Framework  | React 19 + Vite                            |
| UI         | MUI 7 + Emotion, Framer Motion             |
| State/data | Redux Toolkit + RTK Query                  |
| Realtime   | Socket.IO client, native WebRTC            |
| Charts     | Chart.js + react-chartjs-2                 |
| Tooling    | ESLint 9 (flat), Vitest + Testing Library  |

## 🎨 Design system

Color, radius, elevation, and the signature brand gradient live in
[`src/theme/tokens.js`](./src/theme/tokens.js) and feed the MUI theme in
[`src/context/ThemeContext.jsx`](./src/context/ThemeContext.jsx). Use these tokens
instead of hard-coding gradients or hex values, so light/dark modes and the brand
stay consistent.

## 🏗 Project structure

```
src/
  pages/            Route screens (Home, Chat, Groups, Login, admin/*)
  components/
    layout/         AppLayout HOC, Header, ChatHeader, Loaders
    shared/         Reusable presentational pieces
    specific/       Feature widgets (ChatList, Search, Notifications, ...)
    dialogs/        Modals (calls, file menu, member/group dialogs)
    auth/           Route protection
  context/          ThemeContext, WebRTCContext (calling)
  redux/            store, RTK Query api, slices, admin thunks
  theme/            Design tokens
  hooks/            Shared hooks (errors, async mutations, socket events)
  constants/        config, socket event names, colors
  lib/ · utils/     Helpers and validators
```

## 🚀 Getting started

### Prerequisites
- Node.js ≥ 18 (CI uses Node 20)
- A running [ChatKroo backend](https://github.com/Palenzo/Backend-Chat-App-Mern)

### Setup

```bash
git clone https://github.com/Palenzo/Frontend-Chat-App-Mern.git
cd Frontend-Chat-App-Mern
npm install
cp .env.example .env   # set VITE_SERVER to your backend URL
npm run dev
```

Open `http://localhost:5173`.

## 🔑 Environment variables

| Variable      | Required | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| `VITE_SERVER` | yes      | Base URL of the backend API + Socket.IO (no trailing slash).  |

See [`.env.example`](./.env.example).

## 📜 Scripts

| Script            | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Lint with ESLint             |
| `npm test`        | Run the Vitest suite         |

## ☁️ Deployment (Vercel)

- **Framework preset:** Vite
- **Build command:** `npm run build` · **Output dir:** `dist`
- Set `VITE_SERVER` to your Render backend URL in Vercel project settings.
- SPA routing is handled by [`vercel.json`](./vercel.json) (rewrites all paths to `index.html`).
- The backend must allow this origin via its `CLIENT_URL` (CORS + cross-site cookies).

## 🧪 CI

GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) installs,
lints, tests, and builds on every push and PR.

## 📄 License

MIT
