<script lang="ts">
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	const { expression, display = false } = $props<{
		expression: string;
		display?: boolean;
	}>();

	const html = katex.renderToString(expression, {
		displayMode: display,
		throwOnError: false
	});
</script>

<span class:display={display} class="katex-wrapper" {@html html}></span>

<style>
	.katex-wrapper {
		display: inline-block;
	}

	.katex-wrapper.display {
		display: block;
		margin: 0.75rem 0;
	}
</style>


