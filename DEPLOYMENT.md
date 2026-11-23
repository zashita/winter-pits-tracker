# Local Docker and free hosting

## Run locally with Docker Compose

1. Copy `.env.example` to `.env` and set `DB_PASSWORD` and `YANDEX_MAPS_API_KEY`.
2. Run `docker compose up --build` from the repository root.
3. Open `http://localhost:4000`. PostgreSQL data is kept in the `postgres-data` volume.

The Yandex browser API key is included in the built frontend, so it is visible to site visitors. Restrict that key to the deployed site origins in the Yandex developer console. Do not put a Yandex secret signing key in this variable.

## Deploy to Render Free

The repository includes a Render Blueprint in `render.yaml`. Connect the GitHub repository to Render and create the Blueprint. Set `DATABASE_URL` to a PostgreSQL connection string from a separate database provider, and set `YANDEX_MAPS_API_KEY` to the browser API key. Render injects the Yandex variables into the Docker build so Webpack can configure the frontend. Keep `DB_SYNCHRONIZE=false`; the container initializes only the app's table with an idempotent `CREATE TABLE IF NOT EXISTS` statement.

The app serves both the website and `/pits` API from the same origin. The free Render web service sleeps after inactivity and can take about a minute to wake. Supabase Free databases are limited to 500 MB and pause after a week of inactivity. These free tiers are intended for hobby projects and previews, not production availability guarantees.

For an external PostgreSQL database, use `DATABASE_URL` and set `DB_SSL=true`. For a local database connection without a URL, configure `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME`.
