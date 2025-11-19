## strava-schema-syncer

Single-user SvelteKit app that authenticates with Strava via OAuth and displays your recent activities.

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
