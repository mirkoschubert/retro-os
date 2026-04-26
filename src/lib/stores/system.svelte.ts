import { setLocale } from '$lib/paraglide/runtime.js';

export type Era = 'graphite' | 'atelier' | 'workbench';
export type Lang = 'en' | 'de';

function detectInitialLang(): Lang {
	if (typeof window === 'undefined') return 'en';
	try {
		const saved = localStorage.getItem('retro-os.lang');
		if (saved === 'en' || saved === 'de') return saved;
		const host = window.location.hostname || '';
		if (/\.de$/i.test(host)) return 'de';
		if (/\.com$/i.test(host)) return 'en';
		const nav = (navigator.language || 'en').toLowerCase();
		return nav.startsWith('de') ? 'de' : 'en';
	} catch {
		return 'en';
	}
}

function detectInitialEra(): Era {
	if (typeof window === 'undefined') return 'graphite';
	try {
		const saved = localStorage.getItem('retro-os.era');
		if (saved === 'graphite' || saved === 'atelier' || saved === 'workbench') return saved;
	} catch {
		// ignore
	}
	return 'graphite';
}

function detectBootDone(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return localStorage.getItem('retro-os.booted') === 'yes';
	} catch {
		return false;
	}
}

function createSystemStore() {
	let lang = $state<Lang>(detectInitialLang());
	let era = $state<Era>(detectInitialEra());
	let paletteOpen = $state(false);
	let bootDone = $state(detectBootDone());

	return {
		get lang() { return lang; },
		get era() { return era; },
		get paletteOpen() { return paletteOpen; },
		get bootDone() { return bootDone; },

		setLang(value: Lang) {
			lang = value;
			setLocale(value, { reload: false });
			if (typeof window !== 'undefined') {
				try { localStorage.setItem('retro-os.lang', value); } catch { /* ignore */ }
				document.documentElement.setAttribute('lang', value);
			}
		},

		setEra(value: Era) {
			era = value;
			if (typeof window !== 'undefined') {
				try { localStorage.setItem('retro-os.era', value); } catch { /* ignore */ }
				document.documentElement.setAttribute('data-era', value);
			}
		},

		openPalette() { paletteOpen = true; },
		closePalette() { paletteOpen = false; },

		markBooted() {
			bootDone = true;
			if (typeof window !== 'undefined') {
				try { localStorage.setItem('retro-os.booted', 'yes'); } catch { /* ignore */ }
			}
		},

		resetBoot() {
			bootDone = false;
			if (typeof window !== 'undefined') {
				try {
					localStorage.removeItem('retro-os.booted');
					localStorage.removeItem('retro-os.era');
					localStorage.removeItem('retro-os.lang');
				} catch { /* ignore */ }
			}
		}
	};
}

export const systemStore = createSystemStore();
