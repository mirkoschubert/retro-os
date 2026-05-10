<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import type { Lang, Era } from '$lib/stores/system.svelte.js';
	import type { Project, Writing, Photo, Album, Publication } from '$lib/sanity/types.js';
	import {
		LayoutDashboard, Disc, Camera, BookOpen, Newspaper, Info, SquareTerminal,
		Settings, FolderOpen, Image, Music2, FileText,
		ArrowUp, ArrowDown, CornerDownLeft, X as IconX
	} from '@lucide/svelte';

	const kindIcon: Record<string, unknown> = {
		PROG: LayoutDashboard, PROJ: FolderOpen, TEXT: FileText,
		PHOT: Image, MUSC: Music2, PUB: Newspaper, PREF: Settings
	};

	interface Props {
		open: boolean;
		lang: Lang;
		onClose: () => void;
		onOpenModule: (key: string, extraProps?: Record<string, unknown>) => void;
		onSetLang: (lang: Lang) => void;
		onSetEra: (era: Era) => void;
		projects?: Project[];
		writings?: Writing[];
		photos?: Photo[];
		albums?: Album[];
		publications?: Publication[];
	}

	const { open, lang, onClose, onOpenModule, onSetLang, onSetEra,
		projects = [], writings = [], photos = [], albums = [], publications = []
	}: Props = $props();
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
		...projects.map((p) => ({
			id: 'proj-' + p._id,
			label: pickLocale(lang, p.title),
			sub: [p.year, p.client].filter(Boolean).join(' · '),
			kind: 'PROJ',
			on: () => onOpenModule('projects', { initialId: p._id })
		})),
		...writings.map((w) => ({
			id: 'ess-' + w._id,
			label: pickLocale(lang, w.title),
			sub: w.date ?? '',
			kind: 'TEXT',
			on: () => onOpenModule('writer', { initialId: w._id })
		})),
		...photos.map((p) => ({
			id: 'ph-' + p._id,
			label: pickLocale(lang, p.title),
			sub: [p.date, p.camera].filter(Boolean).join(' · '),
			kind: 'PHOT',
			on: () => onOpenModule('darkroom', { initialId: p._id })
		})),
		...albums.flatMap((a) =>
			(a.tracks ?? []).map((tr) => ({
				id: 'tr-' + a._id + '-' + tr._key,
				label: tr.title,
				sub: `${tr.artist ?? a.artist} · ${a.title}`,
				kind: 'MUSC',
				on: () => onOpenModule('media', { initialAlbumId: a._id })
			}))
		),
		...publications.map((p) => ({
			id: 'pub-' + p._id,
			label: p.name,
			sub: p.category ?? '',
			kind: 'PUB',
			on: () => onOpenModule('publications', { initialId: p._id })
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
		else if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
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
						<span class="row-icon">
							{#if kindIcon[item.kind]}{@const Icon = kindIcon[item.kind] as any}<Icon size={13} strokeWidth={1.6} />{:else}{item.kind[0]}{/if}
						</span>
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
				<span><span class="kbd"><ArrowUp size={10} /></span><span class="kbd"><ArrowDown size={10} /></span> {t.palette_navigate()}</span>
				<span><span class="kbd"><CornerDownLeft size={10} /></span> {t.palette_open()}</span>
				<span><span class="kbd" style="font-size:9px">esc</span> {t.palette_close()}</span>
			</div>
		</div>
	</div>
{/if}
