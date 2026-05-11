<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { PortableText } from '@portabletext/svelte';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { wmStore } from '$lib/stores/wm.svelte.js';
	import { calcReadingTime, pickLocale } from '$lib/sanity/utils.js';
	import type { Writing } from '$lib/sanity/types.js';
	import { ChevronLeft, ChevronRight, ArrowLeft, LayoutList, Columns2, Search } from '@lucide/svelte';
	import TbSelect from '$lib/components/ui/TbSelect.svelte';

	interface Props {
		winId?: string;
		writings?: Writing[];
		initialId?: string;
		writerView?: 'list' | 'columns';
	}

	const { writings = [], initialId, winId, writerView: writerViewProp }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	let localView = $state<'list' | 'columns'>('columns');
	const effectiveView = $derived(writerViewProp ?? localView);

	// On mobile, force list view
	$effect(() => {
		if (systemStore.deviceClass === 'mobile' && localView === 'columns') {
			localView = 'list';
		}
	});

	// reading = true: show full-width content (used on mobile always, on desktop in list-view)
	let reading = $state(false);

	function setView(v: 'list' | 'columns') {
		localView = v;
		reading = false;
		if (winId) wmStore.updateProps(winId, { writerView: v });
	}

	let search = $state('');
	let categoryFilter = $state<'all' | Writing['category']>('all');

	const filtered = $derived(
		writings.filter((w) => {
			if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
			if (search) {
				const s = search.toLowerCase();
				const title = pickLocale(lang, w.title).toLowerCase();
				if (!title.includes(s)) return false;
			}
			return true;
		})
	);

	let selectedId = $state<string | null>(null);
	$effect.pre(() => {
		if (selectedId === null && writings.length > 0) selectedId = initialId ?? writings[0]._id;
	});
	$effect(() => {
		if (initialId) selectedId = initialId;
	});
	const effectiveId = $derived(selectedId ?? filtered[0]?._id ?? null);
	const selected = $derived(writings.find((w) => w._id === effectiveId) ?? null);

	const readingTime = $derived(
		selected
			? calcReadingTime(
					((selected.body?.[lang] ?? selected.body?.en ?? []) as unknown[]),
					lang
				)
			: 1
	);

	const bodyBlocks = $derived(
		selected
			? ((selected.body?.[lang] ?? selected.body?.en ?? []) as unknown[])
			: []
	);

	const selectedIndex = $derived(filtered.findIndex((w) => w._id === effectiveId));
	const prevWriting = $derived(selectedIndex > 0 ? filtered[selectedIndex - 1] : null);
	const nextWriting = $derived(
		selectedIndex >= 0 && selectedIndex < filtered.length - 1 ? filtered[selectedIndex + 1] : null
	);

	const filterOptions = $derived([
		{ value: 'all', label: t.all() },
		{ value: 'essay', label: t.cat_essay() },
		{ value: 'poem', label: t.cat_poem() },
		{ value: 'flash-fiction', label: t.cat_flash_fiction() },
		{ value: 'note', label: t.cat_note() }
	] as { value: string; label: string }[]);

	const categoryLabels = $derived<Record<Writing['category'], string>>({
		poem: t.cat_poem(),
		'flash-fiction': t.cat_flash_fiction(),
		essay: t.cat_essay(),
		note: t.cat_note()
	});

	function categoryLabel(cat: Writing['category']): string {
		return categoryLabels[cat] ?? cat;
	}

	// Show reading view: on mobile always, on desktop only in list-view
	const showReading = $derived(reading || effectiveView === 'columns');
	// Show list: sidebar in columns-view (desktop), full list when not reading
	const showList = $derived(!reading);

	function openReading(id: string) {
		selectedId = id;
		reading = true;
	}

	function closeReading() {
		reading = false;
	}

	let searchOpen = $state(false);
	const searchPlaceholder = $derived(t.search_placeholder());
	const minRead = $derived(t.min_read());
</script>

