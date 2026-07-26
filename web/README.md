# gPhone Web Interface

This directory contains the Svelte 5 frontend application and NUI bridge for **[gPhone](https://gphone.site/)**, a custom smartphone resource for FiveM.

---

## 🚀 Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (utilizing Svelte 5 runes `$state`, `$derived`, `$effect`)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: [Playwright](https://playwright.dev/) (E2E) & [Vitest](https://vitest.dev/) (Unit)

---

## 📁 Directory Structure

```text
web/
├── e2e/                # Playwright End-to-End test suites
│   ├── apps/           # Individual app E2E tests (Phone, Mail, Messages, Contacts, etc.)
│   ├── error_boundary.spec.ts
│   ├── navigation.spec.ts
│   ├── notifications.spec.ts
│   └── nui.spec.ts
├── src/
│   ├── components/     # Core OS UI components (PhoneFrame, ErrorBoundary, ScreenHeader, ToastContainer)
│   ├── core/           # Core OS architecture & bridge adapters
│   │   └── bridge/     # Transport abstraction layer (NuiTransportAdapter, MockTransportAdapter)
│   ├── mocks/          # Standalone browser mode data mocks
│   ├── modules/        # Phone application modules (phone, contacts, messages, mail, etc.)
│   ├── store/          # Svelte state stores & reactive appRegistryStore
│   ├── App.svelte      # Main OS runtime container & ErrorBoundary wrapper
│   └── main.ts
├── package.json
└── playwright.config.ts
```

---

## 🧪 Testing Operations

gPhone includes a full suite of automated unit and Playwright End-to-End (E2E) tests.

### Running Unit Tests

Run unit test suites for Svelte stores, transport bridge adapters, and helper utilities:

```sh
pnpm test:unit
```

### Running E2E Tests

The Playwright test suite covers full application flows, NUI events, app error boundaries, interactive notification deep-linking, and form validation.

```sh
# Run full headless E2E test suite
pnpm test:e2e

# Visually observe tests running in a single-worker headed Chrome window
pnpm test:e2e:headed

# Open the Playwright interactive UI debugger
pnpm test:e2e:ui

# Serve the HTML Web View Report at http://localhost:9323
pnpm test:e2e:report
```

---

## 🛠️ Standalone Development vs. FiveM CEF (Pluggable Transport Layer)

gPhone uses a pluggable `ITransportAdapter` abstraction layer to handle event communication across runtime environments:

- **Standalone Browser Mode (`MockTransportAdapter`)**: Running `pnpm dev` launches the web app on `http://localhost:5173`. Callbacks dynamically resolve from `MockRegistry` data fixtures.
- **FiveM CEF NUI Mode (`NuiTransportAdapter`)**: Inside FiveM, callbacks issue `fetch('https://<resource>/<event>')` requests and handle incoming NUI `window.message` events seamlessly.
