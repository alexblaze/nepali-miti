# Contributing to nepali-miti

Thanks for helping! Wrong dates hurt real people (payroll, exams, legal deadlines), so accuracy comes first.

## Reporting a wrong date

Open a [calendar data issue](https://github.com/alexblaze/nepali-miti/issues/new?template=calendar_data.md) with:

- the BS date, the AD date you expected and the AD date you got;
- a link to a published source (Hamro Patro, the Panchanga Nirnayak Samiti calendar, a government notice).

## Setup

Requires Node.js 20+ for development (the published package supports Node.js 18+).

```sh
git clone https://github.com/alexblaze/nepali-miti.git
cd nepali-miti
npm install
```

## Development workflow

| Command                 | What it does                                |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Rebuild `dist/` on change                   |
| `npm test`              | Run the test suite (Vitest)                 |
| `npm run coverage`      | Tests with coverage thresholds              |
| `npm run lint`          | ESLint, Prettier check and `tsc` type check |
| `npm run format`        | Apply Prettier                              |
| `npm run build`         | Build ESM, CJS and type declarations        |
| `npm run check:package` | `publint` and `@arethetypeswrong/cli`       |

Run the tests in another timezone to catch timezone bugs: `TZ=Pacific/Kiritimati npm test`.

## Pull requests

- Keep the package dependency-free.
- Add tests for every behaviour change. Calendar data changes need a fixture entry with its source.
- Public API changes need README and CHANGELOG updates (under `## [Unreleased]`).
- Use [Conventional Commits](https://www.conventionalcommits.org/): `fix: …`, `feat: …`, `docs: …`, `data: …`
  (calendar data), `chore: …`.
- CI must pass: lint, tests on Node.js 20/22/24 in several timezones, build, package checks.

## Release process (maintainers)

1. Update `CHANGELOG.md` and bump the version: `npm version patch|minor|major`.
   - patch: bug fixes; minor: new features or calendar data updates; major: breaking API changes.
2. `git push --follow-tags`.
3. Create a GitHub Release from the tag. The `publish` workflow then publishes to npm with provenance using
   npm trusted publishing (OIDC). No npm token is stored in the repository.
