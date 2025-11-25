<script lang="ts">
	import MathBlock from '$lib/MathBlock.svelte';
</script>

<main class="page">
	<section class="card">
		<header class="header">
			<h1>Steman Aerobic Fitness (SAF) math</h1>
			<p>
				This page explains the math behind the Steman Aerobic Fitness (SAF) coefficient: how we model
				your runs, what the regression does, and how to interpret the final number.
			</p>
		</header>

		<section class="section">
			<h2>Data: time, heart rate, and speed</h2>
			<p>
				For each run (or stable segment within a run) we turn the raw activity data into three core
				quantities:
			</p>
			<ul>
				<li>
					A date <code>d_i</code> for observation <code>i</code>, and an elapsed time in days since
					your first recorded run:
					<MathBlock expression="t_i = d_i - d_{\text{start}}" />
				</li>
				<li>
					The average heart rate during that run or segment:
					<code>hr_i</code>.
				</li>
				<li>
					The resulting speed (for example in m/s or km/h):
					<code>y_i</code>.
				</li>
			</ul>
			<p>
				After applying some basic cleaning (for example ignoring extremely short runs or very noisy
				segments), we end up with <code>n</code> observations
				<MathBlock expression="(t_i, hr_i, y_i)" />.
			</p>
		</section>

		<section class="section">
			<h2>Regression model</h2>
			<p>
				We model speed as a linear function of time and heart rate. For each observation
				<code>i</code>:
			</p>
			<MathBlock expression="y_i = \beta_0 + \beta_1 t_i + \beta_2 hr_i + \varepsilon_i" display />
			<p>Here:</p>
			<ul>
				<li><code>\beta_0</code> is the intercept.</li>
				<li>
					<code>\beta_1</code> measures how speed changes over time
					<strong>at a fixed heart rate</strong>. This is the main “fitness trend” coefficient.
				</li>
				<li>
					<code>\beta_2</code> measures how speed changes with heart rate
					<strong>on a fixed day</strong>.
				</li>
				<li><code>\varepsilon_i</code> is random noise.</li>
			</ul>
			<p>In matrix form, with design matrix <code>X</code> and target vector <code>y</code>:</p>
			<MathBlock
				expression="\hat{\beta} = \arg\min_{\beta} \lVert y - X \beta \rVert^2"
				display
			/>
			<p>Ordinary least squares has the closed-form solution:</p>
			<MathBlock expression="\hat{\beta} = (X^\top X)^{-1} X^\top y" display />
			<p>
				In practice, this is computed using a standard numerical linear algebra routine rather than
				explicitly forming the inverse.
			</p>
		</section>

		<section class="section">
			<h2>Interpreting the coefficients</h2>
			<ul>
				<li>
					If
					<MathBlock expression="\hat{\beta}_1 &gt; 0" />
					, then at a fixed heart rate your speed is increasing over time – you are getting faster
					for the same effort.
				</li>
				<li>
					If
					<MathBlock expression="\hat{\beta}_2 &gt; 0" />
					, then on a fixed day higher heart rate is associated with higher speed, which matches our
					physiological expectations.
				</li>
			</ul>
			<p>
				We can also look at statistical significance (for example p-values or confidence intervals on
				<MathBlock expression="\hat{\beta}_1" />) to judge whether the trend is likely to be real
				rather than just noise.
			</p>
		</section>

		<section class="section">
			<h2>The SAF coefficient</h2>
			<p>
				The Steman Aerobic Fitness (SAF) coefficient summarises long-term aerobic progress in a
				single number by combining the time trend <MathBlock expression="\hat{\beta}_1" /> and the
				heart-rate sensitivity <MathBlock expression="\hat{\beta}_2" />.
			</p>
			<p>
				Fix a time horizon <code>T</code> in days (for example
				<code>T = 90</code>). Over that horizon, the model implies an expected speed gain at a fixed
				heart rate of:
			</p>
			<MathBlock expression="\Delta \text{speed}_{\text{time}}(T) = \hat{\beta}_1 \cdot T" display />
			<p>
				On a fixed day, <MathBlock expression="\hat{\beta}_2" /> describes how speed changes per
				additional beat per minute. The increase in heart rate that would normally produce the same
				speed gain is:
			</p>
			<MathBlock
				expression="\Delta hr_{\text{equiv}}(T) = \frac{\Delta \text{speed}_{\text{time}}(T)}{\hat{\beta}_2} = \frac{\hat{\beta}_1 \cdot T}{\hat{\beta}_2}"
				display
			/>
			<p>
				We define the SAF coefficient over horizon <code>T</code> as:
			</p>
			<MathBlock expression="\text{SAF}_T := \frac{\hat{\beta}_1 \cdot T}{\hat{\beta}_2}" display />
			<ul>
				<li><strong>Units</strong>: beats per minute (bpm).</li>
				<li>
					<strong>Interpretation</strong>: over the last <code>T</code> days, you have gained as much
					speed at the same heart rate as would normally be produced by increasing your heart rate by
					<MathBlock expression="\text{SAF}_T" /> bpm.
				</li>
			</ul>
			<p>
				In practice, the app can compute SAF for a fixed horizon such as
				<code>T = 90</code> days and optionally smooth it over rolling windows to reduce noise.
			</p>
		</section>

		<section class="section">
			<h2>3D regression trend visualisation</h2>
			<p>
				The underlying model lives in a three-dimensional space of time, heart rate, and speed. To
				visualise it:
			</p>
			<ul>
				<li>
					Plot each observation as a point
					<MathBlock expression="(t_i, hr_i, y_i)" />
					where the axes are time, heart rate, and speed.
				</li>
				<li>
					Use the fitted model to define the regression plane:
					<MathBlock
						expression="\hat{y}(t, hr) = \hat{\beta}_0 + \hat{\beta}_1 t + \hat{\beta}_2 hr"
						display
					/>
				</li>
				<li>
					Over a grid of <MathBlock expression="(t, hr)" /> values spanning the observed range,
					compute <MathBlock expression="\hat{y}(t, hr)" /> and plot this plane through the point
					cloud.
				</li>
			</ul>
			<p>
				The tilt of this plane along the time axis, holding heart rate fixed, visually encodes the
				direction and magnitude of your fitness trend: a steeper upward slope means faster
				improvement at the same heart rate.
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

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
			'Courier New', monospace;
		font-size: 0.85rem;
		background: rgba(15, 23, 42, 0.9);
		padding: 0.12rem 0.3rem;
		border-radius: 0.3rem;
		border: 1px solid rgba(148, 163, 184, 0.4);
	}

	@media (max-width: 640px) {
		.card {
			padding: 1.5rem 1.4rem;
		}
	}
</style>


