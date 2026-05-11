<script lang="ts">
	import { onMount } from 'svelte';
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { wmStore } from '$lib/stores/wm.svelte.js';
	import { urlFor } from '$lib/sanity/image.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import type { Photo, PhotoSeries } from '$lib/sanity/types.js';
	import { LayoutGrid, Image } from '@lucide/svelte';

	interface Props {
		winId?: string;
		photos?: Photo[];
		photoSeries?: PhotoSeries[];
		initialId?: string;
	}

	const { winId, photos = [], photoSeries = [], initialId }: Props = $props();

	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	let selectedId = $state('');
	let view = $state<'contact' | 'single'>('contact');
	$effect.pre(() => {
		if (!selectedId && photos.length > 0 && initialId) {
			selectedId = initialId;
			view = 'single';
		}
	});
	$effect(() => {
		if (initialId) {
			selectedId = initialId;
			view = 'single';
		}
	});
	let selectedSeriesId = $state<string | null>(null);
	let exposure = $state(0);
	let contrast = $state(0);
	let grain = $state(0);
	let filmstripEl = $state<HTMLElement | null>(null);

	const grainSvg = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Crect width='1' height='1' fill='white' opacity='0.5'/%3E%3Crect x='1' y='2' width='1' height='1' fill='black' opacity='0.5'/%3E%3C/svg%3E";

	const imageFilter = $derived(
		`brightness(${1 + exposure * 0.15}) contrast(${1 + contrast * 0.2})`
	);

	const filteredPhotos = $derived(
		selectedSeriesId === null
			? photos
			: photos.filter((p) => p.series?._id === selectedSeriesId)
	);

	const selected = $derived(
		filteredPhotos.find((p) => p._id === selectedId) ?? filteredPhotos[0]
	);

	const selectedIndex = $derived(
		filteredPhotos.findIndex((p) => p._id === selectedId)
	);

	const pathLabel = $derived(() => {
		if (selectedSeriesId) {
			const s = photoSeries.find((s) => s._id === selectedSeriesId);
			return s ? `/Photos/${pickLocale(lang, s.title)}` : '/Photos';
		}
		return '/Photos';
	});

	function selectPhoto(id: string, switchToSingle = false) {
		selectedId = id;
		if (switchToSingle) view = 'single';
	}

	function navigate(dir: -1 | 1) {
		if (filteredPhotos.length === 0) return;
		const next = (selectedIndex + dir + filteredPhotos.length) % filteredPhotos.length;
		selectedId = filteredPhotos[next]._id;
		scrollFilmstripToActive();
	}

	function scrollFilmstripToActive() {
		if (!filmstripEl) return;
		const active = filmstripEl.querySelector('[data-active="true"]') as HTMLElement | null;
		active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}

	function isFocused(): boolean {
		return wmStore.focusedId === winId;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!isFocused() || view !== 'single') return;
		if (e.key === 'ArrowDown') { e.preventDefault(); navigate(1); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); navigate(-1); }
		else if (e.key === 'Escape') { e.preventDefault(); view = 'contact'; }
	}

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});

	$effect(() => {
		// Set initial selection and reset when filteredPhotos changes selection out of range
		if (filteredPhotos.length > 0 && !filteredPhotos.find((p) => p._id === selectedId)) {
			selectedId = filteredPhotos[0]._id;
		}
	});

	const selectedMeta = $derived({
		camera:   selected?.camera,
		lens:     selected?.lens,
		iso:      selected?.iso,
		shutter:  selected?.shutter,
		aperture: selected?.aperture,
		date:     selected?.date,
	});
</script>

