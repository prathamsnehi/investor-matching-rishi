# Continuous Integration

This repository uses a minimal GitHub Actions workflow while the app is still a work in progress. The workflow lives at `.github/workflows/ci.yml` and runs on pushes to `main`/`master` plus pull requests.

## What the workflow checks

- **Frontend type check**
  - Installs the existing frontend dependencies with `npm ci` from `frontend/package-lock.json`.
  - Runs `npx tsc --noEmit` from `frontend/` to catch TypeScript errors without producing build output.
- **Backend auth unit tests**
  - Uses Python 3.13 to match the backend `pyproject.toml` files.
  - Installs only the lightweight dependency slice needed for auth tests from `backend/requirements-ci.txt`.
  - Runs `PYTHONPATH=backend pytest backend/tests -q`.

## Current backend test scope

The first backend tests intentionally focus on implemented auth behavior and avoid known stubs listed in `docs/known_stubs.md`.

Covered auth behavior:

- Password hashing and verification through `SecurityEngine`.
- JWT access-token claim creation.
- Auth schema validation for signup and password changes.
- Password-change endpoint behavior for incorrect old passwords.
- Password-change endpoint behavior for successful updates, including token-version revocation.

Not covered yet:

- Upload, ingestion, discover, onboarding, ML search, and worker behavior listed as known stubs.
- Integration tests that require Postgres, Redis, pgvector, Prisma migrations, or Docker Compose services.

## CI-only dependencies

No application runtime dependencies were added.

The GitHub-hosted runner needs these CI tools/actions:

- `actions/checkout@v4` to check out the repository.
- `actions/setup-node@v4` to install Node.js 22 and cache `frontend/package-lock.json` dependencies.
- `actions/setup-python@v5` to install Python 3.13 for backend tests.

The backend test job installs `backend/requirements-ci.txt`, which contains only the packages required to import and unit-test the currently implemented auth layer:

- `pytest`
- `pytest-asyncio`
- `fastapi`
- `slowapi`
- `prisma`
- `passlib[bcrypt]`
- `bcrypt`
- `python-jose`
- `pydantic`
- `email-validator`
- `python-multipart`

The frontend job installs the already-declared npm dependencies from `frontend/package-lock.json`.

## Docker Compose impact

No Docker Compose changes are required for this CI pipeline.

The current workflow does not start Postgres, Redis, the API, the ML service, or the worker containers. Auth endpoint tests use in-memory fakes for database calls, which keeps CI fast and avoids requiring a CI `.env` file while the app is still early. If future tests need service integration, add a separate integration-test job that either starts `backend/docker-compose.yml` with CI-safe environment variables or uses GitHub Actions service containers for Postgres/pgvector and Redis.

## Known follow-ups

- `npm run lint` is not part of the workflow yet because the current frontend dependency manifest does not install `eslint`, which `expo lint` requires.
- Expand pytest coverage only when functionality is fully implemented and not listed as a known or discovered stub.
- Add separate integration tests later for database-backed APIs and worker/ML flows once their dependencies and contracts are stable.
