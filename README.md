<h1 align="center">gPhone</h1>

<p align="center">
  <b>A modern, open-source custom phone resource for FiveM</b> — <a href="https://gphone.site/">Live Demo</a><br/>
  Powered by TypeScript, Svelte 5, Vite, Tailwind CSS v4, and esbuild.
</p>

---

## Overview

**gPhone** is a feature-rich, open-source smartphone resource designed for FiveM servers. Built from the ground up using modern web technologies and a decoupled TypeScript architecture, gPhone provides a slick, realistic mobile experience for players and seamless framework integration for server developers.

---

## Key Features

### 📱 Applications & UI
- **Phone & Dialer**: Full contact dialing, active call management, and custom in-game phone prop animations.
- **Contacts**: Contact management with favoriting, custom avatars, and soft deletion.
- **Messages**: Individual and group messaging with support for image attachments directly linked to the photo gallery.
- **Mail System**: Dedicated email application with full database integration and unread status indicators.
- **Banking**: Dynamic bank card generation based on player citizen ID, live balance tracking, and transfer handling.
- **Photos & Camera**: In-game screenshot/camera integration, automatic image compression, gallery view, and attachment sharing.
- **Notes**: Full-featured note-taking app with instant saving.
- **Calculator**: Full mathematical calculator with an optimized touchscreen keypad layout.
- **Settings & Status**: Dynamic battery drain lifecycle with dead phone states, custom wallpaper support, and audio toggles.

### 🛠️ Backend & Core Architecture
- **Framework Bridge**: Built-in support for **QBX Core** (`qbx_core`) and **QBCore** (`qb-core`) with automatic player lookup and money handlers.
- **Inventory Integration**: Out-of-the-box support for `ox_inventory` item registration and removal.
- **Central Audit Logging**: Comprehensive action auditing (`gphone_audit_logs`) tracking archive, deletion, moderation, and participant events.
- **Animation & Control**: Client-side animation controllers, camera capture controllers, and freelook camera handling.

---

## Tech Stack

- **Frontend**: [Svelte 5](https://svelte.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [TypeScript](https://www.typescriptlang.org/)
- **Backend (Client/Server)**: TypeScript compiled via high-performance `esbuild` pipeline
- **Database**: MySQL / MariaDB via `oxmysql` with foreign keys, compound indexes, and status moderation
- **Package Manager**: `pnpm` Workspaces

---

## Requirements

Before installing, ensure your server environment meets the following requirements:

- **Node.js**: >= 20.x
- **pnpm**: >= 9.x
- **FiveM Artifacts**: Recommended recent server build
- **Dependencies**:
  - `oxmysql`
  - Framework: `qbx_core` or `qb-core`
  - *(Optional)* `ox_inventory`

---

## Installation & Setup

1. **Clone Repository**
   Clone or download `gphone` into your server's `resources` directory (e.g., `resources/[standalone]/gphone`).

2. **Database Setup**
   Import the [`gphone.sql`](gphone.sql) schema into your MySQL/MariaDB database. This creates all necessary tables including contacts, messages, photos, mail, notes, and audit logs.

3. **Install Dependencies & Build**
   Navigate to the resource directory and execute `pnpm` scripts:
   ```sh
   pnpm install
   pnpm build
   ```

4. **Resource Manifest**
   Ensure `gphone` is started in your `server.cfg`:
   ```cfg
   ensure oxmysql
   ensure qbx_core # or qb-core
   ensure gphone
   ```

---

## Development

gPhone uses `pnpm` workspaces for concurrent frontend and client/server development with live hot-reloading:

### Start Development Server
```sh
pnpm dev
```
This runs watch scripts for client/server bundles (`pnpm watch`) and the Vite web development server (`pnpm watch:web`) concurrently.

### Type Checking
Run type checks across all modules (client, server, and web):
```sh
pnpm typecheck
```

### Testing & Quality Assurance
Run unit and Playwright End-to-End (E2E) test suites:
```sh
# Run all unit tests (Vitest)
pnpm test:unit

# Run full Playwright E2E suite
pnpm --filter web test:e2e

# Run headed E2E test in visual browser window
pnpm --filter web test:e2e:headed

# Serve interactive Playwright HTML Web View Report at http://localhost:9323
pnpm --filter web test:e2e:report
```

---

## Repository Structure

```
gphone/
├── client/           # Client-side TypeScript controllers (Animation, Battery, Camera, Call, etc.)
├── server/           # Server-side controllers, FrameworkBridge, AuditLogger, & Database access
├── shared/           # Shared types, interfaces, and constants
├── web/              # Svelte 5 + Vite + Tailwind CSS v4 frontend application
├── scripts/          # Manifest generation and build automation scripts
├── build/            # esbuild bundle configuration
├── gphone.sql        # Database table definitions and foreign keys
└── fxmanifest.lua    # Resource manifest file
```

---

## License

This project is open-source and licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).