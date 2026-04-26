<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { SYS, pickL } from '$lib/data/placeholder.js';
	import { systemStore } from '$lib/stores/system.svelte.js';

	interface Props {
		onOpenModule: (key: string) => void;
		winId?: string;
	}

	const { onOpenModule }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	const today = new Date().toISOString().slice(0, 10);

	const shortcuts = [
		{ kbd: '⌘1', labelKey: 'mod_projects' as const, key: 'projects' },
		{ kbd: '⌘2', labelKey: 'mod_media' as const,    key: 'media' },
		{ kbd: '⌘3', labelKey: 'mod_darkroom' as const, key: 'darkroom' },
		{ kbd: '⌘4', labelKey: 'mod_writer' as const,   key: 'writer' },
		{ kbd: '⌘K', labelKey: 'cmd_palette' as const,  key: 'palette' },
		{ kbd: '⌘.', labelKey: 'console' as const,      key: 'terminal' }
	];

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
		{t.welcome_title()}, mirko.
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
				<span class="kbd">{sc.kbd}</span>
				<span style="flex:1;font-size:13px">{t[sc.labelKey]()}</span>
				<span style="color:var(--accent)">→</span>
			</button>
		{/each}
	</div>

	<div class="mono dim" style="font-size:10.5px;margin-top:22px;letter-spacing:0.06em">
		{t.available()}: {pickL(lang, SYS.available_for)} · <span style="color:var(--accent)">{SYS.email}</span>
	</div>
</div>
