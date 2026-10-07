# Starmora application

The current application is in [`human-design/`](human-design/README.md): a Go API, React chart interface, 44 static Turkish/English public pages and PostgreSQL.

```sh
cd human-design
cp .env.example .env
# Set POSTGRES_PASSWORD to a strong unique value.
docker compose up --build -d
```

Open http://127.0.0.1:5173/. The public homepage redirects to `/tr/`; English starts at `/en/`. Personal workspaces are `/tr/harita/` and `/en/chart/`.

The root HTML/CSS files are a historical landing prototype. They are not the build or deployment target for the current application. Serve the frontend container, with `/api/` proxied to the Go service; do not deploy the root directory as a static site.

See [verification](human-design/VERIFICATION.md) and [SEO/UAT results](human-design/SEO-UAT.md) for tested behavior, limitations and live-launch requirements.
