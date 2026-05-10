<script lang="ts">
	import { wmStore } from '$lib/stores/wm.svelte.js';
	import type { WindowState } from '$lib/stores/wm.svelte.js';
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';

	interface Props {
		win: WindowState;
		viewport: { w: number; h: number };
	}

	const { win, viewport }: Props = $props();

	const isFocused = $derived(wmStore.focusedId === win.id);
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));
	const displayTitle = $derived(
		win.titleKey && win.titleKey in t
			? (t as Record<string, () => string>)[win.titleKey]()
			: win.title
	);

	let drag: { ox: number; oy: number } | null = $state(null);
	let resz: { ox: number; oy: number; w: number; h: number } | null = $state(null);

	function onTitleDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.win-btn')) return;
		wmStore.focus(win.id);
		drag = { ox: e.clientX - win.x, oy: e.clientY - win.y };
	}

	function onResizeDown(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		wmStore.focus(win.id);
		resz = { ox: e.clientX, oy: e.clientY, w: win.w, h: win.h };
	}

	$effect(() => {
		if (!drag && !resz) return;

		if (resz) document.documentElement.classList.add('cursor-resizing');
		if (drag) document.documentElement.classList.add('cursor-dragging');

		function onMove(e: MouseEvent) {
			if (drag) {
				wmStore.move(win.id, e.clientX - drag.ox, Math.max(0, e.clientY - drag.oy));
			} else if (resz) {
				const w = Math.max(win.minW, resz.w + (e.clientX - resz.ox));
				const h = Math.max(win.minH, resz.h + (e.clientY - resz.oy));
				wmStore.resize(win.id, w, h);
			}
		}
		function onUp() {
			drag = null;
			resz = null;
			document.documentElement.classList.remove('cursor-resizing', 'cursor-dragging');
			wmStore.saveLayout();
		}

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			document.documentElement.classList.remove('cursor-resizing', 'cursor-dragging');
		};
	});

	const Comp = $derived(win.component);
	// Trigger open animation only on true first mount (not restore from minimized).
	import { untrack } from 'svelte';
	let opening = $state(untrack(() => !win.minimized));
	$effect(() => { requestAnimationFrame(() => { opening = false; }); });
</script>

{#if !win.minimized || win.closing || win.restoring}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="window"
		class:is-focused={isFocused}
		class:win-opening={opening}
		class:win-closing={win.closing}
		class:win-restoring={win.restoring}
		class:is-dragging={!!drag}
		class:is-resizing={!!resz}
		style="transform:translate({win.x}px,{win.y}px);width:{win.w}px;height:{win.h}px;z-index:{win.z}"
		onmousedown={() => wmStore.focus(win.id)}
		onfocus={() => wmStore.focus(win.id)}
		role="region"
		aria-label={displayTitle}
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="titlebar"
			onmousedown={onTitleDown}
			ondblclick={() => wmStore.toggleZoom(win.id, viewport)}
			role="banner"
		>
			<div class="win-controls">
				<button
					class="win-btn"
					title="Close"
					onclick={(e) => { e.stopPropagation(); wmStore.close(win.id); }}
					aria-label="Close window"
				>
					<svg viewBox="0 0 8 8"><path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
				</button>
				<button
					class="win-btn"
					title="Minimize"
					onclick={(e) => { e.stopPropagation(); wmStore.minimize(win.id); }}
					aria-label="Minimize window"
				>
					<svg viewBox="0 0 8 8"><path d="M1 6h6" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
				</button>
				<button
					class="win-btn"
					title="Zoom"
					onclick={(e) => { e.stopPropagation(); wmStore.toggleZoom(win.id, viewport); }}
					aria-label="Zoom window"
				>
					<svg viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/></svg>
				</button>
			</div>
			<div class="titlebar-title">{displayTitle}</div>
			<div class="win-controls win-controls-right" style="visibility:hidden">
				<div class="win-btn"></div>
			</div>
		</div>
		<div class="window-body">
			<Comp {...win.props} winId={win.id} />
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="resize-handle" onmousedown={onResizeDown} role="separator" aria-label="Resize window" tabindex="-1"></div>
	</div>
{/if}
