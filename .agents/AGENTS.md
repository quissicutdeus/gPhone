# Agent Rules and Constraints

## 1. Source Control
- You may run `git status` or `git diff` for context. NEVER run `git commit`, `git add`, `git push`, or any mutating git command.

## 2. Tech Stack & Build
- **Project**: gphone — an open-source custom FiveM phone.
- **Stack**: TypeScript, Vite, Svelte, Tailwind CSS.
- **Package Manager**: STRICTLY `pnpm` only. NEVER `npm`, `npx`, `node`, `bun`, or `yarn`.
- **Styling**: Tailwind utility classes exclusively. Custom `<style>` blocks only for animations or pseudo-elements Tailwind cannot handle.
- **Build Output**: Never alter Vite's build output directory without verifying it matches `ui_page` and file array paths in `fxmanifest.lua`.
- **Dual Environment**: All code must work in a standard browser (mocked data) AND the FiveM Chromium Embedded Framework (CEF).

## 3. Testing
- **Unit Tests**: Run via `pnpm --filter web test:unit`. Tests use Vitest and live alongside source files as `*.test.ts` (e.g., `src/store/contacts.test.ts`).
- **E2E Tests**: Pre-approved to run `pnpm --filter web exec playwright test` without asking.
- **Port Isolation**:
  - E2E (Playwright): port `5173` — launches its own isolated dev server.
  - Manual dev server: port `9000` — never modify Playwright configs to target this.
  - Assume standard `localhost` routing (WSL2 standard NAT).
- **Test Reports**: Instruct the user to run `pnpm --filter web test:e2e:report` (HTML) or `pnpm --filter web test:e2e:headed` (live visual).

## 4. NUI Communication & Mocking
- All client-to-game calls use NUI callbacks via `fetchNui()` from `src/utils/fetchNui.ts`, which internally calls `fetch('https://<resource>/<event>')`.
- In browser mode (`isBrowser()` returns true), `fetchNui` resolves from the **MockRegistry** at `src/mocks/registry.ts`. When adding a new NUI event, always add a corresponding mock handler there.
- Mock data fixtures live in `src/mocks/data.ts`.

## 5. CEF & Routing Constraints
- The main app wrapper MUST use a transparent background (`bg-transparent`) so the game is visible behind the phone overlay.
- NEVER use `window.location` redirects — handle all navigation internally via Svelte components to avoid reloading the CEF instance.

## 6. Architecture & State
- **Stores**: Global state uses native Svelte stores (`writable`, `derived`) in `src/store/`. One file per domain (e.g., `contacts.ts`, `messages.ts`). No external state libraries.
- **Components**: Shared UI components in `src/components/`. App-specific screens in `src/modules/<app>/`.
- **Types**: Shared types imported from `@shared/types`.