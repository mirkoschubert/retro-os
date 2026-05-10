<script lang="ts">
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { ArrowUp, ArrowLeft, ArrowRight, Folder, Settings, FileText } from '@lucide/svelte';

	interface Props {
		onOpenModule: (key: string) => void;
		winId?: string;
	}

	const { onOpenModule }: Props = $props();
	const lang = $derived(systemStore.lang);

	interface ArchiveItem {
		name: string;
		kind: string;
		count: number | string;
		mod: string;
		target?: string;
	}

	interface ArchiveGroup {
		id: string;
		items: ArchiveItem[];
	}

	const groups = $derived<ArchiveGroup[]>([
		{
			id: 'Workspace',
			items: [
				{ name: lang === 'de' ? 'Projekte' : 'Projects', kind: 'dir', count: 8, mod: '2025-04-12', target: 'projects' },
				{ name: lang === 'de' ? 'Texte' : 'Writing', kind: 'dir', count: 4, mod: '2025-09-12', target: 'writer' },
				{ name: lang === 'de' ? 'Photos' : 'Photos', kind: 'dir', count: 9, mod: '2024-08-14', target: 'darkroom' },
				{ name: lang === 'de' ? 'Musik' : 'Music', kind: 'dir', count: 10, mod: '2024-12-01', target: 'media' }
			]
		},
		{
			id: 'System',
			items: [
				{ name: 'msos.system', kind: 'sys', count: '-', mod: '2026-04-25' },
				{ name: 'fonts/', kind: 'dir', count: 12, mod: '2026-04-25' },
				{ name: 'preferences.plist', kind: 'f', count: '2 KB', mod: '2026-04-22' },
				{ name: 'boot.log', kind: 'f', count: '8 KB', mod: '2026-04-25' }
			]
		}
	]);
</script>

<div class="module" style="flex-direction:column">
	<div class="toolbar">
		<span class="tb-label mono">/</span>
		<span class="mono" style="color:var(--text-1)">~ /Workspace</span>
		<div class="sep"></div>
		<button class="tb-btn"><ArrowUp size={13} /></button>
		<button class="tb-btn"><ArrowLeft size={13} /></button>
		<button class="tb-btn"><ArrowRight size={13} /></button>
		<div style="flex:1"></div>
		<span class="dim mono">{lang === 'de' ? '3 Bände' : '3 volumes'}</span>
	</div>
	<div style="flex:1;overflow:auto;padding:14px 0">
		{#each groups as group (group.id)}
			<div style="margin-bottom:18px">
				<div class="section-label">{group.id}</div>
				<table style="width:100%;border-collapse:collapse;font-size:12px">
					<thead>
						<tr style="color:var(--text-3);font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase">
							<th style="text-align:left;padding:4px 14px">{lang === 'de' ? 'Name' : 'Name'}</th>
							<th style="text-align:left;padding:4px 14px;width:100px">{lang === 'de' ? 'Art' : 'Kind'}</th>
							<th style="text-align:right;padding:4px 14px;width:90px">{lang === 'de' ? 'Inhalt' : 'Items'}</th>
							<th style="text-align:right;padding:4px 14px;width:130px">{lang === 'de' ? 'Geändert' : 'Modified'}</th>
						</tr>
					</thead>
					<tbody>
						{#each group.items as item (item.name)}
							<tr
								onclick={() => item.target && onOpenModule(item.target)}
								onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'; }}
								onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
								style="cursor:{item.target ? 'pointer' : 'default'}"
							>
								<td style="padding:5px 14px;color:var(--text-0)">
									<span class="mono" style="display:inline-block;width:10px;margin-right:8px;color:var(--accent)">
										{#if item.kind === 'dir'}<Folder size={12} />{:else if item.kind === 'sys'}<Settings size={12} />{:else}<FileText size={12} />{/if}
									</span>
									{item.name}
								</td>
								<td style="padding:5px 14px" class="mono dim">{item.kind}</td>
								<td style="padding:5px 14px;text-align:right" class="mono dim">{item.count}</td>
								<td style="padding:5px 14px;text-align:right" class="mono dim">{item.mod}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	</div>
</div>
