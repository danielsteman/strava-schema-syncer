<main class="page">
	<section class="card">
		<header class="header">
			<h1>Support</h1>
			<p>
				If you run into problems using this app, this page explains how to get help and some quick
				things you can try yourself first.
			</p>
		</header>

		<section class="section">
			<h2>Contact</h2>
			<p>
				You can reach me directly by email at
				<a href="mailto:support@danielsteman.com">support@danielsteman.com</a>.
			</p>
			<p>When you get in touch, it helps if you can include:</p>
			<ul>
				<li>What you were trying to do</li>
				<li>What you expected to happen</li>
				<li>What actually happened (including any error message)</li>
				<li>Your browser and device (for example: “Chrome on macOS”)</li>
			</ul>
		</section>

		<section class="section">
			<h2>Quick troubleshooting</h2>
			<ul>
				<li>Refresh the page and try the action again.</li>
				<li>
					If activities are missing, try disconnecting and reconnecting your account, then wait a
					few moments and reload.
				</li>
				<li>
					Check that your browser is online and that any content blockers are not blocking the app.
				</li>
				<li>
					If you see a message about authorization or credentials, try reconnecting your account
					from the home page.
				</li>
			</ul>
		</section>

		<section class="section">
			<h2>FAQs</h2>
			<div class="faq-list">
				<details>
					<summary>Why don’t I see my latest activities?</summary>
					<p>
						Activities may take a short time to appear. Try refreshing the page. If they still don’t
						show up, disconnect and reconnect your account and then reload the home page.
					</p>
				</details>

				<details>
					<summary>Why does the plan view show “Not started” for all weeks?</summary>
					<p>
						This usually means no runs from your connected account fall within the dates of the
						current plan. You can switch to example data on the plan page to preview how the view
						will look once training runs are recorded.
					</p>
				</details>

				<details>
					<summary>I connected my account but now I see an authorization error.</summary>
					<p>
						Authorization can expire over time or if permissions change. Visit the home page and use
						the connect button again to refresh access, then try your action once more.
					</p>
				</details>
			</div>
		</section>
	</section>
</main>

<style>
	.page {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1.5rem 3rem;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		color: #e5e7eb;
		position: relative;
		z-index: 1;
	}

	.card {
		padding: 2rem 2.2rem;
		border-radius: 1.1rem;
		background:
			linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.86)),
			radial-gradient(circle at top right, rgba(56, 189, 248, 0.22), transparent 60%);
		border: 1px solid rgba(148, 163, 184, 0.7);
		box-shadow:
			0 26px 70px rgba(15, 23, 42, 0.98),
			0 0 0 1px rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(26px);
		-webkit-backdrop-filter: blur(26px);
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.header h1 {
		margin: 0 0 0.5rem;
		font-size: clamp(2rem, 3vw, 2.3rem);
	}

	.header p {
		margin: 0;
		color: #9ca3af;
	}

	.section h2 {
		margin: 0 0 0.4rem;
		font-size: 1.1rem;
	}

	.section p {
		margin: 0 0 0.4rem;
		color: #9ca3af;
	}

	.section ul {
		margin: 0.1rem 0 0;
		padding-left: 1.2rem;
		color: #9ca3af;
	}

	.section li + li {
		margin-top: 0.15rem;
	}

	a {
		color: #38bdf8;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	details {
		border-radius: 0.6rem;
		border: 1px solid rgba(148, 163, 184, 0.5);
		background:
			linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.9)),
			radial-gradient(circle at top left, rgba(248, 113, 22, 0.18), transparent 55%);
		padding: 0.5rem 0.8rem;
	}

	summary {
		cursor: pointer;
		font-size: 0.95rem;
	}

	summary::marker {
		content: '';
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::before {
		content: '▶';
		display: inline-block;
		margin-right: 0.4rem;
		font-size: 0.7rem;
		transform-origin: center;
		transition: transform 140ms ease-out;
	}

	details[open] summary::before {
		transform: rotate(90deg);
	}

	details p {
		margin: 0.45rem 0 0;
		color: #9ca3af;
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		.card {
			padding: 1.5rem 1.4rem;
		}
	}
</style>
