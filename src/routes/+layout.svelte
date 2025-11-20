<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { navigating } from '$app/stores';

	let { children, data } = $props<{
		children: () => unknown;
		data: {
			user: {
				athleteId: string;
				firstName: string | null;
				initial: string;
			} | null;
		};
	}>();
	let userMenuOpen = $state(false);

	const toggleUserMenu = () => {
		userMenuOpen = !userMenuOpen;
	};

	const closeUserMenu = () => {
		userMenuOpen = false;
	};
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
		<div class="nav-right">
			<nav class="links">
				<a href="/">Home</a>
				<a href="/plan">Plan</a>
			</nav>

			<div class="user-menu" onfocusout={closeUserMenu}>
				<button
					type="button"
					class="avatar-button"
					aria-label="Account"
					aria-haspopup="menu"
					aria-expanded={userMenuOpen}
					onclick={toggleUserMenu}
				>
					<span class="avatar-initials">{data.user?.initial ?? 'S'}</span>
				</button>

				{#if userMenuOpen}
					<div class="user-menu-dropdown" role="menu">
						<a href="/auth/logout" role="menuitem">Logout</a>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="site-main">
		{@render children()}
	</main>

	{#if $navigating}
		<div class="page-loading-overlay" aria-live="polite" aria-busy="true">
			<div class="page-loading-backdrop"></div>
			<div class="page-loading-content">
				<div class="page-loading-spinner" aria-hidden="true"></div>
				<p class="page-loading-text">Loading…</p>
			</div>
		</div>
	{/if}
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

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1.25rem;
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

	.user-menu {
		position: relative;
	}

	.avatar-button {
		width: 32px;
		height: 32px;
		border-radius: 999px;
		border: 1px solid rgba(148, 163, 184, 0.7);
		background:
			linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.86)),
			radial-gradient(circle at top left, rgba(248, 113, 22, 0.4), transparent 60%);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #e5e7eb;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow:
			0 10px 30px rgba(15, 23, 42, 0.9),
			0 0 0 1px rgba(15, 23, 42, 0.9);
		padding: 0;
	}

	.avatar-button:hover {
		border-color: rgba(248, 113, 22, 0.9);
	}

	.avatar-initials {
		text-transform: uppercase;
	}

	.user-menu-dropdown {
		position: absolute;
		right: 0;
		margin-top: 0.4rem;
		min-width: 150px;
		border-radius: 0.6rem;
		background:
			linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.9)),
			radial-gradient(circle at top right, rgba(56, 189, 248, 0.22), transparent 60%);
		border: 1px solid rgba(148, 163, 184, 0.7);
		box-shadow:
			0 20px 55px rgba(15, 23, 42, 0.98),
			0 0 0 1px rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(22px);
		-webkit-backdrop-filter: blur(22px);
		padding: 0.35rem 0.25rem;
		z-index: 30;
	}

	.user-menu-dropdown a {
		display: block;
		padding: 0.4rem 0.7rem;
		font-size: 0.8rem;
		color: #e5e7eb;
		text-decoration: none;
		border-radius: 0.4rem;
	}

	.user-menu-dropdown a:hover {
		background: rgba(15, 23, 42, 0.96);
		color: #f97316;
	}

	.site-main {
		position: relative;
		z-index: 1;
		padding-bottom: 2rem;
	}

	.page-loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
	}

	.page-loading-backdrop {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at top, rgba(15, 23, 42, 0.5), transparent 65%),
			radial-gradient(circle at bottom, rgba(15, 23, 42, 0.75), transparent 65%);
		backdrop-filter: blur(22px);
		-webkit-backdrop-filter: blur(22px);
		opacity: 0;
		animation: loading-fade-in 140ms ease-out forwards;
	}

	.page-loading-content {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 999px;
		background:
			linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.9)),
			radial-gradient(circle at top left, rgba(248, 113, 22, 0.35), transparent 55%);
		border: 1px solid rgba(148, 163, 184, 0.75);
		box-shadow:
			0 20px 55px rgba(15, 23, 42, 0.98),
			0 0 0 1px rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(26px);
		-webkit-backdrop-filter: blur(26px);
		animation: loading-pop 140ms ease-out forwards;
	}

	.page-loading-spinner {
		width: 28px;
		height: 28px;
		border-radius: 999px;
		border-width: 2px;
		border-style: solid;
		border-color: rgba(148, 163, 184, 0.25);
		border-top-color: #f97316;
		border-right-color: #38bdf8;
		animation: loading-spin 620ms linear infinite;
		box-shadow: 0 0 30px rgba(248, 113, 22, 0.55);
	}

	.page-loading-text {
		margin: 0;
		font-size: 0.8rem;
		color: #e5e7eb;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		font-weight: 500;
		opacity: 0.9;
	}

	@keyframes loading-spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	@keyframes loading-pop {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.96);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes loading-fade-in {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}
</style>
