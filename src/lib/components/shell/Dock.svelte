<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import DockGlyph from './DockGlyph.svelte';

	interface Props {
		activeKeys: string[];
		onOpenModule: (key: string) => void;
	}

	const { activeKeys, onOpenModule }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	const dockItems = $derived([
		{ key: 'projects',     label: t.mod_projects() },
		{ key: 'media',        label: t.mod_media() },
		{ key: 'darkroom',     label: t.mod_darkroom() },
		{ key: 'writer',       label: t.mod_writer() },
		{ key: 'publications', label: t.mod_publications() },
		{ key: 'sysinfo',      label: t.mod_sysinfo() },
		{ key: 'terminal',     label: t.mod_terminal() }
	]);
</script>

<div class="dock">
	{#each dockItems as item, i (item.key)}
		{#if i === 5}
			<div class="dock-divider"></div>
		{/if}
		<button
			class="dock-item"
			class:is-active={activeKeys.includes(item.key)}
			onclick={() => onOpenModule(item.key)}
			title={item.label}
		>
			<DockGlyph kind={item.key} />
			<span class="dock-tooltip">{item.label}</span>
		</button>
	{/each}
</div>
