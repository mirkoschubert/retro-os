<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import { urlFor } from '$lib/sanity/image.js';
	import type { Project } from '$lib/sanity/types.js';

	interface Props {
		winId?: string;
		projects?: Project[];
		initialId?: string;
	}

	const { projects = [], initialId }: Props = $props();
	const lang = $derived(systemStore.lang);
	const msg = $derived(getMessages(lang));

	let filter = $state<'all' | 'personal' | 'clients'>('all');
	let view = $state<'list' | 'grid'>('list');
	let search = $state('');
	let selectedId = $state('');
	$effect.pre(() => {
		if (!selectedId && projects.length > 0) selectedId = initialId ?? projects[0]._id;
	});
	$effect(() => {
		if (initialId) selectedId = initialId;
	});

	const filtered = $derived(
		projects.filter((p) => {
			if (filter === 'personal' && p.type !== 'personal') return false;
			if (filter === 'clients' && p.type !== 'client') return false;
			if (search) {
				const s = search.toLowerCase();
				const t = pickLocale(lang, p.title).toLowerCase();
				const su = pickLocale(lang, p.summary).toLowerCase();
				if (!t.includes(s) && !su.includes(s) && !(p.tags ?? []).some((x) => x.includes(s)))
					return false;
			}
			return true;
		})
	);

	const selected = $derived(projects.find((p) => p._id === selectedId) ?? filtered[0]);
</script>

<div class="module" style="flex-direction:column">
	<div class="toolbar">
		<button class="tb-btn" class:is-active={filter === 'all'} onclick={() => (filter = 'all')}>{msg.all()}</button>
		<button class="tb-btn" class:is-active={filter === 'personal'} onclick={() => (filter = 'personal')}>{msg.personal()}</button>
		<button class="tb-btn" class:is-active={filter === 'clients'} onclick={() => (filter = 'clients')}>{msg.clients()}</button>
		<div class="sep"></div>
		<button class="tb-btn" class:is-active={view === 'list'} onclick={() => (view = 'list')}>≡ {msg.view_list()}</button>
		<button class="tb-btn" class:is-active={view === 'grid'} onclick={() => (view = 'grid')}>▦ {msg.view_grid()}</button>
		<div style="flex:1"></div>
		<span class="tb-label">⌕</span>
		<input type="search" placeholder="{msg.search()}…" bind:value={search} />
		<span class="dim mono" style="margin-left:6px">{filtered.length} / {projects.length}</span>
	</div>

	<div style="display:flex;flex:1;overflow:hidden">
		{#if view === 'list'}
			<div class="module-sidebar" style="width:280px">
				<div class="section-label">{msg.mod_projects()}</div>
				{#each filtered as p (p._id)}
					<div
						class="list-row"
						class:is-active={selectedId === p._id}
						onclick={() => (selectedId = p._id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => { if (e.key === 'Enter') selectedId = p._id; }}
					>
						<span style="width:8px;height:8px;background:{p.type === 'personal' ? 'var(--accent-2)' : 'var(--accent)'};display:inline-block"></span>
						<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{pickLocale(lang, p.title)}</span>
						<span class="meta">{p.year}</span>
					</div>
				{/each}
			</div>
			<div class="module-main">
				{#if selected}
					<div style="padding:20px 28px 32px">
						<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px">
							{selected.type === 'personal' ? msg.personal() : msg.clients()} · {selected.year}
							{#if selected.openSource}<span style="margin-left:8px;color:var(--accent-2)">open source</span>{/if}
						</div>
						<h1 class="h-display" style="font-size:26px;margin-bottom:12px;font-family:var(--font-display)">
							{pickLocale(lang, selected.title)}
						</h1>
						<p style="font-size:14px;color:var(--text-1);max-width:620px;line-height:1.65;margin-bottom:18px">
							{pickLocale(lang, selected.summary)}
						</p>

						<div class="ph-image cover-image" style="height:260px;margin-bottom:24px">
							{#if selected.cover}
								<img
									src={urlFor(selected.cover).width(1200).height(520).fit('crop').auto('format').url()}
									alt={pickLocale(lang, selected.title)}
									class="cover-img"
								/>
								<div class="cover-dim"></div>
							{/if}
							<div class="ph-cap">{selected._id} · cover</div>
							<div class="ph-tag">{selected.year}</div>
						</div>

						<div style="display:grid;grid-template-columns:120px 1fr;row-gap:8px;column-gap:18px;font-size:12.5px;max-width:720px">
							{#if selected.type === 'client' && selected.client}
								<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;padding-top:2px">{msg.client()}</div>
								<div style="color:var(--text-1)">{selected.client}</div>
							{:else if selected.type === 'personal' && selected.context}
								<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;padding-top:2px">{msg.context()}</div>
								<div style="color:var(--text-1)">{pickLocale(lang, selected.context)}</div>
							{/if}
							<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;padding-top:2px">{msg.role()}</div>
							<div style="color:var(--text-1)">{pickLocale(lang, selected.role)}</div>
							{#if selected.stack && selected.stack.length > 0}
								<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;padding-top:2px">{msg.stack()}</div>
								<div class="mono dim">{selected.stack.join(' · ')}</div>
							{/if}
							{#if selected.tags && selected.tags.length > 0}
								<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;padding-top:2px">Tags</div>
								<div class="mono dim">{selected.tags.map((x) => '#' + x).join('  ')}</div>
							{/if}
							{#if selected.links && selected.links.length > 0}
								<div class="dim mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;padding-top:2px">{msg.links()}</div>
								<div style="display:flex;flex-wrap:wrap;gap:6px 14px">
									{#each selected.links as link (link.url)}
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											class="mono"
											style="color:var(--accent);text-decoration:none"
										>↗ {link.label}</a>
									{/each}
								</div>
							{/if}
						</div>

						{#if selected.images && selected.images.length > 0}
							<div style="margin-top:28px;display:grid;grid-template-columns:repeat({selected.images.length}, 1fr);gap:14px">
								{#each selected.images as img, i (i)}
									<div class="ph-image cover-image" style="height:180px">
										<img
											src={urlFor(img).width(800).height(360).fit('crop').auto('format').url()}
											alt="{pickLocale(lang, selected.title)} - detail {i + 1}"
											class="cover-img"
										/>
										<div class="cover-dim"></div>
										<div class="ph-cap">detail {i + 1}</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{:else}
			<div class="module-main" style="padding:16px">
				<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
					{#each filtered as p (p._id)}
						<button
							style="border:1px solid var(--line-1);background:var(--bg-2);cursor:pointer;text-align:left;padding:0"
							onclick={() => { selectedId = p._id; view = 'list'; }}
						>
							<div class="ph-image cover-image" style="height:130px">
								{#if p.cover}
									<img
										src={urlFor(p.cover).width(440).height(260).fit('crop').auto('format').url()}
										alt={pickLocale(lang, p.title)}
										class="cover-img"
									/>
									<div class="cover-dim"></div>
								{/if}
								<div class="ph-cap">{p._id}.png</div>
								<div class="ph-tag">{p.year}</div>
							</div>
							<div style="padding:10px 12px">
								<div style="font-weight:500;color:var(--text-0)">{pickLocale(lang, p.title)}</div>
								<div class="dim mono" style="font-size:10.5px;margin-top:4px;text-transform:uppercase;letter-spacing:0.08em">
									{p.type}
									{#if p.type === 'client' && p.client} · {p.client}{/if}
									{#if p.type === 'personal' && p.context} · {pickLocale(lang, p.context)}{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
