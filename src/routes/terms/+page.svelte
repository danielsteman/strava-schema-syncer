<main class="page">
	<section class="card">
		<header class="header">
			<h1>Terms of service</h1>
			<p>
				These terms describe how you may use this app and what you can expect in return.
			</p>
		</header>

		<section class="section">
			<h2>Use of the app</h2>
			<p>
				This app is provided for personal use to help you understand and track your training. You
				agree not to misuse the app, attempt to break or overload it, or use it in ways that violate
				applicable laws or the terms of any connected services.
			</p>
		</section>

		<section class="section">
			<h2>Accounts and access</h2>
			<p>
				To use certain features, you may need to connect an external fitness account. You are
				responsible for keeping your login information secure and for any actions taken through your
				connected account.
			</p>
		</section>

		<section class="section">
			<h2>Data and privacy</h2>
			<p>
				This app accesses and processes your training data to display activities and progress. How
				that data is handled is described in more detail in the
				<a href="/privacy">privacy policy</a>.
			</p>
		</section>

		<section class="section">
			<h2>No medical advice</h2>
			<p>
				This app is not a medical device and does not provide medical advice. Training suggestions
				and visualizations are for informational purposes only and should not be used as a
				substitute for professional medical or coaching advice.
			</p>
		</section>

		<section class="section">
			<h2>Availability and changes</h2>
			<p>
				The app is provided “as is” without guarantees of uptime or availability. Features may change,
				be added, or be removed over time. Reasonable efforts will be made to keep the app stable,
				but interruptions or bugs may still occur.
			</p>
		</section>

		<section class="section">
			<h2>Limitations of liability</h2>
			<p>
				To the extent permitted by law, this app and its creator are not liable for any indirect,
				incidental, or consequential damages arising from your use of the app, including but not
				limited to lost training data or plans.
			</p>
		</section>

		<section class="section">
			<h2>Contact</h2>
			<p>
				If you have questions about these terms, please email
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


