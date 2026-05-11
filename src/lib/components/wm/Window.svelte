<script lang="ts">
	import { wmStore } from '$lib/stores/wm.svelte.js';
	import type { WindowState } from '$lib/stores/wm.svelte.js';
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { X, Minus, Square } from '@lucide/svelte';

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

	function startDrag(clientX: number, clientY: number) {
		wmStore.focus(win.id);
		drag = { ox: clientX - win.x, oy: clientY - win.y };
	}

	function startResize(clientX: number, clientY: number) {
		wmStore.focus(win.id);
		resz = { ox: clientX, oy: clientY, w: win.w, h: win.h };
	}

	function onTitleDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.win-btn')) return;
		startDrag(e.clientX, e.clientY);
	}

	function onTitleTouchStart(e: TouchEvent) {
		if ((e.target as HTMLElement).closest('.win-btn')) return;
		e.preventDefault();
		const t = e.touches[0];
		startDrag(t.clientX, t.clientY);
	}

	function onResizeDown(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		startResize(e.clientX, e.clientY);
	}

	function onResizeTouchStart(e: TouchEvent) {
		e.stopPropagation();
		e.preventDefault();
		const t = e.touches[0];
		startResize(t.clientX, t.clientY);
	}

	$effect(() => {
		if (!drag && !resz) return;

		if (resz) document.documentElement.classList.add('cursor-resizing');
		if (drag) document.documentElement.classList.add('cursor-dragging');

		function onMove(clientX: number, clientY: number) {
			if (drag) {
				wmStore.move(win.id, clientX - drag.ox, Math.max(0, clientY - drag.oy));
			} else if (resz) {
				const w = Math.max(win.minW, resz.w + (clientX - resz.ox));
				const h = Math.max(win.minH, resz.h + (clientY - resz.oy));
				wmStore.resize(win.id, w, h);
			}
		}

		function onMouseMove(e: MouseEvent) { onMove(e.clientX, e.clientY); }
		function onTouchMove(e: TouchEvent) {
			e.preventDefault();
			const t = e.touches[0];
			onMove(t.clientX, t.clientY);
		}

		function onEnd() {
			drag = null;
			resz = null;
			document.documentElement.classList.remove('cursor-resizing', 'cursor-dragging');
			wmStore.saveLayout();
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onEnd);
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onEnd);
		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onEnd);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onEnd);
			document.documentElement.classList.remove('cursor-resizing', 'cursor-dragging');
		};
	});

	const Comp = $derived(win.component);
	// Trigger open animation only on true first mount (not restore from minimized).
	import { untrack } from 'svelte';
	let opening = $state(untrack(() => !win.minimized));
	$effect(() => { requestAnimationFrame(() => { opening = false; }); });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="window"
	class:is-focused={isFocused}
	class:win-opening={opening}
	class:win-closing={win.closing}
	class:win-restoring={win.restoring}
	class:win-minimized={win.minimized && !win.closing && !win.restoring}
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
			ontouchstart={onTitleTouchStart}
			ondblclick={() => wmStore.toggleZoom(win.id, viewport)}
			role="banner"
		>
			<div class="win-controls">
				<button
					class="win-btn"
					title="Close"
					onclick={(e) => { e.stopPropagation(); wmStore.close(win.id); }}
					aria-label="Close window"
				><X size={9} strokeWidth={2} /></button>
				<button
					class="win-btn"
					title="Minimize"
					onclick={(e) => { e.stopPropagation(); wmStore.minimize(win.id); }}
					aria-label="Minimize window"
				><Minus size={9} strokeWidth={2} /></button>
				<button
					class="win-btn"
					title="Zoom"
					onclick={(e) => { e.stopPropagation(); wmStore.toggleZoom(win.id, viewport); }}
					aria-label="Zoom window"
				><Square size={9} strokeWidth={2} /></button>
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
		<div
			class="resize-handle"
			onmousedown={onResizeDown}
			ontouchstart={onResizeTouchStart}
			role="separator"
			aria-label="Resize window"
			tabindex="-1"
		></div>
	</div>
