<script lang="ts">
	import { ChevronDown, Check } from '@lucide/svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value: string;
		onChange: (value: string) => void;
		class?: string;
	}

	const { options, value, onChange, class: extraClass = '' }: Props = $props();

	let open = $state(false);
	let wrapperEl = $state<HTMLElement | null>(null);

	const selected = $derived(options.find((o) => o.value === value) ?? options[0]);

	function select(v: string) {
		open = false;
		if (v !== value) onChange(v);
	}

	function toggle() {
		open = !open;
	}

	$effect(() => {
		if (!open) return;
		function onDocClick(e: MouseEvent) {
			if (wrapperEl && !wrapperEl.contains(e.target as Node)) open = false;
		}
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	});
</script>

<div class="tb-select-wrap {extraClass}" bind:this={wrapperEl}>
	<button
		class="tb-select-trigger mono"
		class:is-open={open}
		onclick={toggle}
		aria-haspopup="listbox"
		aria-expanded={open}
	>
		<span class="tb-select-label">{selected?.label ?? ''}</span>
		<ChevronDown size={11} class="tb-select-chevron" />
	</button>

	{#if open}
		<div class="tb-select-popover" role="listbox" aria-label="Filter">
			{#each options as opt (opt.value)}
				<div
					class="tb-select-row"
					class:is-selected={opt.value === value}
					role="option"
					aria-selected={opt.value === value}
					tabindex="0"
					onclick={() => select(opt.value)}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') select(opt.value); }}
				>
					<span class="tb-select-check">
						{#if opt.value === value}<Check size={11} strokeWidth={2.5} />{/if}
					</span>
					<span class="tb-select-opt-label">{opt.label}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tb-select-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.tb-select-trigger {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 22px;
		padding: 0 7px;
		background: var(--bg-1);
		border: 1px solid var(--line-1);
		color: var(--text-1);
		font-size: 11px;
		cursor: pointer;
		white-space: nowrap;
		border-radius: 2px;
	}
	:global(html[data-era="workbench"]) .tb-select-trigger { border-radius: 0; }
	:global(html[data-era="atelier"]) .tb-select-trigger { border-radius: 4px; }

	.tb-select-trigger:hover { border-color: var(--accent); color: var(--text-0); }
	.tb-select-trigger.is-open {
		border-color: var(--accent);
		color: var(--text-0);
		background: var(--bg-2);
	}

	.tb-select-label { flex: 1; }

	.tb-select-popover {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		min-width: 100%;
		background: var(--bg-2);
		border: 1px solid var(--line-0);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
		padding: 4px 0;
		z-index: 400;
		font-size: 12px;
	}
	:global(html[data-era="workbench"]) .tb-select-popover { border-color: var(--accent); }

	.tb-select-row {
		display: flex;
		align-items: center;
		padding: 5px 12px 5px 4px;
		color: var(--text-1);
		cursor: pointer;
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: 11px;
	}
	.tb-select-row:hover { background: var(--accent); color: var(--bg-0); }
	.tb-select-row.is-selected { color: var(--text-0); }
	.tb-select-row.is-selected:hover { color: var(--bg-0); }

	.tb-select-check {
		width: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--accent);
	}
	.tb-select-row:hover .tb-select-check { color: var(--bg-0); }

	.tb-select-opt-label { flex: 1; }
</style>
