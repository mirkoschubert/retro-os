<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { wmStore } from '$lib/stores/wm.svelte.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import type { Publication } from '$lib/sanity/types.js';
	import { ArrowLeft, LayoutList, Columns2, Search } from '@lucide/svelte';
	import TbSelect from '$lib/components/ui/TbSelect.svelte';

	interface Props {
		publications?: Publication[];
		winId?: string;
		initialId?: string;
		pubView?: 'list' | 'columns';
	}

	const { publications = [], initialId, winId, pubView: pubViewProp }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	let localView = $state<'list' | 'columns'>('columns');
	const effectiveView = $derived(pubViewProp ?? localView);

	$effect(() => {
		if (systemStore.deviceClass === 'mobile' && localView === 'columns') {
			localView = 'list';
		}
	});

	let reading = $state(false);
	let searchOpen = $state(false);

	function setView(v: 'list' | 'columns') {
		localView = v;
		reading = false;
		if (winId) wmStore.updateProps(winId, { pubView: v });
	}

	type Category = 'all' | NonNullable<Publication['category']>;
	let categoryFilter = $state<Category>('all');
	let search = $state('');

	const filtered = $derived(
		publications.filter((p) => {
			if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
			if (search) {
				const s = search.toLowerCase();
				if (!p.name.toLowerCase().includes(s)) return false;
			}
			return true;
		})
	);

	let selectedId = $state<string | null>(null);
	$effect.pre(() => {
		if (selectedId === null && publications.length > 0) selectedId = initialId ?? publications[0]._id;
	});
	$effect(() => {
		if (initialId) selectedId = initialId;
	});
	const effectiveId = $derived(selectedId ?? filtered[0]?._id ?? null);
	const selected = $derived(publications.find((p) => p._id === effectiveId) ?? null);

	const filterOptions = $derived([
		{ value: 'all',       label: t.pub_all() },
		{ value: 'tech',      label: t.pub_tech() },
		{ value: 'culture',   label: t.pub_culture() },
		{ value: 'music',     label: t.pub_music() },
		{ value: 'lifestyle', label: t.pub_lifestyle() }
	] as { value: string; label: string }[]);

	const catLabels = $derived<Record<NonNullable<Publication['category']>, string>>({
		tech:      t.pub_tech(),
		culture:   t.pub_culture(),
		music:     t.pub_music(),
		lifestyle: t.pub_lifestyle()
	});

	function periodStr(p: Publication): string {
		if (!p.period) return '';
		const { from, to } = p.period;
		if (from && to) return `${from} - ${to}`;
		if (from) return `${from} -`;
		return '';
	}

	function linkTypeIcon(url: string): string {
		if (url.endsWith('.pdf')) return 'PDF';
		return 'WWW';
	}

	const showReading = $derived(reading || effectiveView === 'columns');
	const showList = $derived(!reading);

	function openReading(id: string) {
		selectedId = id;
		reading = true;
	}
</script>

