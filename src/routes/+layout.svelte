<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-nav">
	<a href="/" class="brand">Strava schema syncer</a>
	<nav class="links">
		<a href="/">Home</a>
		<a href="/plan">Plan</a>
	</nav>
</header>

<main class="site-main">
	{@render children()}
</main>

<style>
	:global(body) {
		margin: 0;
		min-height: 100vh;
		background: #020617;
		color: #e5e7eb;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	.site-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1.5rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.25);
		background: rgba(15, 23, 42, 0.95);
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.brand {
		font-weight: 600;
		color: #e5e7eb;
		text-decoration: none;
		font-size: 0.95rem;
	}

	.links {
		display: flex;
		gap: 0.9rem;
		font-size: 0.9rem;
	}

	.links a {
		color: #cbd5f5;
		text-decoration: none;
	}

	.links a:hover {
		color: #f97316;
	}

	.site-main {
		padding-bottom: 2rem;
	}
</style>
