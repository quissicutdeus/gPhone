# Agent Rules and Constraints

## Source Control
- **No Automated Commits**: NEVER run `git commit`, `git add`, `git push`, or automatically push code to a repository on the user's behalf. The user prefers to manually review changes, stage files, and manage their own source control history. You may run `git status` or `git diff` for context, but you must leave staging and committing to the user.

## Project Context
- **Identity**: This project is a modern, soon-to-be shared open-source custom FiveM phone.
- **Tech Stack**: Powered by TypeScript, Vite, Svelte, and Tailwind CSS.
- **Package Manager**: Exclusively use `pnpm` for all package management and script executions (e.g., `pnpm run build`, `pnpm dev`, `pnpm dlx`). NEVER use plain `npm`, `npx`, `node`, `bun`, or `yarn`.
- **Goal**: Maintain a high standard of modern web development practices suitable for an open-source release, adhering strictly to the defined tech stack.
- **Environment**: All code must be designed to work flawlessly in both standard web browsers and within the FiveM game environment.
