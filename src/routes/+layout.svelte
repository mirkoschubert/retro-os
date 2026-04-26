<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { systemStore } from '$lib/stores/system.svelte.js';

	let { children } = $props();

	$effect(() => {
		document.documentElement.setAttribute('data-era', systemStore.era);
		document.documentElement.setAttribute('lang', systemStore.lang);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>RetroOS - mirkoschubert</title>
</svelte:head>

{@render children()}
