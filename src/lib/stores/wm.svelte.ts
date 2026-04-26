import type { Component } from 'svelte';

export interface WindowSpec {
	id: string;
	title: string;
	titleKey?: string;
	component: Component<Record<string, unknown>>;
	props?: Record<string, unknown>;
	x?: number;
	y?: number;
	w?: number;
	h?: number;
	minW?: number;
	minH?: number;
}

export interface WindowState extends Required<Omit<WindowSpec, 'props' | 'titleKey'>> {
	titleKey?: string;
	props: Record<string, unknown>;
	z: number;
	minimized: boolean;
	zoomed: boolean;
	prev: { x: number; y: number; w: number; h: number } | null;
}

interface PersistedWindow {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	minimized: boolean;
	zoomed: boolean;
	prev: { x: number; y: number; w: number; h: number } | null;
	z: number;
}

const STORAGE_KEY = 'retro-os:wm';

function loadPersistedWindows(): PersistedWindow[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
	} catch {
		return [];
	}
}

function saveWindows(windows: WindowState[]) {
	if (typeof localStorage === 'undefined') return;
	const data: PersistedWindow[] = windows.map((w) => ({
		id: w.id,
		x: w.x,
		y: w.y,
		w: w.w,
		h: w.h,
		minimized: w.minimized,
		zoomed: w.zoomed,
		prev: w.prev,
		z: w.z
	}));
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clamp(v: number, lo: number, hi: number): number {
	return Math.max(lo, Math.min(hi, v));
}

function createWMStore() {
	let windows = $state<WindowState[]>([]);
	let focusedId = $state<string | null>(null);
	let zSeq = $state(100);

	const persisted = loadPersistedWindows();

	return {
		get windows() { return windows; },
		get focusedId() { return focusedId; },

		open(spec: WindowSpec, viewport?: { w: number; h: number }) {
			const existing = windows.find((w) => w.id === spec.id);
			if (existing) {
				windows = windows.map((w) =>
					w.id === spec.id ? { ...w, minimized: false, z: zSeq + 1 } : w
				);
				zSeq += 1;
				focusedId = spec.id;
				saveWindows(windows);
				return;
			}

			const saved = persisted.find((p) => p.id === spec.id);
			const initX = saved?.x ?? spec.x ?? 80 + (windows.length * 22) % 200;
			const initY = saved?.y ?? spec.y ?? 60 + (windows.length * 22) % 140;
			const initW = saved?.w ?? (viewport ? Math.min(spec.w ?? 720, viewport.w - 20) : (spec.w ?? 720));
			const initH = saved?.h ?? (viewport ? Math.min(spec.h ?? 460, viewport.h - 110) : (spec.h ?? 460));

			if (zSeq < (saved?.z ?? 0)) zSeq = saved!.z;
			zSeq += 1;

			windows = [...windows, {
				id: spec.id,
				title: spec.title,
				titleKey: spec.titleKey,
				component: spec.component,
				props: spec.props ?? {},
				x: initX,
				y: initY,
				w: initW,
				h: initH,
				minW: spec.minW ?? 360,
				minH: spec.minH ?? 220,
				z: saved?.z ?? zSeq,
				minimized: saved?.minimized ?? false,
				zoomed: saved?.zoomed ?? false,
				prev: saved?.prev ?? null
			}];
			focusedId = spec.id;
			saveWindows(windows);
		},

		close(id: string) {
			windows = windows.filter((w) => w.id !== id);
			if (focusedId === id) focusedId = null;
			saveWindows(windows);
		},

		focus(id: string) {
			zSeq += 1;
			windows = windows.map((w) =>
				w.id === id ? { ...w, z: zSeq, minimized: false } : w
			);
			focusedId = id;
			saveWindows(windows);
		},

		minimize(id: string) {
			windows = windows.map((w) =>
				w.id === id ? { ...w, minimized: true } : w
			);
			if (focusedId === id) focusedId = null;
			saveWindows(windows);
		},

		toggleZoom(id: string, viewport: { w: number; h: number }) {
			windows = windows.map((w) => {
				if (w.id !== id) return w;
				if (w.zoomed && w.prev) {
					return { ...w, ...w.prev, zoomed: false, prev: null };
				}
				return {
					...w,
					zoomed: true,
					prev: { x: w.x, y: w.y, w: w.w, h: w.h },
					x: 12, y: 12,
					w: viewport.w - 24,
					h: viewport.h - 24
				};
			});
			saveWindows(windows);
		},

		move(id: string, x: number, y: number) {
			windows = windows.map((w) => w.id === id ? { ...w, x, y } : w);
			saveWindows(windows);
		},

		resize(id: string, w: number, h: number) {
			windows = windows.map((win) => win.id === id ? { ...win, w, h } : win);
			saveWindows(windows);
		},

		cycle() {
			const visible = windows.filter((w) => !w.minimized);
			if (visible.length === 0) return;
			const sorted = [...visible].sort((a, b) => a.z - b.z);
			const next = sorted[0];
			zSeq += 1;
			windows = windows.map((w) => w.id === next.id ? { ...w, z: zSeq } : w);
			focusedId = next.id;
			saveWindows(windows);
		},

		updateProps(id: string, props: Record<string, unknown>) {
			windows = windows.map((w) =>
				w.id === id ? { ...w, props: { ...w.props, ...props } } : w
			);
		},

		clearPersistedState() {
			if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
		}
	};
}

export const wmStore = createWMStore();

export { clamp };