<div class="module" style="flex-direction:column">
	<!-- Toolbar -->
	<div class="toolbar" style="position:relative">
		{#if reading && effectiveView === 'list'}
			<button class="tb-btn" onclick={() => { reading = false; }}><ArrowLeft size={13} /> {lang === 'de' ? 'Zurück' : 'Back'}</button>
			<div class="sep"></div>
			<span class="tb-label">{selected?.name ?? ''}</span>
		{:else}
			<TbSelect
				options={filterOptions}
				value={categoryFilter}
				onChange={(v) => { categoryFilter = v as Category; selectedId = null; reading = false; }}
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
							placeholder="{t.pub_search()}…"
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
					placeholder={t.pub_search()}
					bind:value={search}
					oninput={() => { selectedId = null; }}
				/>
			{/if}
		{/if}
	</div>

	<div class="pub-layout" class:is-columns={effectiveView === 'columns'}>

		{#if showList}
			<div class="pub-list" class:is-sidebar={effectiveView === 'columns'}>
				{#if filtered.length === 0}
					<div style="padding:18px 14px;font-size:11.5px;color:var(--text-3);font-family:var(--font-mono)">
						{t.pub_no_results()}
					</div>
				{:else}
					{#each filtered as pub (pub._id)}
						{@const isActive = effectiveId === pub._id && effectiveView === 'columns'}
						<div
							class="pub-list-row"
							class:is-active={isActive}
							onclick={() => {
								if (effectiveView === 'list') openReading(pub._id);
								else selectedId = pub._id;
							}}
							role="button"
							tabindex="0"
							onkeydown={(ev) => {
								if (ev.key === 'Enter') {
									if (effectiveView === 'list') openReading(pub._id);
									else selectedId = pub._id;
								}
							}}
						>
							<div class="pub-list-meta mono">
								{#if pub.category}
									<span class="pub-cat-badge">{catLabels[pub.category] ?? pub.category}</span>
								{/if}
								{#if periodStr(pub)}
									<span>{periodStr(pub)}</span>
								{/if}
							</div>
							<div class="pub-list-name" class:active-name={isActive}>{pub.name}</div>
							{#if pub.description}
								<div class="pub-list-desc">
									{pickLocale(lang, pub.description)}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{/if}

		{#if showReading}
			<div class="module-main pub-content" style="overflow-y:auto">
				{#if selected}
					<div class="pub-detail">
						<h2 class="pub-name">{selected.name}</h2>

						<div class="pub-meta">
							{#if selected.category}
								<span class="meta-chip">{catLabels[selected.category] ?? selected.category}</span>
							{/if}
							{#if periodStr(selected)}
								<span class="mono dim" style="font-size:11px">{periodStr(selected)}</span>
							{/if}
							{#if selected.url}
								<a href={selected.url} target="_blank" rel="noopener noreferrer" class="mono dim pub-url">
									{selected.url.replace(/^https?:\/\//, '')}
								</a>
							{/if}
						</div>

						{#if selected.description}
							<p class="pub-desc">{pickLocale(lang, selected.description)}</p>
						{/if}

						{#if selected.links && selected.links.length > 0}
							<div class="pub-links-section">
								<div class="mono dim pub-links-label">{t.pub_links()}</div>
								<div class="pub-links-list">
									{#each selected.links as link (link._id)}
										<a href={link.url} target="_blank" rel="noopener noreferrer" class="pub-link-row">
											<span class="mono pub-link-type">{linkTypeIcon(link.url)}</span>
											<span class="pub-link-body">
												<span class="pub-link-title">{link.title}</span>
												{#if link.date}
													<span class="mono dim pub-link-date">{link.date}</span>
												{/if}
												{#if link.note}
													<span class="dim pub-link-note">{link.note}</span>
												{/if}
											</span>
											<span class="mono dim pub-link-arrow">↗</span>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-3);font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase">
						{t.pub_no_results()}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.pub-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.pub-list {
		flex: 1;
		overflow-y: auto;
		background: var(--bg-2);
	}
	.pub-list.is-sidebar {
		flex: 0 0 240px;
		border-right: 1px solid var(--line-0);
	}

	.pub-list-row {
		padding: 12px 18px;
		border-bottom: 1px solid var(--line-0);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.pub-list-row:hover { background: var(--bg-2); }
	.pub-list-row.is-active { background: var(--accent); }
	.pub-list-row.is-active:hover { background: var(--accent); }

	.pub-list-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10px;
		color: var(--text-3);
		letter-spacing: 0.07em;
	}
	.pub-list-row.is-active .pub-list-meta { color: var(--bg-1); }

	.pub-cat-badge {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 9px;
		border: 1px solid var(--line-1);
		padding: 1px 5px;
		color: var(--text-2);
	}
	.pub-list-row.is-active .pub-cat-badge { border-color: var(--bg-1); color: var(--bg-0); }

	.pub-list-name {
		font-weight: 500;
		font-size: 13px;
		color: var(--text-0);
		line-height: 1.35;
	}
	.pub-list-name.active-name { color: var(--bg-0); }

	.pub-list-desc {
		font-size: 11.5px;
		color: var(--text-1);
		line-height: 1.55;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.pub-list-row.is-active .pub-list-desc { color: var(--bg-1); }

	.pub-content { flex: 1; }

	.pub-detail {
		padding: 28px 32px 48px;
		max-width: 620px;
	}
	.pub-name {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 600;
		color: var(--text-0);
		margin: 0 0 12px;
		line-height: 1.2;
	}
	.pub-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}
	.meta-chip {
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		padding: 2px 7px;
		border: 1px solid var(--line-1);
		color: var(--text-2);
		background: var(--bg-2);
	}
	.pub-url {
		font-size: 11px;
		color: var(--accent);
		text-decoration: none;
	}
	.pub-url:hover { text-decoration: underline; }
	.pub-desc {
		font-size: 13px;
		color: var(--text-1);
		line-height: 1.65;
		margin: 0 0 24px;
	}
	.pub-links-section { margin-top: 8px; }
	.pub-links-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		margin-bottom: 10px;
	}
	.pub-links-list { display: flex; flex-direction: column; gap: 2px; }
	.pub-link-row {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 7px 10px;
		border: 1px solid var(--line-1);
		background: var(--bg-2);
		text-decoration: none;
		transition: background 0.12s;
	}
	.pub-link-row:hover { background: var(--bg-3); }
	.pub-link-type {
		font-size: 9px;
		letter-spacing: 0.08em;
		color: var(--text-3);
		width: 28px;
		flex-shrink: 0;
	}
	.pub-link-body {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
	}
	.pub-link-title { font-size: 12.5px; color: var(--text-0); line-height: 1.4; }
	.pub-link-date { font-size: 10.5px; }
	.pub-link-note { font-size: 11px; color: var(--text-2); font-style: italic; }
	.pub-link-arrow { font-size: 12px; flex-shrink: 0; }

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
		.pub-list.is-sidebar {
			flex: 1;
			border-right: none;
		}
		.pub-detail {
			padding: 20px 16px 48px;
		}
	}
</style>
