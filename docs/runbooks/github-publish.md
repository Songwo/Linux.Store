# GitHub Publish Runbook

## Goal

Prepare the monorepo for upload to GitHub without leaking local secrets or generated assets.

## 1. Secret hygiene

Before publishing, do not commit these local-only files:

- `server/configs/config.local.yaml`
- `.env`
- any private OAuth credentials or server-specific config copies

Use these safe templates instead:

- `server/configs/config.yaml.example`
- `server/configs/config.local.example.yaml`
- `.env.example`

## 2. Repository ignore rules

The root `.gitignore` already ignores:

- `node_modules/`
- `dist/`
- Go build artifacts
- local caches
- `server/configs/config.local.yaml`
- IDE folders and logs

## 3. Initialize local Git repository

```bash
git init
git branch -M main
git add .
git status
```

Review the staged files carefully before the first commit.

## 4. First commit

```bash
git commit -m "chore: bootstrap devstore monorepo"
```

## 5. Create GitHub repository and connect remote

```bash
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

If you use SSH:

```bash
git remote add origin git@github.com:<your-account>/<your-repo>.git
git push -u origin main
```

## 6. Recommended repository metadata

- Repository name: `devstore`
- Topics: `go`, `gin`, `vue3`, `rabbitmq`, `redis`, `seckill`, `monorepo`, `docker-compose`
- Description: `High-concurrency developer commerce system with Go, Vue, Redis, RabbitMQ, wallet rewards, and seckill traffic shaping.`

## 7. Suggested post-publish checks

- Verify `README.md` renders correctly
- Verify code blocks use the right commands and paths
- Confirm screenshots or docs do not expose secrets
- Confirm `server/configs/config.local.yaml` is not tracked
- Add branch protection and secret scanning if the repo becomes collaborative
