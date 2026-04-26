<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { onMount } from 'svelte';

	let { children } = $props();
	let updateReady = $state(false);

	$effect(() => {
		document.documentElement.setAttribute('data-era', systemStore.era);
		document.documentElement.setAttribute('lang', systemStore.lang);
	});

	onMount(async () => {
		if (!('serviceWorker' in navigator)) return;
		const { useRegisterSW } = await import('virtual:pwa-register/svelte');
		const { needRefresh } = useRegisterSW();
		needRefresh.subscribe((v) => { if (v) updateReady = true; });
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1a1c20" />
	<title>RetroOS - mirkoschubert</title>
</svelte:head>

{@render children()}

{#if updateReady}
	<div class="sw-update-bar">
		<span>Update available</span>
		<button onclick={() => window.location.reload()}>Reload</button>
		<button onclick={() => { updateReady = false; }}>x</button>
	</div>
{/if}

<style>
	.sw-update-bar {
		position: fixed;
		bottom: 48px;
		right: 16px;
		background: var(--bg-2);
		border: 1px solid var(--accent);
		color: var(--text-1);
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 6px 10px;
		display: flex;
		align-items: center;
		gap: 10px;
		z-index: 9999;
	}
	.sw-update-bar button {
		background: none;
		border: none;
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: 11px;
		cursor: pointer;
		padding: 0;
	}
	.sw-update-bar button:hover {
		text-decoration: underline;
	}
</style>
