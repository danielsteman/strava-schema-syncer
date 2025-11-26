<script lang="ts">
	export let expression: string;
	export let display = false;
</script>

<code class={`math-inline${display ? ' math-block' : ''}`}>{expression}</code>

<style>
	.math-inline {
		display: inline-block;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 0.9rem;
		background: rgba(15, 23, 42, 0.9);
		padding: 0.12rem 0.3rem;
		border-radius: 0.3rem;
		border: 1px solid rgba(148, 163, 184, 0.4);
	}

	.math-block {
		display: block;
		margin: 0.75rem 0;
	}
</style>
