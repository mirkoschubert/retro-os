<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { SYS, PROJECTS, ESSAYS, PHOTOS, pickL } from '$lib/data/placeholder.js';
	import { systemStore } from '$lib/stores/system.svelte.js';

	interface Props {
		winId?: string;
	}

	const {}: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));
</script>

<div style="overflow:auto;flex:1;padding:28px 36px;background:var(--bg-1)">
	<div style="display:grid;grid-template-columns:120px 1fr;gap:28px;align-items:start">
		<div class="ph-image" style="width:120px;height:150px">
			<div class="ph-cap">portrait</div>
			<div class="ph-tag">2025</div>
		</div>
		<div>
			<h1 class="serif" style="font-family:var(--font-display);font-size:28px;font-weight:600;margin:0 0 4px">
				Mirko Schubert
			</h1>
			<div class="dim mono" style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px">
				{lang === 'de' ? 'Gestalter, Autor, Kleinsoftware-Bauer' : 'Designer · Writer · Small-software builder'} · {lang === 'de' ? SYS.city_de : SYS.city_en}
			</div>
			<p style="font-size:13.5px;color:var(--text-1);line-height:1.65;max-width:560px;margin-bottom:18px">
				{lang === 'de'
					? 'Ich entwerfe und baue ruhige, präzise Software - Reader, Archive, Werkzeuge für die lange Aufmerksamkeit. Studio in Köln, Projekte in Europa.'
					: 'I design and build quiet, precise software - readers, archives, tools for sustained attention. Studio in Cologne, projects across Europe.'}
			</p>
			<div style="display:grid;grid-template-columns:120px 1fr;row-gap:6px;font-size:12.5px">
				<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.1em">{t.available()}</div>
				<div style="color:var(--text-1)">{pickL(lang, SYS.available_for)}</div>
				<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.1em">{t.location()}</div>
				<div style="color:var(--text-1)">{lang === 'de' ? SYS.city_de : SYS.city_en}, DE</div>
				<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.1em">{t.contact()}</div>
				<div><span class="mono" style="color:var(--accent)">{SYS.email}</span></div>
			</div>
		</div>
	</div>

	<div style="height:1px;background:var(--line-1);margin:22px 0"></div>

	<div style="margin:20px 0">
		<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px">{t.now()}</div>
		<p style="font-size:13px;color:var(--text-1);line-height:1.65;max-width:560px">
			{lang === 'de'
				? 'Schreibe an einem Buch über Werkzeuge und Aufmerksamkeit. Pflege Atlas und Telephon. Lehre einmal im Quartal an der KISD.'
				: 'Writing a small book on tools and attention. Maintaining Atlas and Telephon. Teaching one workshop a quarter at KISD.'}
		</p>
	</div>

	<div style="margin:20px 0">
		<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px">{t.skills()}</div>
		<ul style="columns:2;column-gap:36px;font-size:12.5px;color:var(--text-1);margin:0;padding:0;list-style:none">
			<li>· {lang === 'de' ? 'Editorialdesign & Typografie' : 'Editorial design & typography'}</li>
			<li>· {lang === 'de' ? 'Reader- und Archiv-Interfaces' : 'Reader & archive interfaces'}</li>
			<li>· {lang === 'de' ? 'Frontend (TS, Svelte, Next, Astro)' : 'Frontend (TS, Svelte, Next, Astro)'}</li>
			<li>· {lang === 'de' ? 'Designsysteme & Tokens' : 'Design systems & tokens'}</li>
			<li>· {lang === 'de' ? 'Schnittstellen für historische Daten' : 'Interfaces for historical data'}</li>
			<li>· {lang === 'de' ? 'Audio (WebAudio, Tone.js)' : 'Audio (WebAudio, Tone.js)'}</li>
		</ul>
	</div>

	<div style="margin:20px 0">
		<div class="mono dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px">{t.tools()}</div>
		<div class="mono dim" style="font-size:11.5px;line-height:1.9">
			Helix · Zed · Figma · Pages · Drafts · A6 notebook · Pentax 67 · Leica Q2 Mono · 2018 ThinkPad
		</div>
	</div>

	<div style="height:1px;background:var(--line-1);margin:22px 0"></div>

	<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
		<div style="border:1px solid var(--line-1);padding:14px 16px;background:var(--bg-2)">
			<div class="serif" style="font-family:var(--font-display);font-size:32px;color:var(--accent);line-height:1">{PROJECTS.length}</div>
			<div class="mono dim" style="font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;margin-top:6px">
				{lang === 'de' ? 'Projekte im Archiv' : 'Projects in archive'}
			</div>
		</div>
		<div style="border:1px solid var(--line-1);padding:14px 16px;background:var(--bg-2)">
			<div class="serif" style="font-family:var(--font-display);font-size:32px;color:var(--accent);line-height:1">{ESSAYS.length}</div>
			<div class="mono dim" style="font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;margin-top:6px">
				{lang === 'de' ? 'Essays veröffentlicht' : 'Essays published'}
			</div>
		</div>
		<div style="border:1px solid var(--line-1);padding:14px 16px;background:var(--bg-2)">
			<div class="serif" style="font-family:var(--font-display);font-size:32px;color:var(--accent);line-height:1">{PHOTOS.length}</div>
			<div class="mono dim" style="font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;margin-top:6px">
				{lang === 'de' ? 'Aufnahmen 2022-2024' : 'Frames 2022-2024'}
			</div>
		</div>
	</div>

	<div style="height:1px;background:var(--line-1);margin:22px 0"></div>

	<div class="mono dim" style="font-size:10.5px;letter-spacing:0.06em">
		RetroOS {SYS.build} · {SYS.shell} · uptime {SYS.uptime} · build 2026.04.25
	</div>
</div>
