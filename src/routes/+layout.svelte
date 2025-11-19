<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<div class="bg-shapes" aria-hidden="true">
		<div class="bg-shape bg-shape--left"></div>
		<div class="bg-shape bg-shape--right"></div>
	</div>

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
</div>

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
		position: relative;
		overflow-x: hidden;
	}

	/* subtle blurry, grainy background shapes */

	.bg-shapes {
		position: fixed;
		inset: -10%;
		pointer-events: none;
		z-index: -1;
		overflow: hidden;
	}

	.bg-shape {
		position: absolute;
		width: min(420px, 72vw);
		aspect-ratio: 4 / 3;
		border-radius: 999px;
		filter: blur(40px);
		opacity: 0.35;
		mix-blend-mode: screen;
		background-blend-mode: screen;
	}

	.bg-shape--left {
		top: -10%;
		left: -8%;
		background:
			radial-gradient(circle at 10% 0%, rgba(148, 163, 184, 0.22), transparent 55%),
			radial-gradient(circle at 0% 100%, rgba(56, 189, 248, 0.7), transparent 65%),
			url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='3' stitchTiles='noStitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
	}

	.bg-shape--right {
		bottom: -16%;
		right: -12%;
		background:
			radial-gradient(circle at 90% 0%, rgba(248, 250, 252, 0.18), transparent 55%),
			radial-gradient(circle at 100% 100%, rgba(248, 113, 22, 0.75), transparent 70%),
			url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='3' stitchTiles='noStitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
	}

	@media (max-width: 640px) {
		.bg-shape {
			width: 120%;
			filter: blur(44px);
			opacity: 0.32;
		}

		.bg-shape--left {
			top: -16%;
			left: -25%;
		}

		.bg-shape--right {
			bottom: -24%;
			right: -30%;
		}
	}

	.app-shell {
		position: relative;
		min-height: 100vh;
	}

	.site-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1.7rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.15);
		background:
			linear-gradient(120deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.75)),
			radial-gradient(circle at top left, rgba(248, 113, 22, 0.2), transparent 55%);
		backdrop-filter: blur(22px);
		-webkit-backdrop-filter: blur(22px);
		box-shadow:
			0 18px 40px rgba(15, 23, 42, 0.88),
			0 0 0 1px rgba(148, 163, 184, 0.18);
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
		gap: 1rem;
		font-size: 0.9rem;
	}

	.links a {
		color: #cbd5f5;
		text-decoration: none;
		position: relative;
		padding: 0.1rem 0;
	}

	.links a:hover {
		color: #f97316;
	}

	.links a::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -0.15rem;
		width: 0;
		height: 1px;
		background: linear-gradient(90deg, #f97316, #38bdf8);
		transition: width 160ms ease-out;
		opacity: 0.9;
	}

	.links a:hover::after {
		width: 100%;
	}

	.site-main {
		position: relative;
		z-index: 1;
		padding-bottom: 2rem;
	}
</style>
