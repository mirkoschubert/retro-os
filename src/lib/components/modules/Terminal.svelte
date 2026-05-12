<script lang="ts">
	import { tick } from 'svelte';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import type { Project, Writing, Photo, Album, SysInfo, Publication } from '$lib/sanity/types.js';
	import {
		type HistoryLine,
		type TerminalData,
		HACK_LINES,
		KATAKANA,
		cwdLabel,
		tryAutocomplete,
		runCommand
	} from '$lib/terminal.js';

	interface Props {
		onOpenModule: (key: string, extra?: Record<string, unknown>) => void;
		projects?: Project[];
		writings?: Writing[];
		photos?: Photo[];
		albums?: Album[];
		publications?: Publication[];
		sysInfo?: SysInfo | null;
		winId?: string;
	}

	const {
		onOpenModule,
		projects = [],
		writings = [],
		photos = [],
		albums = [],
		publications = [],
		sysInfo
	}: Props = $props();

	const lang = $derived(systemStore.lang);

	function data(): TerminalData {
		return { projects, writings, photos, albums, publications, sysInfo, lang };
	}

	// ── State ──────────────────────────────────────────────────────────────────
	let history = $state<HistoryLine[]>(initLines());
	let cwd = $state('~');
	let input = $state('');
	let cmdHistory = $state<string[]>([]);
	let histIdx = $state(-1);
	let animInterval: ReturnType<typeof setInterval> | null = null;
	let matrixActive = $state(false);

	let terminalEl: HTMLElement;
	let inputEl = $state<HTMLInputElement | undefined>(undefined);
	let canvasEl = $state<HTMLCanvasElement | undefined>(undefined);

	// ── Init (only once, not reactive) ────────────────────────────────────────
	function initLines(): HistoryLine[] {
		return [
			{ kind: 'sys', text: `RetroOS ${sysInfo?.shell ?? 'msh'} - ${sysInfo?.build ?? '-'}` },
			{ kind: 'sys', text: 'Type `help` for commands, `ls` for contents, `cd <dir>` to navigate.' },
			{ kind: 'sys', text: '' }
		];
	}

	$effect(() => { inputEl?.focus(); });

	$effect(() => {
		void history.length;
		tick().then(() => {
			terminalEl?.scrollTo({ top: terminalEl.scrollHeight, behavior: 'smooth' });
		});
	});

	$effect(() => {
		function onGlobalKeyDown(e: KeyboardEvent) {
			if (e.key === 'c' && (e.ctrlKey || e.metaKey) && (animInterval !== null || matrixActive)) {
				e.preventDefault();
				stopAnim();
			}
		}
		window.addEventListener('keydown', onGlobalKeyDown);
		return () => window.removeEventListener('keydown', onGlobalKeyDown);
	});

	// ── Helpers ────────────────────────────────────────────────────────────────
	function append(lines: HistoryLine[]) {
		history = [...history, ...lines, { kind: 'sys', text: '' }];
	}

	// ── Matrix canvas ─────────────────────────────────────────────────────────
	function startMatrixCanvas() {
		matrixActive = true;
		tick().then(() => {
			if (!canvasEl) return;
			const ctx = canvasEl.getContext('2d');
			if (!ctx) return;

			const W = canvasEl.width = canvasEl.offsetWidth;
			const H = canvasEl.height = canvasEl.offsetHeight;
			const fontSize = 14;
			const cols = Math.floor(W / fontSize);
			const drops = Array.from({ length: cols }, () => Math.random() * -H);

			animInterval = setInterval(() => {
				ctx.fillStyle = 'rgba(12, 13, 16, 0.18)';
				ctx.fillRect(0, 0, W, H);

				ctx.font = `${fontSize}px monospace`;
				for (let i = 0; i < cols; i++) {
					const ch = KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
					const x = i * fontSize;
					const y = (drops[i] as number) * fontSize;
					// leading character brighter
					ctx.fillStyle = '#9ef';
					ctx.fillText(ch, x, y);
					// column trail in green
					ctx.fillStyle = '#0f5';
					for (let j = 1; j <= 8; j++) {
						const prevCh = KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
						const alpha = 1 - j / 9;
						ctx.globalAlpha = alpha;
						ctx.fillText(prevCh, x, y - j * fontSize);
					}
					ctx.globalAlpha = 1;
					(drops[i] as number)++;
					if ((drops[i] as number) * fontSize > H && Math.random() > 0.975) {
						drops[i] = 0;
					}
				}
			}, 40);
		});
	}

	function stopMatrix() {
		if (animInterval !== null) { clearInterval(animInterval); animInterval = null; }
		matrixActive = false;
		inputEl?.focus();
		history = [...history, { kind: 'sys', text: '' }];
	}

	// ── Hack animation ────────────────────────────────────────────────────────
	function startHack() {
		let lineIdx = 0;
		const slotIdx = history.length;
		history = [...history, { kind: 'out', text: '' }];
		animInterval = setInterval(() => {
			if (lineIdx >= HACK_LINES.length) {
				if (animInterval !== null) { clearInterval(animInterval); animInterval = null; }
				history = [...history, { kind: 'sys', text: '' }];
				return;
			}
			const shown = HACK_LINES.slice(0, lineIdx + 1).join('\n');
			history = [
				...history.slice(0, slotIdx),
				{ kind: 'out', text: shown },
				...history.slice(slotIdx + 1)
			];
			lineIdx++;
		}, 200);
	}

	function stopAnim() {
		if (animInterval !== null) { clearInterval(animInterval); animInterval = null; }
		if (matrixActive) { stopMatrix(); return; }
		history = [...history, { kind: 'out', text: '^C' }, { kind: 'sys', text: '' }];
	}

	// ── Run ───────────────────────────────────────────────────────────────────
	function run(cmd: string) {
		const trimmed = cmd.trim();
		if (!trimmed) return;
		if (animInterval !== null || matrixActive) return;

		const result = runCommand(trimmed, cwd, data(), onOpenModule);

		if (result.clearAll) {
			history = [];
			cwd = '~';
			cmdHistory = [];
			histIdx = -1;
			return;
		}

		if (result.newCwd !== undefined) cwd = result.newCwd;
		if (result.silent) return;

		if (result.startMatrix) {
			append(result.lines);
			startMatrixCanvas();
			return;
		}

		if (result.startHack) {
			append(result.lines);
			history = [...history, { kind: 'sys', text: 'Press Ctrl+C to stop' }];
			startHack();
			return;
		}

		append(result.lines);
	}

	// ── Input ─────────────────────────────────────────────────────────────────
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
			if (animInterval !== null || matrixActive) {
				e.preventDefault();
				stopAnim();
			}
			return;
		}
		if (animInterval !== null || matrixActive) return;

		if (e.key === 'Enter') {
			const cmd = input.trim();
			if (cmd) { cmdHistory = [cmd, ...cmdHistory.slice(0, 49)]; histIdx = -1; }
			run(input);
			input = '';
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const completed = tryAutocomplete(input, cwd, data());
			if (completed) input = completed;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const next = histIdx + 1;
			if (next < cmdHistory.length) { histIdx = next; input = cmdHistory[next] ?? ''; }
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = histIdx - 1;
			if (next < 0) { histIdx = -1; input = ''; }
			else { histIdx = next; input = cmdHistory[next] ?? ''; }
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	style="position:relative;flex:1;background:#0c0d10;overflow:hidden"
	onclick={(e) => { if (!matrixActive) { e.stopPropagation(); inputEl?.focus(); } }}
>
	<div
		bind:this={terminalEl}
		style="position:absolute;inset:0;color:var(--text-0);font-family:var(--font-mono);font-size:12px;padding:14px 18px;overflow:auto"
	>
		{#each history as line, i (i)}
			<div
				style="color:{line.kind === 'in'
					? 'var(--accent)'
					: line.kind === 'err'
						? '#d77860'
						: line.kind === 'sys'
							? 'var(--text-2)'
							: 'var(--text-1)'};white-space:pre-wrap;line-height:1.55"
			>
				{line.text || ' '}
			</div>
		{/each}

		{#if !matrixActive}
			<div style="display:flex;gap:8px;margin-top:4px">
				<span style="color:var(--accent);white-space:nowrap">{cwdLabel(cwd)}/$</span>
				<input
					bind:this={inputEl}
					bind:value={input}
					onkeydown={handleKeyDown}
					autocomplete="off"
					data-1p-ignore
					data-lpignore="true"
					data-form-type="other"
					style="flex:1;background:transparent;border:0;outline:0;color:var(--text-0);font-family:var(--font-mono);font-size:12px"
					aria-label="Terminal input"
				/>
			</div>
		{/if}
	</div>

	{#if matrixActive}
		<canvas
			bind:this={canvasEl}
			style="position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair"
			onclick={stopMatrix}
		></canvas>
		<div style="position:absolute;bottom:18px;right:18px;color:var(--text-2);font-size:11px;pointer-events:none">
			Ctrl+C or click to stop
		</div>
	{/if}
</div>
