# Math

1. Speed
2. Heart rate
3. Date

Plot these three dimensions in a 3D scatter plot. If a runner is making progress over time and we would plot something like a least squares estimator, we should see an upwards sloping trend. The rationale behind this is that the runner does slow runs (marathon pace) and fast runs. Over time, a runner gets faster while maintaining the same heart rate.

## Methodology

### Data preparation

- For each run (or stable segment within a run), compute:
  - **Date** \(d_i\)
  - **Elapsed time** since the first recorded run, in days: \(t*i = d_i - d*{\text{start}}\)
  - **Average heart rate** during that run or segment: \(hr_i\)
  - **Speed** \(y_i\), e.g. in m/s or km/h
- Optionally filter out:
  - Extremely short runs, sprints, or segments with large pace variability
  - Races or runs on very atypical terrain, if we want a clean baseline of aerobic fitness

This yields \(n\) observations \((t_i, hr_i, y_i)\).

### Regression model

We model speed as a linear function of time and heart rate:

\[
y_i = \beta_0 + \beta_1 t_i + \beta_2 hr_i + \varepsilon_i
\]

where:

- \(\beta_0\) is the intercept.
- \(\beta_1\) measures how speed (or pace) changes over time **at a fixed heart rate**. This is the primary “fitness trend” coefficient.
- \(\beta_2\) measures how speed (or pace) changes with heart rate **on a fixed day**.
- \(\varepsilon_i\) is random noise.

In matrix form, for \(X \in \mathbb{R}^{n \times 3}\) with columns \([1, t_i, hr_i]\) and \(y \in \mathbb{R}^n\),
ordinary least squares finds:

\[
\hat{\beta} = \arg\min\_{\beta} \|y - X \beta\|^2
\]

which has the closed-form solution:

\[
\hat{\beta} = (X^\top X)^{-1} X^\top y.
\]

In practice, this is computed using a numerical linear algebra library rather than explicitly forming the inverse.

### Interpretation

- \(\hat{\beta}\_1 > 0\) indicates that, at a fixed heart rate, speed is increasing over time (fitness is improving).
- \(\hat{\beta}\_2 > 0\) indicates that, on a fixed day, higher heart rate is associated with higher speed (as expected physiologically).
- Statistical significance (e.g. p-values or confidence intervals on \(\hat{\beta}\_1\)) can be used to judge whether the observed trend is likely to be real rather than noise.

### Steman Aerobic Fitness (SAF) coefficient

To summarise long-term aerobic progress in a single number, we can combine \(\hat{\beta}\_1\) and \(\hat{\beta}\_2\) into a **Steman Aerobic Fitness (SAF)** coefficient.

Let \(T\) be a chosen time horizon in days (for example \(T = 90\) days). The model implies that, over \(T\) days, the expected speed gain at a fixed heart rate is:

\[
\Delta \text{speed}\_{\text{time}}(T) = \hat{\beta}\_1 \cdot T.
\]

On a fixed day, \(\hat{\beta}\_2\) describes how speed changes per additional beat per minute. The increase in heart rate that would normally produce the same speed gain is:

\[
\Delta hr\_{\text{equiv}}(T) = \frac{\Delta \text{speed}\_{\text{time}}(T)}{\hat{\beta}\_2}
= \frac{\hat{\beta}\_1 \cdot T}{\hat{\beta}\_2}.
\]

We define the **SAF coefficient** over horizon \(T\) as:

\[
\text{SAF}\_T := \frac{\hat{\beta}\_1 \cdot T}{\hat{\beta}\_2}.
\]

- **Units**: beats per minute (bpm).
- **Interpretation**: over the last \(T\) days, the runner has gained as much speed at the **same** heart rate as would normally be produced by increasing heart rate by \(\text{SAF}\_T\) bpm.
- In practice, SAF can be reported for a fixed horizon (e.g. \(T = 90\) days) as a user-facing metric, possibly smoothed over rolling windows to reduce noise.

### 3D regression trend visualization

To visualize the trend:

- Plot each observation as a point in 3D: \((t_i, hr_i, y_i)\), where the axes are **time**, **heart rate**, and **speed**.
- Using the fitted model, define the regression plane:

\[
\hat{y}(t, hr) = \hat{\beta}\_0 + \hat{\beta}\_1 t + \hat{\beta}\_2 hr.
\]

- On a grid of \((t, hr)\) values spanning the observed range, compute \(\hat{y}(t, hr)\) and plot this plane through the point cloud.
- The **tilt of the plane along the time axis**, holding heart rate fixed, visually encodes the direction and magnitude of the runner’s fitness trend.
