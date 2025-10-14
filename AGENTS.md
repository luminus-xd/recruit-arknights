# Repository Guidelines

All contributor communication, including PR reviews and issue replies, must be written in Japanese.

## Project Structure & Module Organization
Next.js App Router lives in `src/app`, with route segments per feature and shared layout metadata. Reusable UI resides in `src/components` (Radix primitives, Tailwind variants) and domain logic in `src/lib`, `src/hooks`, and `src/contexts`. Types are centralized under `src/types` to keep API contracts consistent. Static icons, manifest assets, and OpenGraph images live in `public`. Maintenance scripts (icon generation, JSON optimizers) are in `tools/`.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` (or `bun install` to match the README). Run `pnpm dev` for the local Next.js server with hot reload. `pnpm build` performs the production compile, while `pnpm start` serves the optimized bundle. Use `pnpm lint` before every PR; `pnpm analyze` runs the bundle analyzer behind `next build`. Supporting scripts include `pnpm optimize-json` to minify recruit data and `pnpm generate-icons` to refresh favicons.

## Coding Style & Naming Conventions
The codebase targets TypeScript 5.7+ with React function components. Prefer two-space indentation and trailing commas, matching the existing formatting. Follow the `@/` path alias for absolute imports; group React, Next, and local modules accordingly. Components and contexts use PascalCase filenames, hooks start with `use`, and utility modules stay camelCase. Rely on Tailwind utility classes declared in `tailwind.config.ts`, keeping class strings short and extracted into helpers when repeated.

## Testing Guidelines
There is no dedicated unit test suite yet; treat linting as the minimum gate and add tests under `src` using `*.test.ts(x)` when introducing logic that benefits from coverage. Execute `pnpm lint` and exercise core user flows manually: tag filtering, vision-based tag extraction, and PWA install prompts. Document exploratory steps in the PR when manual QA uncovers edge cases.

## Commit & Pull Request Guidelines
Commits follow a Conventional Commit flavor (`feat:`, `refactor:`, `chore:`) as seen in recent history; scope prefixes are optional but encouraged for larger modules. Keep commits focused and include Japanese context in the body when it clarifies user-facing changes. PRs should link issues, summarize user impact, attach UI screenshots or recordings for visual tweaks, and list any data or tooling scripts executed. Ensure lint and build commands pass before requesting review.

Use the GitHub CLI `gh pr create` command when opening pull requests (and rely on flags like `--fill` as needed).
