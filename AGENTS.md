# Repository Guidelines

## Project Structure & Module Organization
- Root directories: `client/` (Vite + React), `server/` (Express API/Vite bridge), `shared/` (Drizzle schema & types), `attached_assets/` (design refs).
- `client/src` organizes UI by role: `pages/`, `components/`, `lib/`, `hooks/`, `utils/`, `types/`; prefer the `@` alias for imports.
- Server bootstrap sits in `server/index.ts`; expose REST handlers in `server/routes.ts`, and isolate persistence logic in `server/storage.ts`.
- Update `shared/schema.ts` when DB shapes change; Drizzle migrations land in `migrations/`.

## Build, Test, and Development Commands
- `npm run dev` — starts Express with Vite middleware; browse `http://localhost:5000`.
- `npm run check` — TypeScript static analysis; fix all warnings.
- `npm run build` — bundles client to `dist/public` and the server runtime to `dist/`.
- `npm run start` — serves the production bundle; run only after `npm run build`.
- `npm run db:push` — syncs Drizzle schema to the Postgres target defined by `DATABASE_URL`.

## Coding Style & Naming Conventions
- TypeScript codebase with 2-space indentation, trailing commas, and double quotes.
- Components and hooks use PascalCase (`ExecutionsPage`, `AppSidebar`); functions and utilities stay camelCase.
- Compose Tailwind classes from layout → spacing → color; extract repeated sets into shared components.
- Use path aliases (`@`, `@shared`, `@assets`) instead of deep relative paths.

## Testing Guidelines
- No automated tests yet; run `npm run dev` and exercise affected routes or screens before pushing.
- For back-end changes, log representative responses or create short-lived assertions in `server/routes.ts` until a formal suite exists.
- Coordinate before adding tooling (Vitest, Playwright, etc.) so configs live beside the current Vite setup.

## Commit & Pull Request Guidelines
- Follow the existing history: single-line, imperative commit subjects (e.g., “Improve filtering by optimizing data retrieval”).
- Keep commits focused; separate schema or migration files from UI updates when practical.
- PRs should link issues, outline impact, and list manual verification. Attach screenshots for client work and sample payloads for API updates.
- Highlight new migrations or environment variables in the description so reviewers can plan rollout steps.

## Security & Configuration Tips
- Keep `.env` out of version control; minimally set `PORT` (defaults to 5000) and `DATABASE_URL` for Drizzle CLI and production.
- `server/storage.ts` currently stores data in memory; document any switch to a persistent backend, including seeds or migration steps.
- Review new dependencies for licensing and browser support before adding them.
