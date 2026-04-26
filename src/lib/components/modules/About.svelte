<script lang="ts">
	import { SYS } from '$lib/data/placeholder.js';
	import { systemStore } from '$lib/stores/system.svelte.js';

	interface Props {
		winId?: string;
	}

	const {}: Props = $props();
	const lang = $derived(systemStore.lang);
</script>

<div style="flex:1;padding:32px 36px;display:flex;flex-direction:column;align-items:center;text-align:center;background:var(--bg-1)">
	<div style="width:64px;height:64px;border:2px solid var(--accent);position:relative;margin-bottom:18px">
		<div style="position:absolute;inset:6px;background:var(--accent)"></div>
	</div>
	<h1 class="serif" style="font-family:var(--font-display);font-size:28px;font-weight:600;margin:0 0 4px">RetroOS</h1>
	<div class="mono dim" style="font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:18px">
		version {SYS.build}
	</div>
	<p style="font-size:13px;color:var(--text-1);max-width:380px;line-height:1.65">
		{lang === 'de'
			? 'Eine fiktive Werkstattumgebung, in der das Portfolio von Mirko Schubert wohnt. Inspiriert von Mac System 7, Amiga Workbench und NeXTSTEP - bewohnt, nicht zitiert.'
			: 'A fictional workshop environment hosting the portfolio of Mirko Schubert. Inspired by Mac System 7, Amiga Workbench and NeXTSTEP - inhabited, not quoted.'}
	</p>
	<div style="margin-top:22px;font-size:11px;color:var(--text-3)" class="mono">
		© 2021-2026 mirko schubert · {SYS.email}
	</div>
</div>
