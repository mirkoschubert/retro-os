<script lang="ts">
	import { SYS, PROJECTS, ESSAYS, PHOTOS, TRACKS, pickL } from '$lib/data/placeholder.js';
	import { systemStore } from '$lib/stores/system.svelte.js';

	interface Props {
		onOpenModule: (key: string) => void;
		winId?: string;
	}

	const { onOpenModule }: Props = $props();
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
			{ kind: 'sys', text: `RetroOS ${SYS.shell} - ${SYS.build}` },
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
			case 'whoami':
				out.push({
					kind: 'out',
					text: `mirko schubert · ${SYS.email}\n${lang === 'de' ? 'Gestalter, Autor, Köln' : 'Designer, writer, Cologne'}\n${pickL(lang, SYS.available_for)}`
				});
				break;
			case 'ls': {
				const sec = (arg || '').toLowerCase();
				if (!sec || sec === '/' || sec === '~') {
					out.push({ kind: 'out', text: 'projects/   writing/   photos/   music/   system/' });
				} else if (sec.startsWith('proj')) {
					out.push({ kind: 'out', text: PROJECTS.map((p) => `${p.year}  ${p.id.padEnd(22)}  ${pickL(lang, p.title)}`).join('\n') });
				} else if (sec.startsWith('writ')) {
					out.push({ kind: 'out', text: ESSAYS.map((e) => `${e.date}  ${e.id.padEnd(22)}  ${pickL(lang, e.title)}`).join('\n') });
				} else if (sec.startsWith('phot')) {
					out.push({ kind: 'out', text: PHOTOS.map((p) => `${p.date}  ${p.id.padEnd(6)}  ${p.camera.padEnd(20)}  ${pickL(lang, p.title)}`).join('\n') });
				} else if (sec.startsWith('mus')) {
					out.push({ kind: 'out', text: TRACKS.map((tr) => `${tr.year}  ${tr.length.padStart(5)}  ${tr.artist.padEnd(20)}  ${tr.title}`).join('\n') });
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
