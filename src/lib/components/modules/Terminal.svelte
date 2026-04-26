<script lang="ts">
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { pickLocale } from '$lib/sanity/utils.js';
	import type { Project, Writing, Photo, Album, SysInfo } from '$lib/sanity/types.js';

	function pad(s: string | undefined, n: number) {
		return (s ?? '').padEnd(n);
	}

	interface Props {
		onOpenModule: (key: string) => void;
		projects?: Project[];
		writings?: Writing[];
		photos?: Photo[];
		albums?: Album[];
		sysInfo?: SysInfo | null;
		winId?: string;
	}

	const { onOpenModule, projects = [], writings = [], photos = [], albums = [], sysInfo }: Props = $props();
	const lang = $derived(systemStore.lang);

	interface HistoryLine {
		kind: 'in' | 'out' | 'err' | 'sys';
		text: string;
	}

	let input = $state('');
	let terminalEl: HTMLElement;
	let inputEl: HTMLInputElement;

	$effect(() => {
		inputEl?.focus();
	});

	function initLines(): HistoryLine[] {
		return [
			{ kind: 'sys', text: `RetroOS ${sysInfo?.shell ?? 'msh'} - ${sysInfo?.build ?? '–'}` },
			{
				kind: 'sys',
				text:
					lang === 'de'
						? 'Tippe `help` für Befehle, `open <programm>` zum Starten, `whoami` für Kontakt.'
						: 'Type `help` for commands, `open <program>` to launch, `whoami` for contact.'
			},
			{ kind: 'sys', text: '' }
		];
	}

	let history = $state<HistoryLine[]>(initLines());

	$effect(() => {
		terminalEl?.scrollTo({ top: terminalEl.scrollHeight, behavior: 'smooth' });
	});

	const MODULE_MAP: Record<string, string> = {
		projects: 'projects', project: 'projects',
		writer: 'writer', writing: 'writer',
		media: 'media', music: 'media',
		darkroom: 'darkroom', photos: 'darkroom',
		publications: 'publications', pub: 'publications',
		sysinfo: 'sysinfo', about: 'sysinfo',
		terminal: 'terminal'
	};

	function run(cmd: string) {
		const parts = cmd.trim().split(/\s+/);
		const head = (parts[0] ?? '').toLowerCase();
		const arg = parts.slice(1).join(' ');
		const out: HistoryLine[] = [];
		out.push({ kind: 'in', text: `~/$ ${cmd}` });

		switch (head) {
			case '':
				break;
			case 'help':
				out.push({
					kind: 'out',
					text:
						lang === 'de'
							? 'Verfügbare Befehle:\n  help                  Diese Liste\n  whoami                Kurzbiografie\n  ls [bereich]          Inhalte zeigen\n  open <programm>       Programm starten\n  lang [en|de]          Sprache wechseln\n  clear                 Löschen'
							: 'Available commands:\n  help                  This list\n  whoami                Short bio\n  ls [section]          List contents\n  open <program>        Launch program\n  lang [en|de]          Switch language\n  clear                 Clear screen'
				});
				break;
			case 'whoami': {
				const email = sysInfo?.email ?? '–';
				const name = sysInfo?.fullname ?? sysInfo?.user ?? '–';
				const prof = sysInfo?.profession ? (lang === 'de' ? sysInfo.profession.de : sysInfo.profession.en) ?? '–' : '–';
				const avail = sysInfo?.available_for ? (lang === 'de' ? sysInfo.available_for.de : sysInfo.available_for.en) ?? '–' : '–';
				out.push({ kind: 'out', text: `${name} · ${email}\n${prof}\n${avail}` });
				break;
			}
			case 'ls': {
				const sec = (arg || '').toLowerCase();
				if (!sec || sec === '/' || sec === '~') {
					out.push({ kind: 'out', text: 'projects/   writing/   photos/   music/   publications/   system/' });
				} else if (sec.startsWith('proj')) {
					if (projects.length === 0) { out.push({ kind: 'out', text: lang === 'de' ? '(keine Projekte geladen)' : '(no projects loaded)' }); break; }
					out.push({ kind: 'out', text: projects.map((p) => `${p.year ?? '????'}  ${pad(p.slug?.current, 24)}  ${pickLocale(lang, p.title)}`).join('\n') });
				} else if (sec.startsWith('writ')) {
					if (writings.length === 0) { out.push({ kind: 'out', text: lang === 'de' ? '(keine Texte geladen)' : '(no writings loaded)' }); break; }
					out.push({ kind: 'out', text: writings.map((w) => `${w.date ?? '????-??-??'}  ${pad(w.slug?.current, 24)}  ${pickLocale(lang, w.title)}`).join('\n') });
				} else if (sec.startsWith('phot')) {
					if (photos.length === 0) { out.push({ kind: 'out', text: lang === 'de' ? '(keine Fotos geladen)' : '(no photos loaded)' }); break; }
					out.push({ kind: 'out', text: photos.map((p) => `${p.date ?? '????-??-??'}  ${pad(p.camera, 20)}  ${pickLocale(lang, p.title)}`).join('\n') });
				} else if (sec.startsWith('mus')) {
					const tracks = albums.flatMap((a) => (a.tracks ?? []).map((tr) => ({ artist: a.artist, album: a.title, title: tr.title, year: a.year })));
					if (tracks.length === 0) { out.push({ kind: 'out', text: lang === 'de' ? '(keine Tracks geladen)' : '(no tracks loaded)' }); break; }
					out.push({ kind: 'out', text: tracks.map((tr) => `${tr.year ?? '????'}  ${pad(tr.artist, 20)}  ${tr.title}`).join('\n') });
				} else if (sec.startsWith('pub')) {
					out.push({ kind: 'out', text: lang === 'de' ? 'Benutze `open publications` um das Modul zu öffnen.' : 'Use `open publications` to browse publications.' });
				} else {
					out.push({ kind: 'err', text: `ls: ${sec}: ${lang === 'de' ? 'kein solcher Bereich' : 'no such section'}` });
				}
				break;
			}
			case 'open': {
				const target = MODULE_MAP[arg.toLowerCase()];
				if (target) {
					onOpenModule(target);
					out.push({ kind: 'out', text: `→ ${target}` });
				} else {
					out.push({ kind: 'err', text: `open: ${arg || '?'}: ${lang === 'de' ? 'unbekanntes Programm' : 'unknown program'}` });
				}
				break;
			}
			case 'lang':
				if (arg === 'en' || arg === 'de') {
					window.dispatchEvent(new CustomEvent('retro-os:setlang', { detail: arg }));
					out.push({ kind: 'out', text: `lang → ${arg}` });
				} else {
					out.push({ kind: 'out', text: lang });
				}
				break;
			case 'clear':
				history = [];
				return;
			default:
				out.push({ kind: 'err', text: `${head}: ${lang === 'de' ? 'Befehl nicht gefunden' : 'command not found'}` });
		}

		history = [...history, ...out, { kind: 'sys', text: '' }];
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			run(input);
			input = '';
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={terminalEl}
	style="flex:1;background:#0c0d10;color:var(--text-0);font-family:var(--font-mono);font-size:12px;padding:14px 18px;overflow:auto"
	onclick={() => inputEl?.focus()}
>
	{#each history as line, i (i)}
		<div style="color:{line.kind === 'in' ? 'var(--accent)' : line.kind === 'err' ? '#d77860' : line.kind === 'sys' ? 'var(--text-2)' : 'var(--text-1)'};white-space:pre-wrap;line-height:1.55">
			{line.text || ' '}
		</div>
	{/each}
	<div style="display:flex;gap:8px;margin-top:4px">
		<span style="color:var(--accent)">~/$</span>
		<input
			bind:this={inputEl}
			bind:value={input}
			onkeydown={handleKeyDown}
			style="flex:1;background:transparent;border:0;outline:0;color:var(--text-0);font-family:var(--font-mono);font-size:12px"
			aria-label="Terminal input"
		/>
	</div>
</div>
