<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { PortableText } from '@portabletext/svelte';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { calcReadingTime, pickLocale } from '$lib/sanity/utils.js';
	import type { Writing } from '$lib/sanity/types.js';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	interface Props {
		winId?: string;
		writings?: Writing[];
		initialId?: string;
	}

	const { writings = [], initialId }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

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

	const tabs = $derived([
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

	const searchPlaceholder = $derived(t.search_placeholder());
	const minRead = $derived(t.min_read());
</script>

<div class="module" style="flex-direction:column">
	<!-- Toolbar -->
	<div class="toolbar">
		{#each tabs as tab (tab.value)}
			<button
				class="tb-btn"
				class:is-active={categoryFilter === tab.value}
				onclick={() => {
					categoryFilter = tab.value as typeof categoryFilter;
					selectedId = null;
				}}
			>{tab.label}</button>
		{/each}
		<div style="flex:1"></div>
		<input
			type="search"
			placeholder={searchPlaceholder}
			bind:value={search}
			oninput={() => { selectedId = null; }}
		/>
	</div>

	<div style="display:flex;flex:1;overflow:hidden">
		<!-- Sidebar -->
		<div class="module-sidebar" style="width:240px;overflow-y:auto">
			{#if filtered.length === 0}
				<div style="padding:18px 14px;font-size:11.5px;color:var(--text-3);font-family:var(--font-mono)">
					{t.no_results()}
				</div>
			{:else}
				{#each filtered as w (w._id)}
					<div
						class="list-row"
						class:is-active={effectiveId === w._id}
						onclick={() => (selectedId = w._id)}
						role="button"
						tabindex="0"
						onkeydown={(ev) => { if (ev.key === 'Enter') selectedId = w._id; }}
						style="flex-direction:column;align-items:flex-start;padding:8px 14px;gap:2px"
					>
						<div style="font-weight:500;font-size:12.5px;color:{effectiveId === w._id ? 'var(--bg-0)' : 'var(--text-0)'};white-space:normal;line-height:1.35">
							{pickLocale(lang, w.title)}
						</div>
						<div class="mono" style="font-size:10px;color:{effectiveId === w._id ? 'var(--bg-0)' : 'var(--text-3)'};letter-spacing:0.06em">
							{w.date}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Content -->
		<div class="module-main" style="background:var(--bg-0);overflow-y:auto">
			{#if selected}
				<div style="max-width:640px;margin:0 auto;padding:44px 36px 80px">
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

					<div style="margin-top:36px;padding-top:18px;border-top:1px solid var(--line-1);display:flex;justify-content:space-between;font-size:11.5px" class="mono dim">
						<button
							style="background:none;border:none;padding:0;font-family:var(--font-mono);font-size:11.5px;cursor:{prevWriting ? 'pointer' : 'default'};color:{prevWriting ? 'var(--text-1)' : 'var(--text-3)'};display:inline-flex;align-items:center;gap:4px"
							onclick={() => { if (prevWriting) selectedId = prevWriting._id; }}
							disabled={!prevWriting}
						><ChevronLeft size={13} /> {t.prev()}</button>
						<button
							style="background:none;border:none;padding:0;font-family:var(--font-mono);font-size:11.5px;cursor:{nextWriting ? 'pointer' : 'default'};color:{nextWriting ? 'var(--text-1)' : 'var(--text-3)'};display:inline-flex;align-items:center;gap:4px"
							onclick={() => { if (nextWriting) selectedId = nextWriting._id; }}
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
	</div>
</div>
