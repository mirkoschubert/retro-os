<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import KbdKey from '$lib/components/ui/KbdKey.svelte';

	interface Props {
		winId?: string;
	}

	const {}: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	interface ShortcutEntry {
		keys: string[];
		label: () => string;
	}

	interface ShortcutSection {
		heading: () => string;
		entries: ShortcutEntry[];
	}

	const sections = $derived<ShortcutSection[]>([
		{
			heading: t.shortcuts_section_nav,
			entries: [
				{ keys: ['cmd', 'K'], label: t.sc_open_palette },
				{ keys: ['cmd', '.'], label: t.sc_open_console },
				{ keys: ['cmd', '`'], label: t.sc_cycle_windows },
				{ keys: ['esc'], label: t.sc_close_window },
			]
		},
		{
			heading: t.shortcuts_section_programs,
			entries: [
				{ keys: ['cmd', '0'], label: t.sc_open_welcome },
				{ keys: ['cmd', '1'], label: t.sc_open_projects },
				{ keys: ['cmd', '2'], label: t.sc_open_media },
				{ keys: ['cmd', '3'], label: t.sc_open_darkroom },
				{ keys: ['cmd', '4'], label: t.sc_open_writer },
				{ keys: ['cmd', '5'], label: t.sc_open_sysinfo },
				{ keys: ['cmd', '6'], label: t.sc_open_terminal },
				{ keys: ['cmd', '7'], label: t.sc_open_publications },
			]
		},
		{
			heading: t.shortcuts_section_windows,
			entries: [
				{ keys: ['cmd', 'shift', '1'], label: t.sc_view_1 },
				{ keys: ['cmd', 'shift', '2'], label: t.sc_view_2 },
				{ keys: ['cmd', 'shift', '3'], label: t.sc_view_3 },
			]
		},
		{
			heading: t.shortcuts_section_system,
			entries: [
				{ keys: ['cmd', 'L'], label: t.sc_toggle_lang },
			]
		}
	]);
</script>

<div class="sc-root">
	<div class="sc-header">
		<span class="sc-title mono">{t.shortcuts_title()}</span>
	</div>
	<div class="sc-body">
		{#each sections as section}
			<div class="sc-section">
				<div class="sc-section-heading">{section.heading()}</div>
				{#each section.entries as entry}
					<div class="sc-row">
						<div class="sc-keys">
							{#each entry.keys as key, i}
								{#if i > 0}<span class="sc-plus">+</span>{/if}
								<KbdKey token={key} />
							{/each}
						</div>
						<span class="sc-label">{entry.label()}</span>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.sc-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg-1);
		overflow: hidden;
	}

	.sc-header {
		padding: 14px 20px 12px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.sc-title {
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-3);
	}

	.sc-body {
		flex: 1;
		overflow-y: auto;
		padding: 8px 0 16px;
	}

	.sc-section {
		padding: 0 0 4px;
	}

	.sc-section-heading {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
		padding: 14px 20px 6px;
	}

	.sc-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 5px 20px;
		border-bottom: 1px solid var(--border-faint, color-mix(in srgb, var(--border) 40%, transparent));
	}

	.sc-row:last-child {
		border-bottom: none;
	}

	.sc-keys {
		display: flex;
		align-items: center;
		gap: 3px;
		min-width: 120px;
		flex-shrink: 0;
	}

	.sc-plus {
		font-size: 10px;
		color: var(--text-3);
		padding: 0 1px;
	}

	.sc-label {
		font-size: 12.5px;
		color: var(--text-1);
		line-height: 1.4;
	}
</style>