<div class="module" style="flex-direction:column">
	<!-- Toolbar -->
	<div class="toolbar" style="position:relative">
		{#if reading && effectiveView === 'list'}
			<!-- List-view reading mode: back + title -->
			<button class="tb-btn" onclick={closeReading}><ArrowLeft size={13} /> {lang === 'de' ? 'Zurück' : 'Back'}</button>
			<div class="sep"></div>
			<span class="tb-label">{selected ? pickLocale(lang, selected.title) : ''}</span>
		{:else}
			<!-- Category filter dropdown -->
			<TbSelect
				options={filterOptions}
				value={categoryFilter}
				onChange={(v) => {
					categoryFilter = v as typeof categoryFilter;
					selectedId = null;
					reading = false;
				}}
			/>
			<div class="sep"></div>
			<button
				class="tb-btn"
				class:is-active={effectiveView === 'list'}
				onclick={() => setView('list')}
				title={lang === 'de' ? 'Listenansicht' : 'List view'}
			><LayoutList size={14} /></button>
			<button
				class="tb-btn"
				class:is-active={effectiveView === 'columns'}
				class:is-disabled={systemStore.deviceClass === 'mobile'}
				disabled={systemStore.deviceClass === 'mobile'}
				onclick={() => setView('columns')}
				title={lang === 'de' ? 'Spaltenansicht' : 'Columns view'}
			><Columns2 size={14} /></button>
		{/if}
		<div style="flex:1"></div>
		{#if !reading || effectiveView === 'columns'}
			{#if systemStore.deviceClass === 'mobile'}
				<button class="tb-btn" onclick={() => (searchOpen = !searchOpen)}><Search size={14} /></button>
				{#if searchOpen}
					<div class="search-overlay">
						<Search size={13} />
						<input
							type="search"
							placeholder="{searchPlaceholder}…"
							bind:value={search}
							autofocus
							oninput={() => { selectedId = null; reading = false; }}
							onkeydown={(e) => { if (e.key === 'Escape') { searchOpen = false; search = ''; } }}
						/>
						<button class="tb-btn" onclick={() => { searchOpen = false; search = ''; }}>✕</button>
					</div>
				{/if}
			{:else}
				<input
					type="search"
					placeholder={searchPlaceholder}
					bind:value={search}
					oninput={() => { selectedId = null; reading = false; }}
				/>
			{/if}
		{/if}
	</div>

	<div class="writer-layout" class:is-columns={effectiveView === 'columns'}>

		<!-- List panel: sidebar in columns-view, full-width in list-view -->
		{#if showList}
			<div class="writer-list" class:is-sidebar={effectiveView === 'columns'}>
				{#if filtered.length === 0}
					<div style="padding:18px 14px;font-size:11.5px;color:var(--text-3);font-family:var(--font-mono)">
						{t.no_results()}
					</div>
				{:else}
					{#each filtered as w (w._id)}
						{@const isActive = effectiveId === w._id && effectiveView === 'columns'}
						<div
							class="writer-list-row"
							class:is-active={isActive}
							onclick={() => {
								if (effectiveView === 'list') openReading(w._id);
								else selectedId = w._id;
							}}
							role="button"
							tabindex="0"
							onkeydown={(ev) => {
								if (ev.key === 'Enter') {
									if (effectiveView === 'list') openReading(w._id);
									else selectedId = w._id;
								}
							}}
						>
							<div class="writer-list-meta mono">
								<span class="writer-cat-badge">{categoryLabel(w.category)}</span>
								<span>{w.date}</span>
							</div>
							<div class="writer-list-title" class:active-title={isActive}>
								{pickLocale(lang, w.title)}
							</div>
							{#if w.excerpt?.[lang] || w.excerpt?.en}
								<div class="writer-list-excerpt">
									{w.excerpt?.[lang] ?? w.excerpt?.en ?? ''}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{/if}

		<!-- Content panel: always visible in columns-view, visible when reading in list-view -->
		{#if showReading}
			<div class="module-main writer-content" style="background:var(--bg-0);overflow-y:auto">
				{#if selected}
					<div class="writer-content-inner">
						<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:14px">
							{categoryLabel(selected.category)} · {selected.date}
						</div>
						<h1 class="serif" style="font-family:var(--font-display);font-size:34px;font-weight:600;line-height:1.15;color:var(--text-0);margin:0 0 12px;letter-spacing:-0.01em">
							{pickLocale(lang, selected.title)}
						</h1>
						<div class="dim" style="font-size:12px;margin-bottom:28px;font-style:italic">
							Mirko Schubert · {readingTime} {minRead}
						</div>

						<div class="writer-body">
							<PortableText value={bodyBlocks as any} onMissingComponent={false} />
						</div>

						<div class="writer-nav mono dim">
							<button
								class="writer-nav-btn"
								class:disabled={!prevWriting}
								onclick={() => {
									if (prevWriting) {
										selectedId = prevWriting._id;
										if (effectiveView === 'list') reading = true;
									}
								}}
								disabled={!prevWriting}
							><ChevronLeft size={13} /> {t.prev()}</button>
							<button
								class="writer-nav-btn"
								class:disabled={!nextWriting}
								onclick={() => {
									if (nextWriting) {
										selectedId = nextWriting._id;
										if (effectiveView === 'list') reading = true;
									}
								}}
								disabled={!nextWriting}
							>{t.next()} <ChevronRight size={13} /></button>
						</div>
					</div>
				{:else}
					<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-3);font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase">
						{t.no_results()}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.writer-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* List panel */
	.writer-list {
		flex: 1;
		overflow-y: auto;
	}
	.writer-list.is-sidebar {
		flex: 0 0 260px;
		border-right: 1px solid var(--line-0);
	}

	/* List rows */
	.writer-list-row {
		padding: 14px 18px;
		border-bottom: 1px solid var(--line-0);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.writer-list-row:hover { background: var(--bg-2); }
	.writer-list-row.is-active { background: var(--accent); }
	.writer-list-row.is-active:hover { background: var(--accent); }

	.writer-list-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10px;
		color: var(--text-3);
		letter-spacing: 0.07em;
	}
	.writer-list-row.is-active .writer-list-meta { color: var(--bg-1); }

	.writer-cat-badge {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 9px;
		border: 1px solid var(--line-1);
		padding: 1px 5px;
		color: var(--text-2);
	}
	.writer-list-row.is-active .writer-cat-badge {
		border-color: var(--bg-1);
		color: var(--bg-0);
	}

	.writer-list-title {
		font-weight: 500;
		font-size: 13px;
		color: var(--text-0);
		line-height: 1.35;
	}
	.writer-list-title.active-title { color: var(--bg-0); }

	.writer-list-excerpt {
		font-size: 11.5px;
		color: var(--text-3);
		line-height: 1.55;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.writer-list-row.is-active .writer-list-excerpt { color: var(--bg-1); }

	/* Content panel */
	.writer-content {
		flex: 1;
	}
	.writer-content-inner {
		max-width: 640px;
		margin: 0 auto;
		padding: 44px 36px 80px;
	}

	/* Prev/Next nav */
	.writer-nav {
		margin-top: 36px;
		padding-top: 18px;
		border-top: 1px solid var(--line-1);
		display: flex;
		justify-content: space-between;
		font-size: 11.5px;
	}
	.writer-nav-btn {
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-mono);
		font-size: 11.5px;
		cursor: pointer;
		color: var(--text-1);
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.writer-nav-btn.disabled { color: var(--text-3); cursor: default; }

	.search-overlay {
		position: absolute;
		inset: 0;
		background: var(--bg-1);
		border-bottom: 1px solid var(--line-1);
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 10px;
		z-index: 10;
		color: var(--text-2);
	}
	.search-overlay input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--text-0);
		font-size: 12px;
		font-family: var(--font-mono);
	}

	@media (max-width: 640px) {
		.writer-list.is-sidebar {
			flex: 1;
			border-right: none;
		}
		.writer-content-inner {
			padding: 24px 18px 60px;
		}
	}
</style>
