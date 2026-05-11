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
	startMinimized?: boolean;
}

export interface WindowState extends Required<Omit<WindowSpec, 'props' | 'titleKey' | 'startMinimized'>> {
	titleKey?: string;
	props: Record<string, unknown>;
	z: number;
	minimized: boolean;
	closing: boolean;
	restoring: boolean;
	zoomed: boolean;
	prev: { x: number; y: number; w: number; h: number } | null;
}

interface PersistedEntry {
	x: number;
	y: number;
	w: number;
	h: number;
	zoomed: boolean;
	prev: { x: number; y: number; w: number; h: number } | null;
	minimized: boolean;
	z: number;
	open: boolean;
}

const STORE_KEY = 'retro-os:wm';

function load(): Record<string, PersistedEntry> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
		// Migrate old format: was an array of {id, minimized, z}
		if (Array.isArray(raw)) return {};
		return raw as Record<string, PersistedEntry>;
	} catch {
		return {};
	}
}

function save(windows: WindowState[]) {
	if (typeof localStorage === 'undefined') return;
	// Merge: keep existing entries (preserves geometry of closed windows), update open ones
	const data: Record<string, PersistedEntry> = load();
	const openIds = new Set(windows.map((w) => w.id));

	// Mark previously-open entries as closed if they are no longer in the window list
	for (const id of Object.keys(data)) {
		if (!openIds.has(id)) data[id] = { ...data[id], open: false };
	}
	// Write current window state
	for (const w of windows) {
		data[w.id] = { x: w.x, y: w.y, w: w.w, h: w.h, zoomed: w.zoomed, prev: w.prev, minimized: w.minimized, z: w.z, open: true };
	}
	localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function clamp(v: number, lo: number, hi: number): number {
	return Math.max(lo, Math.min(hi, v));
}

// Cascade offset: new window opens 22px right + down of the currently focused window.
// Wraps back toward the top-left when near the viewport edge.
function cascadePosition(
	focused: { x: number; y: number } | null,
	viewport: { w: number; h: number } | undefined,
	winW: number,
	winH: number,
	isTabletPortrait?: boolean
): { x: number; y: number } {
	const step = 22;
	const marginRight = 80;
	const marginBottom = 60;
	const maxX = viewport ? viewport.w - winW - marginRight : 600;
	const maxY = viewport ? viewport.h - winH - marginBottom : 400;

	if (!focused) return { x: isTabletPortrait ? 8 : 40, y: isTabletPortrait ? 8 : 40 };

	let x = isTabletPortrait ? focused.x : focused.x + step;
	let y = focused.y + step;

	// Wrap: if too far right or down, reset near top-left
	const wrapX = !isTabletPortrait && x > maxX;
	const wrapY = y > maxY;
	if (wrapX || wrapY) { x = isTabletPortrait ? 8 : 40; y = isTabletPortrait ? 8 : 40; }

	return { x, y };
}

function createWMStore() {
	let windows = $state<WindowState[]>([]);
	let focusedId = $state<string | null>(null);
	let zSeq = $state(100);
	const animTimers: Record<string, ReturnType<typeof setTimeout>> = {};

	function setTimer(id: string, fn: () => void, ms: number) {
		clearTimeout(animTimers[id]);
		animTimers[id] = setTimeout(fn, ms);
	}

	return {
		get windows() { return windows; },
		get focusedId() { return focusedId; },

		open(spec: WindowSpec, viewport?: { w: number; h: number; tabletPortraitW?: number }) {
			// Already open: bring to front
			const existing = windows.find((w) => w.id === spec.id);
			if (existing) {
				if (!spec.startMinimized) {
					zSeq += 1;
					windows = windows.map((w) =>
						w.id === spec.id ? { ...w, minimized: false, closing: false, z: zSeq } : w
					);
					focusedId = spec.id;
					save(windows);
				}
				return;
			}

			const persisted = load()[spec.id];

			// Geometry: persisted > cascade
			let initX: number;
			let initY: number;
			let initW: number;
			const initH = persisted?.h ?? spec.h ?? 460;

			const isTabletPortrait = !persisted && viewport?.tabletPortraitW !== undefined;

			if (persisted) {
				initX = persisted.x;
				initY = persisted.y;
				initW = persisted.w;
			} else {
				const pad = 8;
				initW = isTabletPortrait ? (viewport!.tabletPortraitW! - pad * 2) : (spec.w ?? 720);

				const base = windows.length > 0
					? [...windows].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0] ?? null
					: null;
				const pos = cascadePosition(base, viewport, initW, initH, isTabletPortrait);
				initX = pos.x;
				initY = pos.y;
			}

			const maxZ = windows.length > 0 ? Math.max(zSeq, ...windows.map((w) => w.z)) : zSeq;
			zSeq = maxZ + 1;

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
				z: zSeq,
				minimized: spec.startMinimized ?? false,
				closing: false,
				restoring: false,
				zoomed: persisted?.zoomed ?? false,
				prev: persisted?.prev ?? null
			}];

			if (!spec.startMinimized) focusedId = spec.id;

			// Persist immediately so position is remembered if user closes without moving
			save(windows);
		},

		close(id: string) {
			windows = windows.map((w) => w.id === id ? { ...w, closing: true, restoring: false } : w);
			if (focusedId === id) {
				const next = [...windows]
					.filter((w) => w.id !== id && !w.minimized && !w.closing)
					.sort((a, b) => b.z - a.z)[0];
				focusedId = next?.id ?? null;
			}
			setTimer(id, () => {
				windows = windows.filter((w) => w.id !== id);
				save(windows);
			}, 160);
		},

		focus(id: string) {
			zSeq += 1;
			const win = windows.find((w) => w.id === id);
			const wasMinimized = win?.minimized ?? false;
			if (wasMinimized) {
				windows = windows.map((w) =>
					w.id === id ? { ...w, z: zSeq, closing: false, restoring: true } : w
				);
				focusedId = id;
				requestAnimationFrame(() => {
					windows = windows.map((w) => w.id === id ? { ...w, minimized: false } : w);
					setTimer(id, () => {
						windows = windows.map((w) => w.id === id ? { ...w, restoring: false } : w);
						save(windows);
					}, 200);
				});
			} else {
				windows = windows.map((w) =>
					w.id === id ? { ...w, z: zSeq, closing: false } : w
				);
				focusedId = id;
			}
		},

		minimize(id: string) {
			windows = windows.map((w) => w.id === id ? { ...w, closing: true, restoring: false } : w);
			if (focusedId === id) {
				const next = [...windows]
					.filter((w) => w.id !== id && !w.minimized && !w.closing)
					.sort((a, b) => b.z - a.z)[0];
				focusedId = next?.id ?? null;
			}
			setTimer(id, () => {
				windows = windows.map((w) => w.id === id ? { ...w, minimized: true, closing: false } : w);
				save(windows);
			}, 160);
		},

		toggleMinimize(id: string) {
			const win = windows.find((w) => w.id === id);
			if (!win) return;
			if (win.minimized || win.closing) {
				this.focus(id);
			} else if (focusedId === id) {
				this.minimize(id);
			} else {
				this.focus(id);
			}
		},

		toggleZoom(id: string, viewport: { w: number; h: number }) {
			const pad = 12;
			windows = windows.map((w) => {
				if (w.id !== id) return w;
				if (w.zoomed && w.prev) {
					return { ...w, ...w.prev, zoomed: false, prev: null };
				}
				return {
					...w,
					zoomed: true,
					prev: { x: w.x, y: w.y, w: w.w, h: w.h },
					x: pad,
					y: pad,
					w: viewport.w - pad * 2,
					h: viewport.h - pad * 2
				};
			});
			save(windows);
		},

		move(id: string, x: number, y: number) {
			windows = windows.map((w) => w.id === id ? { ...w, x: Math.round(x), y: Math.round(y) } : w);
		},

		resize(id: string, w: number, h: number) {
			windows = windows.map((win) => win.id === id ? { ...win, w: Math.round(w), h: Math.round(h) } : win);
		},

		saveLayout() {
			save(windows);
		},

		cycle() {
			const visible = windows.filter((w) => !w.minimized);
			if (visible.length === 0) return;
			const sorted = [...visible].sort((a, b) => a.z - b.z);
			const next = sorted[0];
			zSeq += 1;
			windows = windows.map((w) => w.id === next.id ? { ...w, z: zSeq } : w);
			focusedId = next.id;
			save(windows);
		},

		updateProps(id: string, props: Record<string, unknown>) {
			windows = windows.map((w) =>
				w.id === id ? { ...w, props: { ...w.props, ...props } } : w
			);
		},

		clearPersistedState() {
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(STORE_KEY);
				// Also clear old split keys from previous versions
				localStorage.removeItem('retro-os:wm:layout');
			}
		}
	};
}

export const wmStore = createWMStore();

// Read the last session without touching store state — used by +page.svelte on mount
export function getPersistedSession(): Array<{ id: string; minimized: boolean; z: number }> {
	const data = load();
	return Object.entries(data)
		.filter(([, entry]) => entry.open)
		.map(([id, entry]) => ({ id, minimized: entry.minimized, z: entry.z }));
}

export { clamp };
