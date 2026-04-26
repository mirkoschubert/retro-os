<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { PROJECTS, ESSAYS, PHOTOS, TRACKS, pickL } from '$lib/data/placeholder.js';
	import type { Lang, Era } from '$lib/stores/system.svelte.js';

	interface Props {
		open: boolean;
		lang: Lang;
		onClose: () => void;
		onOpenModule: (key: string) => void;
		onSetLang: (lang: Lang) => void;
		onSetEra: (era: Era) => void;
	}

	const { open, lang, onClose, onOpenModule, onSetLang, onSetEra }: Props = $props();
	const t = $derived(getMessages(lang));

	let query = $state('');
	let activeIdx = $state(0);
	let inputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		if (open) {
			query = '';
			activeIdx = 0;
			setTimeout(() => inputEl?.focus(), 30);
		}
	});

	interface PaletteItem {
		id: string;
		label: string;
		sub?: string;
		kind: string;
		on: () => void;
	}

	const allItems = $derived<PaletteItem[]>([
		{ id: 'open-projects', label: `${t.open_prog_prefix()} ${t.mod_projects()}`, kind: 'PROG', on: () => onOpenModule('projects') },
		{ id: 'open-media',    label: `${t.open_prog_prefix()} ${t.mod_media()}`,    kind: 'PROG', on: () => onOpenModule('media') },
		{ id: 'open-darkroom', label: `${t.open_prog_prefix()} ${t.mod_darkroom()}`, kind: 'PROG', on: () => onOpenModule('darkroom') },
		{ id: 'open-writer',   label: `${t.open_prog_prefix()} ${t.mod_writer()}`,   kind: 'PROG', on: () => onOpenModule('writer') },
		{ id: 'open-sysinfo',  label: `${t.open_prog_prefix()} ${t.mod_sysinfo()}`,  kind: 'PROG', on: () => onOpenModule('sysinfo') },
		{ id: 'open-publications', label: `${t.open_prog_prefix()} ${t.mod_publications()}`, kind: 'PROG', on: () => onOpenModule('publications') },
		{ id: 'open-terminal',     label: `${t.open_prog_prefix()} ${t.mod_terminal()}`,     kind: 'PROG', on: () => onOpenModule('terminal') },
		{ id: 'lang-en',       label: 'Language - English',  kind: 'PREF', on: () => onSetLang('en') },
		{ id: 'lang-de',       label: 'Sprache - Deutsch',   kind: 'PREF', on: () => onSetLang('de') },
		{ id: 'era-graphite',  label: 'Theme - Graphite (NeXT)',   kind: 'PREF', on: () => onSetEra('graphite') },
		{ id: 'era-atelier',   label: 'Theme - Atelier (Mac 7)',   kind: 'PREF', on: () => onSetEra('atelier') },
		{ id: 'era-workbench', label: 'Theme - Workbench (Amiga)', kind: 'PREF', on: () => onSetEra('workbench') },
		...PROJECTS.map((p) => ({
			id: 'proj-' + p.id,
			label: pickL(lang, p.title),
			sub: `${p.year} · ${p.client}`,
			kind: 'PROJ',
			on: () => onOpenModule('projects')
		})),
		...ESSAYS.map((e) => ({
			id: 'ess-' + e.id,
			label: pickL(lang, e.title),
			sub: `${e.date} · ${e.minutes}min`,
			kind: 'TEXT',
			on: () => onOpenModule('writer')
		})),
		...PHOTOS.slice(0, 6).map((p) => ({
			id: 'ph-' + p.id,
			label: pickL(lang, p.title),
			sub: `${p.date} · ${p.camera}`,
			kind: 'PHOT',
			on: () => onOpenModule('darkroom')
		})),
		...TRACKS.slice(0, 6).map((t) => ({
			id: 'tr-' + t.id,
			label: t.title,
			sub: `${t.artist} · ${t.album}`,
			kind: 'MUSC',
			on: () => onOpenModule('media')
		}))
	]);

	const filtered = $derived(() => {
		if (!query) return allItems;
		const s = query.toLowerCase();
		return allItems.filter(
			(it) =>
				it.label.toLowerCase().includes(s) ||
				(it.sub ?? '').toLowerCase().includes(s) ||
				it.kind.toLowerCase().includes(s)
		);
	});

	function choose(item: PaletteItem) {
		item.on();
		onClose();
	}

	function handleKeyDown(e: KeyboardEvent) {
		const items = filtered();
		if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); }
		else if (e.key === 'Enter' && items[activeIdx]) { choose(items[activeIdx]); }
		else if (e.key === 'Escape') { onClose(); }
	}
</script>

{#if open}
	<div
		class="palette-overlay"
		onmousedown={onClose}
		role="dialog"
		aria-modal="true"
		aria-label="Command Palette"
		tabindex="-1"
	>
		<div class="palette" onmousedown={(e) => e.stopPropagation()} role="none">
			<input
				bind:this={inputEl}
				class="palette-input"
				placeholder={t.palette_placeholder()}
				bind:value={query}
				oninput={() => (activeIdx = 0)}
				onkeydown={handleKeyDown}
				aria-label="Search commands"
			/>
			<div class="palette-list" role="listbox">
				{#if filtered().length === 0}
					<div class="palette-row dim" style="font-style:italic">
						{t.palette_no_match()}
					</div>
				{/if}
				{#each filtered().slice(0, 40) as item, i (item.id)}
					<div
						class="palette-row"
						class:is-active={i === activeIdx}
						onmouseenter={() => (activeIdx = i)}
						onclick={() => choose(item)}
						onkeydown={(e) => { if (e.key === 'Enter') choose(item); }}
						role="option"
						aria-selected={i === activeIdx}
						tabindex="0"
					>
						<span class="row-icon">{item.kind[0]}</span>
						<span style="flex:1">
							{item.label}
							{#if item.sub}
								<span class="dim mono" style="margin-left:10px;font-size:10.5px">{item.sub}</span>
							{/if}
						</span>
						<span class="meta">{item.kind}</span>
					</div>
				{/each}
			</div>
			<div class="palette-foot">
				<span><span class="kbd">↑↓</span> {t.palette_navigate()}</span>
				<span><span class="kbd">↵</span> {t.palette_open()}</span>
				<span><span class="kbd">esc</span> {t.palette_close()}</span>
			</div>
		</div>
	</div>
{/if}