<div class="module" style="flex-direction:column">
	<div class="toolbar">
		<button class="tb-btn" class:is-active={view === 'contact'} onclick={() => (view = 'contact')}><LayoutGrid size={14} /> {t.recent()}</button>
		<button class="tb-btn" class:is-active={view === 'single'} onclick={() => (view = 'single')}><Image size={14} /> {lang === 'de' ? 'Einzelansicht' : 'Single'}</button>
		<div class="sep"></div>

		{#if photoSeries.length > 0}
			<select
				class="tb-select mono"
				value={selectedSeriesId ?? ''}
				onchange={(e) => {
					const v = (e.target as HTMLSelectElement).value;
					selectedSeriesId = v === '' ? null : v;
				}}
			>
				<option value="">{lang === 'de' ? 'Alle Serien' : 'All series'}</option>
				{#each photoSeries as s (s._id)}
					<option value={s._id}>{pickLocale(lang, s.title)} ({s.photoCount})</option>
				{/each}
			</select>
			<div class="sep"></div>
		{/if}

		<span class="tb-label mono">{pathLabel()}</span>
		<div style="flex:1"></div>
		<span class="dim mono">{filteredPhotos.length} {lang === 'de' ? 'Aufnahmen' : 'frames'}</span>
	</div>

	{#if filteredPhotos.length === 0}
		<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-2);font-size:13px;font-family:var(--font-mono)">
			{lang === 'de' ? 'Keine Fotos vorhanden.' : 'No photos available.'}
		</div>
	{:else if view === 'contact'}
		<div style="flex:1;overflow:auto;padding:14px;background:var(--bg-0)">
			<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">
				{#each filteredPhotos as p (p._id)}
					<div
						onclick={() => selectPhoto(p._id, true)}
						style="cursor:pointer"
						role="button"
						tabindex="0"
						onkeydown={(e) => { if (e.key === 'Enter') selectPhoto(p._id, true); }}
					>
						{#if p.image}
							<img
								src={urlFor(p.image).width(400).height(267).format('webp').url()}
								alt={pickLocale(lang, p.title)}
								loading="lazy"
								style="width:100%;aspect-ratio:3/2;object-fit:cover;display:block"
							/>
						{:else}
							<div class="ph-image" style="aspect-ratio:3/2">
								<div class="ph-cap">{p._id.slice(0, 8)}</div>
							</div>
						{/if}
						<div class="mono dim" style="font-size:10.5px;margin-top:4px;letter-spacing:0.04em">{p.date ?? ''}</div>
						<div style="font-size:11.5px;color:var(--text-1);margin-top:1px">{pickLocale(lang, p.title)}</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if selected}
		<div class="single-layout">
					<!-- Filmstrip: vertical sidebar on desktop, horizontal strip on mobile -->
			<div
				bind:this={filmstripEl}
				class="filmstrip"
			>
				{#each filteredPhotos as p, i (p._id)}
					<button
						data-active={p._id === selectedId ? 'true' : 'false'}
						onclick={() => selectPhoto(p._id)}
						style="padding:0;border:0;background:none;outline:{p._id === selectedId ? '2px solid var(--accent)' : 'none'};cursor:pointer"
						aria-label={pickLocale(lang, p.title) || `Photo ${i + 1}`}
					>
						{#if p.image}
							<img
								src={urlFor(p.image).width(200).height(133).format('webp').url()}
								alt=""
								loading="lazy"
								style="width:100%;aspect-ratio:3/2;object-fit:cover;display:block"
							/>
						{:else}
							<div class="ph-image" style="aspect-ratio:3/2">
								<div class="ph-tag">{i + 1}</div>
							</div>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Main viewer -->
			<div style="flex:1;min-height:0;background:#0a0b0d;display:flex;flex-direction:column">
				<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:24px;overflow:hidden">
					{#if selected.image}
						<div style="position:relative;max-width:100%;max-height:100%;display:flex;filter:{imageFilter}">
							<img
								src={urlFor(selected.image).width(1200).format('webp').url()}
								alt={pickLocale(lang, selected.title)}
								style="max-width:100%;max-height:100%;width:auto;height:auto;display:block;object-fit:contain"
							/>
							{#if grain > 0}
								<div style="position:absolute;inset:0;pointer-events:none;background-image:url({grainSvg});opacity:{grain * 0.18};mix-blend-mode:overlay"></div>
							{/if}
						</div>
					{:else}
						<div class="ph-image" style="width:480px;aspect-ratio:3/2">
							<div class="ph-cap">{selected._id.slice(0, 8)}.raw</div>
						</div>
					{/if}
				</div>

				<!-- Metadata strip -->
				<div class="meta-strip">
					<div>
						<div class="serif" style="font-size:16px;color:var(--text-0);margin-bottom:6px">{pickLocale(lang, selected.title)}</div>
						<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:4px">
							{#if selectedMeta.camera}
								<span class="meta-chip mono">{selectedMeta.camera}</span>
							{/if}
							{#if selectedMeta.lens}
								<span class="meta-chip mono">{selectedMeta.lens}</span>
							{/if}
						</div>
						<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">
							{#if selectedMeta.aperture || selectedMeta.shutter || selectedMeta.iso}
								<span class="meta-chip mono dim">
									{[selectedMeta.aperture, selectedMeta.shutter, selectedMeta.iso ? `ISO ${selectedMeta.iso}` : null].filter(Boolean).join('  ')}
								</span>
							{/if}
							{#if selectedMeta.date}
								<span class="meta-chip mono dim">{selectedMeta.date}</span>
							{/if}
						</div>
					</div>
					<div style="display:grid;grid-template-columns:auto 1fr auto;row-gap:6px;column-gap:8px;align-items:center">
						<span class="mono dim" style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em">{lang === 'de' ? 'Bel.' : 'Exp.'}</span>
						<input type="range" min="-2" max="2" step="0.01" bind:value={exposure} style="accent-color:var(--accent)" />
						<span class="mono dim" style="font-size:10px;min-width:28px;text-align:right">{exposure > 0 ? '+' : ''}{exposure.toFixed(1)}</span>

						<span class="mono dim" style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em">{lang === 'de' ? 'Kontr.' : 'Cont.'}</span>
						<input type="range" min="-2" max="2" step="0.01" bind:value={contrast} style="accent-color:var(--accent)" />
						<span class="mono dim" style="font-size:10px;min-width:28px;text-align:right">{contrast > 0 ? '+' : ''}{contrast.toFixed(1)}</span>

						<span class="mono dim" style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em">{lang === 'de' ? 'Korn' : 'Grain'}</span>
						<input type="range" min="0" max="1" step="0.01" bind:value={grain} style="accent-color:var(--accent)" />
						<span class="mono dim" style="font-size:10px;min-width:28px;text-align:right">{grain.toFixed(2)}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.single-layout {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.filmstrip {
		width: 110px;
		background: var(--bg-2);
		border-right: 1px solid var(--line-0);
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex-shrink: 0;
	}

	.meta-strip {
		border-top: 1px solid var(--line-0);
		background: var(--bg-2);
		padding: 12px 18px;
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 24px;
		align-items: center;
	}

	@media (max-width: 640px) {
		.single-layout {
			flex-direction: column;
		}
		.filmstrip {
			width: auto;
			height: 72px;
			flex-direction: row;
			overflow-x: auto;
			overflow-y: hidden;
			border-right: none;
			border-bottom: 1px solid var(--line-0);
			padding: 6px 8px;
			flex-shrink: 0;
		}
		.filmstrip :global(button) {
			flex-shrink: 0;
			width: 96px;
		}
		.filmstrip :global(img),
		.filmstrip :global(.ph-image) {
			width: 96px;
			aspect-ratio: 3/2;
		}
		.meta-strip {
			grid-template-columns: 1fr;
			gap: 12px;
			padding: 10px 12px;
		}
	}

	.tb-select {
		background: var(--bg-1);
		border: 1px solid var(--line-0);
		color: var(--text-1);
		font-size: 11px;
		padding: 2px 6px;
		height: 22px;
		cursor: pointer;
	}
	.tb-select:focus {
		outline: 1px solid var(--accent);
	}
	.meta-chip {
		font-size: 10.5px;
		letter-spacing: 0.05em;
		background: var(--bg-1);
		border: 1px solid var(--line-0);
		padding: 2px 7px;
		color: var(--text-1);
		white-space: nowrap;
	}
	.meta-chip.dim {
		color: var(--text-2);
		background: transparent;
		border-color: transparent;
	}
</style>
