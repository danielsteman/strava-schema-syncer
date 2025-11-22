<main class="page">
	<section class="card">
		<header class="header">
			<h1>Privacy policy</h1>
			<p>
				This page explains what information this app accesses, how it is used, and the choices you
				have.
			</p>
		</header>

		<section class="section">
			<h2>Information this app accesses</h2>
			<p>This app is focused on your training data and related metrics. It may access:</p>
			<ul>
				<li>Basic profile information provided by your connected account</li>
				<li>Activity data such as distance, duration, pace and timestamp</li>
				<li>Heart rate data for activities, when available and permitted</li>
			</ul>
			<p>
				Only the minimum information required to display your activities and map them onto your
				training plan is used.
			</p>
		</section>

		<section class="section">
			<h2>How your information is used</h2>
			<ul>
				<li>To display your recent activities in the app</li>
				<li>To calculate weekly totals and completion metrics against your training plan</li>
				<li>To compute basic heart rate statistics and distributions for your runs</li>
			</ul>
			<p>
				Your data is not sold or shared with third parties for advertising. It is only used to power
				the features you see in this app.
			</p>
		</section>

		<section class="section">
			<h2>Storage and retention</h2>
			<p>
				Access tokens and related identifiers may be stored securely so the app can keep your data in
				sync without requiring you to reconnect every time.
			</p>
			<p>
				Activity data is typically fetched on demand from the connected service rather than being
				permanently stored. Aggregated metrics (such as weekly totals) may be cached for
				performance.
			</p>
		</section>

		<section class="section">
			<h2>Your choices</h2>
			<ul>
				<li>You can disconnect your account at any time from within the app.</li>
				<li>
					You can revoke this app’s access from the settings of the connected fitness service you
					use.
				</li>
				<li>
					If you would like to request deletion of stored tokens or related data, you can contact
					me using the support details below.
				</li>
			</ul>
		</section>

		<section class="section">
			<h2>Contact</h2>
			<p>
				If you have questions about this privacy policy or how your data is handled, please email
				<a href="mailto:support@danielsteman.com">support@danielsteman.com</a>.
			</p>
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

	@media (max-width: 640px) {
		.card {
			padding: 1.5rem 1.4rem;
		}
	}
</style>


