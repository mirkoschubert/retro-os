<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { SYS } from '$lib/data/placeholder.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import type { SysInfo } from '$lib/sanity/types.js';
	import { ArrowRight } from '@lucide/svelte';
	import KbdKey from '$lib/components/ui/KbdKey.svelte';

	interface Props {
		onOpenModule: (key: string) => void;
		sysInfo?: SysInfo | null;
		winId?: string;
	}

	const { onOpenModule, sysInfo }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	const today = new Date().toISOString().slice(0, 10);

	const shortcuts = [
		{ kbd: '⌘1', labelKey: 'mod_projects'    as const, key: 'projects'     },
		{ kbd: '⌘2', labelKey: 'mod_media'        as const, key: 'media'        },
		{ kbd: '⌘3', labelKey: 'mod_darkroom'     as const, key: 'darkroom'     },
		{ kbd: '⌘4', labelKey: 'mod_writer'       as const, key: 'writer'       },
		{ kbd: '⌘5', labelKey: 'mod_sysinfo'      as const, key: 'sysinfo'      },
		{ kbd: '⌘7', labelKey: 'mod_publications' as const, key: 'publications' },
		{ kbd: '⌘K', labelKey: 'cmd_palette'      as const, key: 'palette'      },
		{ kbd: '⌘.', labelKey: 'console'          as const, key: 'terminal'     },
	];

	const availableFor = $derived(
		sysInfo?.available_for
			? pickLocale(lang, sysInfo.available_for)
			: SYS.available_for[lang]
	);
	const email = $derived(sysInfo?.email ?? SYS.email);

	function handleShortcut(key: string) {
		if (key === 'palette') {
			window.dispatchEvent(new CustomEvent('retro-os:palette'));
		} else {
			onOpenModule(key);
		}
	}
</script>

<div style="flex:1;padding:30px 34px 36px;overflow:auto;background:var(--bg-1)">
	<div class="mono dim" style="font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:8px">
		~/Workspace · {today}
	</div>
	<h1 class="serif" style="font-family:var(--font-display);font-size:30px;font-weight:600;margin:0 0 16px;letter-spacing:-0.005em">
		{t.welcome_title()}
	</h1>
	<div style="max-width:540px">
		<p style="font-size:13.5px;color:var(--text-1);line-height:1.7;margin:0 0 12px">{t.welcome_body_1()}</p>
		<p style="font-size:13.5px;color:var(--text-1);line-height:1.7;margin:0 0 12px">{t.welcome_body_2()}</p>
		<p style="font-size:13.5px;color:var(--text-1);line-height:1.7;margin:0 0 12px">{t.welcome_body_3()}</p>
	</div>

	<div style="margin-top:22px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:540px">
		{#each shortcuts as sc (sc.key)}
			<button
				style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-2);border:1px solid var(--line-1);color:var(--text-1);cursor:pointer;text-align:left"
				onclick={() => handleShortcut(sc.key)}
				onmouseenter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
				onmouseleave={(e) => (e.currentTarget.style.borderColor = 'var(--line-1)')}
			>
				<span style="display:inline-flex;align-items:center;gap:2px;flex-shrink:0">
					{#each sc.kbd.split('') as ch}
						<KbdKey token={ch === '⌘' ? 'cmd' : ch === '⇧' ? 'shift' : ch === '⌃' ? 'ctrl' : ch === '⌥' ? 'alt' : ch} />
					{/each}
				</span>
				<span style="flex:1;font-size:13px">{t[sc.labelKey]()}</span>
				<ArrowRight size={14} style="color:var(--accent);flex-shrink:0" />
			</button>
		{/each}
	</div>

	<div class="mono dim" style="font-size:10.5px;margin-top:22px;letter-spacing:0.06em">
		{t.available()}: {availableFor} · <span style="color:var(--accent)">{email}</span>
	</div>
</div>
