## Cut Through the Traffic

A web app that helps you to create a training plan for your next marathon. The project was started to help my friend and I keep track of our progression while training for the big day.

### Developing

Use Deno tasks to run the app (no npm CLI required). Start the dev server:

```sh
deno task dev
```

### Building

To create a production build:

```sh
deno task build
```

You can preview the production build with:

```sh
deno task preview
```

> To deploy your app, you may need to install an adapter for your target environment.

### Deploying with SST (AWS)

This project is deployable to AWS using [SST](https://sst.dev/) and the `SvelteKit` component.

#### 1. Set Strava secrets for a stage

Make sure these are available in your shell:

```sh
export STRAVA_CLIENT_ID=...
export STRAVA_CLIENT_SECRET=...
export STRAVA_REFRESH_TOKEN=...
```

Then set them as SST secrets (example: `development` stage):

```sh
deno run -A npm:sst secret set STRAVA_CLIENT_ID "$STRAVA_CLIENT_ID" --stage development
deno run -A npm:sst secret set STRAVA_CLIENT_SECRET "$STRAVA_CLIENT_SECRET" --stage development
deno run -A npm:sst secret set STRAVA_REFRESH_TOKEN "$STRAVA_REFRESH_TOKEN" --stage development
```

Repeat for `production` when you are ready:

```sh
deno run -A npm:sst secret set STRAVA_CLIENT_ID "$STRAVA_CLIENT_ID" --stage production
deno run -A npm:sst secret set STRAVA_CLIENT_SECRET "$STRAVA_CLIENT_SECRET" --stage production
deno run -A npm:sst secret set STRAVA_REFRESH_TOKEN "$STRAVA_REFRESH_TOKEN" --stage production
```

#### 2. Deploy

First deploy to a non‑production stage (recommended):

```sh
deno run -A npm:sst deploy --stage development
```

Once you are happy, deploy to production:

```sh
deno run -A npm:sst deploy --stage production
```

The deploy output will include a URL (for each stage) that you can point a DNS record at, e.g. `running.danielsteman.com` via Cloudflare.

### Semantic commit messages

This project uses **Conventional Commits** enforced via [`commitlint`](https://github.com/conventional-changelog/commitlint).

To enforce this locally without npm, add a Git commit-msg hook:

```sh
cat > .git/hooks/commit-msg << 'EOF'
#!/usr/bin/env sh
deno run -A npm:@commitlint/cli -- --edit "$1"
EOF
chmod +x .git/hooks/commit-msg
```

From then on, commits must follow semantic prefixes such as:

- `feat: add strava login flow`
- `fix: handle expired refresh token`
- `chore: update dependencies`
