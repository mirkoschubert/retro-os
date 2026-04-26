<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import type { Era, Lang } from '$lib/stores/system.svelte.js';

	interface Props {
		lang: Lang;
		era: Era;
		focusedTitle: string | null;
		time: string;
		onSetLang: (lang: Lang) => void;
		onSetEra: (era: Era) => void;
		onOpenModule: (key: string) => void;
		onOpenPalette: () => void;
		onOpenConsole: () => void;
		onOpenAbout: () => void;
	}

	const {
		lang,
		era,
		focusedTitle,
		time,
		onSetLang,
		onSetEra,
		onOpenModule,
		onOpenPalette,
		onOpenConsole,
		onOpenAbout
	}: Props = $props();
	const t = $derived(getMessages(lang));

	let openKey = $state<string | null>(null);
	let menubarEl: HTMLElement;

	type DropdownItem =
		| { divider: true }
		| { label: string }
		| { row: string; shortcut?: string; disabled?: boolean; checked?: boolean; on?: () => void };

	interface MenuItem {
		key: string;
		label: string;
		app?: boolean;
		dropdown: DropdownItem[];
	}

	const items = $derived<MenuItem[]>([
		{
			key: 'msos',
			label: t.app_name(),
			app: true,
			dropdown: [
				{ row: t.about_msos(), on: () => { openKey = null; onOpenAbout(); } },
				{ divider: true },
				{ row: t.preferences(), shortcut: '⌘,', on: () => { openKey = null; onOpenModule('sysinfo'); } },
				{ divider: true },
				{ label: t.theme() },
				{ row: t.era_graphite(), checked: era === 'graphite', on: () => { onSetEra('graphite'); openKey = null; } },
				{ row: t.era_atelier(), checked: era === 'atelier', on: () => { onSetEra('atelier'); openKey = null; } },
				{ row: t.era_workbench(), checked: era === 'workbench', on: () => { onSetEra('workbench'); openKey = null; } },
				{ divider: true },
				{ label: t.language() },
				{ row: t.lang_en(), checked: lang === 'en', on: () => { onSetLang('en'); openKey = null; } },
				{ row: t.lang_de(), checked: lang === 'de', on: () => { onSetLang('de'); openKey = null; } }
			]
		},
		{
			key: 'file',
			label: t.file(),
			dropdown: [
				{ row: t.menu_new(), shortcut: '⌘N', disabled: true },
				{ row: t.menu_open(), shortcut: '⌘O', on: () => { openKey = null; onOpenPalette(); } },
				{ divider: true },
				{ row: t.menu_close(), shortcut: '⌘W', disabled: true },
				{ divider: true },
				{ row: t.menu_quit(), shortcut: '⌘Q', disabled: true }
			]
		},
		{
			key: 'edit',
			label: t.edit(),
			dropdown: [
				{ row: t.menu_cut(), shortcut: '⌘X', disabled: true },
				{ row: t.menu_copy(), shortcut: '⌘C', disabled: true },
				{ row: t.menu_paste(), shortcut: '⌘V', disabled: true },
				{ divider: true },
				{ row: t.menu_select_all(), shortcut: '⌘A', disabled: true }
			]
		},
		{
			key: 'view',
			label: t.view(),
			dropdown: [
				{ row: t.view_grid(), shortcut: '⌘1', disabled: true, checked: true },
				{ row: t.view_list(), shortcut: '⌘2', disabled: true },
				{ row: t.view_columns(), shortcut: '⌘3', disabled: true }
			]
		},
		{
			key: 'win',
			label: t.window_menu(),
			dropdown: [
				{ row: t.win_minimize(), shortcut: '⌘M', disabled: true },
				{ row: t.win_zoom(), disabled: true },
				{ divider: true },
				{ row: t.win_cycle(), shortcut: '⌘`', disabled: true }
			]
		},
		{
			key: 'help',
			label: t.help(),
			dropdown: [
				{ row: t.cmd_palette(), shortcut: '⌘K', on: () => { openKey = null; onOpenPalette(); } },
				{ row: t.console(), shortcut: '⌘.', on: () => { openKey = null; onOpenConsole(); } },
				{ divider: true },
				{ row: t.about_msos(), on: () => { openKey = null; onOpenAbout(); } }
			]
		}
	]);

	function handleDocClick(e: MouseEvent) {
		if (menubarEl && !menubarEl.contains(e.target as Node)) {
			openKey = null;
		}
	}

	$effect(() => {
		document.addEventListener('mousedown', handleDocClick);
		return () => document.removeEventListener('mousedown', handleDocClick);
	});
</script>

<div class="menubar" bind:this={menubarEl}>
	<div class="menubar-logo">
		<span class="menubar-logo-mark"></span>
	</div>

	{#each items as item (item.key)}
		<div style="position:relative">
			<button
				class="menu-item"
				class:is-app={item.app}
				class:is-open={openKey === item.key}
				onmousedown={(e) => { e.stopPropagation(); openKey = openKey === item.key ? null : item.key; }}
				onmouseenter={() => { if (openKey !== null && openKey !== item.key) openKey = item.key; }}
			>
				{item.label}
			</button>
			{#if openKey === item.key}
				<div class="menu-dropdown">
					{#each item.dropdown as d, i (i)}
						{#if 'divider' in d}
							<div class="menu-dropdown-divider"></div>
						{:else if 'label' in d}
							<div class="menu-dropdown-label">{d.label}</div>
						{:else}
							<div
								class="menu-dropdown-row"
								class:disabled={d.disabled}
								class:checked={d.checked}
								onclick={d.disabled ? undefined : d.on}
								role="menuitem"
								tabindex={d.disabled ? -1 : 0}
								onkeydown={(e) => { if (e.key === 'Enter' && !d.disabled && d.on) d.on(); }}
							>
								<span>{d.row}</span>
								{#if d.shortcut}
									<span class="shortcut">{d.shortcut}</span>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<div class="menu-spacer"></div>
	<div class="menu-status">
		<span>{focusedTitle ?? t.desktop()}</span>
		<button
			class="pill"
			onclick={() => onSetLang(lang === 'en' ? 'de' : 'en')}
			title="⌘L"
		>
			<span class="dot"></span>
			{lang === 'en' ? 'EN' : 'DE'}
		</button>
		<span>{time}</span>
	</div>
</div>
