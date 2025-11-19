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
		<div class="bg-shape bg-shape--cyan"></div>
		<div class="bg-shape bg-shape--amber"></div>
		<div class="bg-shape bg-shape--pink"></div>
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
		background:
			radial-gradient(circle at 50% -10%, #020617 0, #020617 40%, #000 100%);
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

	:global(body)::after {
		/* subtle animated grain texture */
		content: '';
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: -1;
		opacity: 0.14;
		mix-blend-mode: soft-light;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='noStitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E");
		animation: grain-shift 18s steps(6, end) infinite;
	}

	@keyframes grain-shift {
		0% {
			transform: translate3d(0, 0, 0);
		}
		25% {
			transform: translate3d(-10px, -8px, 0);
		}
		50% {
			transform: translate3d(6px, -6px, 0);
		}
		75% {
			transform: translate3d(-4px, 6px, 0);
		}
		100% {
			transform: translate3d(0, 0, 0);
		}
	}

	.app-shell {
		position: relative;
		min-height: 100vh;
	}

	.bg-shapes {
		position: fixed;
		inset: -10%;
		pointer-events: none;
		z-index: -2;
		overflow: hidden;
	}

	.bg-shape {
		position: absolute;
		width: min(460px, 60vw);
		aspect-ratio: 4 / 3;
		border-radius: 999px;
		filter: blur(32px);
		opacity: 0.9;
		mix-blend-mode: screen;
		transform-origin: center;
	}

	.bg-shape--cyan {
		top: -10%;
		left: -8%;
		background:
			radial-gradient(circle at 10% 0%, rgba(244, 244, 245, 0.22), transparent 52%),
			radial-gradient(circle at 0% 100%, rgba(56, 189, 248, 0.9), transparent 65%),
			radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.8), transparent 70%);
		animation: float-blob-1 26s ease-in-out infinite alternate;
	}

	.bg-shape--amber {
		top: -4%;
		right: -14%;
		background:
			radial-gradient(circle at 0% 0%, rgba(254, 249, 195, 0.3), transparent 45%),
			radial-gradient(circle at 10% 90%, rgba(248, 113, 22, 0.9), transparent 70%),
			radial-gradient(circle at 90% 10%, rgba(234, 179, 8, 0.85), transparent 70%);
		animation: float-blob-2 30s ease-in-out infinite alternate;
	}

	.bg-shape--pink {
		bottom: -18%;
		right: 4%;
		background:
			radial-gradient(circle at 5% 0%, rgba(251, 113, 133, 0.5), transparent 40%),
			radial-gradient(circle at 80% 90%, rgba(192, 132, 252, 0.9), transparent 70%),
			radial-gradient(circle at 0% 90%, rgba(244, 114, 182, 0.85), transparent 70%);
		animation: float-blob-3 34s ease-in-out infinite alternate;
	}

	@keyframes float-blob-1 {
		0% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(18px, 12px, 0) scale(1.05);
		}
		100% {
			transform: translate3d(8px, 22px, 0) scale(1.03);
		}
	}

	@keyframes float-blob-2 {
		0% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(-24px, 6px, 0) scale(1.08) rotate(-2deg);
		}
		100% {
			transform: translate3d(-10px, 18px, 0) scale(1.04) rotate(1deg);
		}
	}

	@keyframes float-blob-3 {
		0% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(-16px, -10px, 0) scale(1.06);
		}
		100% {
			transform: translate3d(4px, -22px, 0) scale(1.02);
		}
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
