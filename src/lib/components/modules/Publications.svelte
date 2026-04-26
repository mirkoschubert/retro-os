<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import type { Publication } from '$lib/sanity/types.js';

	interface Props {
		publications?: Publication[];
		winId?: string;
	}

	const { publications = [] }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

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
	const effectiveId = $derived(selectedId ?? filtered[0]?._id ?? null);
	const selected = $derived(publications.find((p) => p._id === effectiveId) ?? null);

	const tabs = $derived([
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
		if (from && to) return `${from} – ${to}`;
		if (from) return `${from} –`;
		return '';
	}

	function linkTypeIcon(url: string): string {
		if (url.endsWith('.pdf')) return 'PDF';
		return 'WWW';
	}
</script>

<div class="module" style="flex-direction:column">
	<!-- Toolbar -->
	<div class="toolbar">
		{#each tabs as tab (tab.value)}
			<button
				class="tb-btn"
				class:is-active={categoryFilter === tab.value}
				onclick={() => { categoryFilter = tab.value as Category; selectedId = null; }}
			>{tab.label}</button>
		{/each}
		<div style="flex:1"></div>
		<input
			type="search"
			placeholder={t.pub_search()}
			bind:value={search}
			oninput={() => { selectedId = null; }}
		/>
	</div>

	<div style="display:flex;flex:1;overflow:hidden">
		<!-- Sidebar -->
		<div class="module-sidebar" style="width:220px;overflow-y:auto">
			{#if filtered.length === 0}
				<div style="padding:18px 14px;font-size:11.5px;color:var(--text-3);font-family:var(--font-mono)">
					{t.pub_no_results()}
				</div>
			{:else}
				{#each filtered as pub (pub._id)}
					<div
						class="list-row"
						class:is-active={effectiveId === pub._id}
						onclick={() => (selectedId = pub._id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => { if (e.key === 'Enter') selectedId = pub._id; }}
						style="flex-direction:column;align-items:flex-start;padding:8px 14px;gap:2px"
					>
						<div style="font-weight:500;font-size:12.5px;color:{effectiveId === pub._id ? 'var(--bg-0)' : 'var(--text-0)'};white-space:normal;line-height:1.3">
							{pub.name}
						</div>
						<div class="mono" style="font-size:10px;color:{effectiveId === pub._id ? 'var(--bg-0)' : 'var(--text-3)'};letter-spacing:0.06em">
							{periodStr(pub)}{pub.category ? (periodStr(pub) ? ' · ' : '') + (catLabels[pub.category] ?? pub.category) : ''}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Detail -->
		<div class="module-main" style="overflow-y:auto">
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
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										class="pub-link-row"
									>
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
	</div>
</div>

<style>
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

	.pub-url:hover {
		text-decoration: underline;
	}

	.pub-desc {
		font-size: 13px;
		color: var(--text-1);
		line-height: 1.65;
		margin: 0 0 24px;
	}

	.pub-links-section {
		margin-top: 8px;
	}

	.pub-links-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		margin-bottom: 10px;
	}

	.pub-links-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

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

	.pub-link-row:hover {
		background: var(--bg-3, var(--bg-1));
	}

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

	.pub-link-title {
		font-size: 12.5px;
		color: var(--text-0);
		line-height: 1.4;
	}

	.pub-link-date {
		font-size: 10.5px;
	}

	.pub-link-note {
		font-size: 11px;
		color: var(--text-2);
		font-style: italic;
	}

	.pub-link-arrow {
		font-size: 12px;
		flex-shrink: 0;
	}
</style>
