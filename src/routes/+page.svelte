<script lang="ts">
	import { onMount } from 'svelte';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { wmStore, getPersistedSession } from '$lib/stores/wm.svelte.js';
	import { getMessages } from '$lib/i18n.js';
	import MenuBar from '$lib/components/shell/MenuBar.svelte';
	import Dock from '$lib/components/shell/Dock.svelte';
	import BootScreen from '$lib/components/shell/BootScreen.svelte';
	import CommandPalette from '$lib/components/shell/CommandPalette.svelte';
	import Window from '$lib/components/wm/Window.svelte';
	import Welcome from '$lib/components/modules/Welcome.svelte';
	import ProjectBrowser from '$lib/components/modules/ProjectBrowser.svelte';
	import MediaPlayer from '$lib/components/modules/MediaPlayer.svelte';
	import Darkroom from '$lib/components/modules/Darkroom.svelte';
	import Writer from '$lib/components/modules/Writer.svelte';
	import SysInfo from '$lib/components/modules/SysInfo.svelte';
	import Terminal from '$lib/components/modules/Terminal.svelte';
	import About from '$lib/components/modules/About.svelte';
	import Publications from '$lib/components/modules/Publications.svelte';
	import Legal from '$lib/components/modules/Legal.svelte';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let viewportW = $state(1280);
	let viewportH = $state(800);

	const deviceClass = $derived(
		viewportW <= 640 ? 'mobile' : viewportW <= 1024 ? 'tablet' : 'desktop'
	);

	let now = $state(new Date());

	function formatNow(d: Date): string {
		return d.toLocaleTimeString(systemStore.lang === 'de' ? 'de-DE' : 'en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	interface ModuleDef {
		id: string;
		title: string;
		titleKey?: string;
		component: Component<Record<string, unknown>>;
		x: number;
		y: number;
		w: number;
		h: number;
		minW?: number;
		minH?: number;
	}

	const pageLang = $derived(systemStore.lang);
	const pageT = $derived(getMessages(pageLang));

	const focusedTitle = $derived(() => {
		const win = wmStore.windows.find((w) => w.id === wmStore.focusedId);
		if (!win) return null;
		if (win.titleKey && win.titleKey in pageT) {
			return (pageT as Record<string, () => string>)[win.titleKey]();
		}
		return win.title;
	});

	function getModuleDefs(): ModuleDef[] {
		return [
			{
				id: 'welcome',
				title: 'Welcome',
				titleKey: 'welcome_title',
				component: Welcome as unknown as Component<Record<string, unknown>>,
				x: 50, y: 40, w: 600, h: 600, minW: 320, minH: 240
			},
			{
				id: 'projects',
				title: 'Projects',
				titleKey: 'mod_projects',
				component: ProjectBrowser as unknown as Component<Record<string, unknown>>,
				x: 80, y: 50, w: 940, h: 720, minW: 480, minH: 320
			},
			{
				id: 'media',
				title: 'Media',
				titleKey: 'mod_media',
				component: MediaPlayer as unknown as Component<Record<string, unknown>>,
				x: 120, y: 60, w: 680, h: 440, minW: 440, minH: 300
			},
			{
				id: 'darkroom',
				title: 'Darkroom',
				titleKey: 'mod_darkroom',
				component: Darkroom as unknown as Component<Record<string, unknown>>,
				x: 100, y: 55, w: 760, h: 500, minW: 480, minH: 340
			},
			{
				id: 'writer',
				title: 'Writer',
				titleKey: 'mod_writer',
				component: Writer as unknown as Component<Record<string, unknown>>,
				x: 140, y: 65, w: 840, h: 720, minW: 400, minH: 360
			},
			{
				id: 'sysinfo',
				title: 'System Info',
				titleKey: 'mod_sysinfo',
				component: SysInfo as unknown as Component<Record<string, unknown>>,
				x: 180, y: 70, w: 560, h: 480, minW: 400, minH: 320
			},
			{
				id: 'terminal',
				title: 'Terminal',
				titleKey: 'mod_terminal',
				component: Terminal as unknown as Component<Record<string, unknown>>,
				x: 200, y: 80, w: 520, h: 380, minW: 360, minH: 240
			},
			{
				id: 'publications',
				title: 'Publications',
				titleKey: 'mod_publications',
				component: Publications as unknown as Component<Record<string, unknown>>,
				x: 160, y: 70, w: 580, h: 440, minW: 420, minH: 300
			},
			{
				id: 'legal',
				title: 'Legal',
				titleKey: 'legal_title',
				component: Legal as unknown as Component<Record<string, unknown>>,
				x: Math.max(60, viewportW / 2 - 250),
				y: Math.max(50, viewportH / 2 - 210),
				w: 500, h: 420, minW: 380, minH: 300
			},
			{
				id: 'about',
				title: 'About RetroOS',
				titleKey: 'about_title',
				component: About as unknown as Component<Record<string, unknown>>,
				x: Math.max(60, viewportW / 2 - 210),
				y: Math.max(50, viewportH / 2 - 200),
				w: 420, h: 340, minW: 320, minH: 260
			}
		];
	}

	function openModule(id: string, extraProps?: Record<string, unknown>, startMinimized?: boolean) {
		const existing = wmStore.windows.find((w) => w.id === id);
		if (existing) {
			if (!startMinimized) {
				wmStore.focus(existing.id);
				if (extraProps) wmStore.updateProps(existing.id, extraProps);
			}
			return;
		}
		const defs = getModuleDefs();
		const def = defs.find((d) => d.id === id);
		if (!def) return;

		const sharedProps: Record<string, unknown> = {
			onOpenModule: openModule,
			projects: data.projects,
			writings: data.writings,
			photos: data.photos,
			photoSeries: data.photoSeries,
			albums: data.albums,
			publications: data.publications,
			sysInfo: data.sysInfo,
			...extraProps
		};

		wmStore.open({
			id: def.id,
			title: def.title,
			titleKey: def.titleKey,
			component: def.component,
			props: sharedProps,
			x: def.x,
			y: def.y,
			w: def.w,
			h: def.h,
			minW: def.minW,
			minH: def.minH,
			startMinimized
		});
	}

	function measureDesktop() {
		const style = getComputedStyle(document.documentElement);
		const menubarH = parseInt(style.getPropertyValue('--menubar-h')) || 26;
		const dockH = parseInt(style.getPropertyValue('--dock-h')) || 64;
		viewportW = window.innerWidth;
		viewportH = window.innerHeight - menubarH - dockH - 24;
	}

	onMount(() => {
		measureDesktop();

		function onResize() {
			measureDesktop();
		}
		window.addEventListener('resize', onResize);

		const clockInterval = setInterval(() => {
			now = new Date();
		}, 30_000);

		function onSetLang(e: Event) {
			const lang = (e as CustomEvent<string>).detail;
			if (lang === 'en' || lang === 'de') {
				systemStore.setLang(lang);
			}
		}
		window.addEventListener('retro-os:setlang', onSetLang);

		function onPalette(e: Event) {
			const open = (e as CustomEvent<boolean>).detail;
			if (open) systemStore.openPalette();
			else systemStore.closePalette();
		}
		window.addEventListener('retro-os:palette', onPalette);

		// Restore last session or fall back to Welcome on first visit
		const session = getPersistedSession();
		if (session.length > 0) {
			// Sort by z so the highest-z window ends up focused last (on top)
			const sorted = [...session].sort((a, b) => a.z - b.z);
			for (const entry of sorted) {
				openModule(entry.id, undefined, entry.minimized);
			}
		} else {
			openModule('welcome');
		}

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				if (systemStore.paletteOpen) {
					systemStore.closePalette();
				} else {
					const focused = wmStore.windows.find((w) => w.id === wmStore.focusedId);
					if (focused) wmStore.close(focused.id);
				}
				return;
			}

			const meta = e.metaKey || e.ctrlKey;
			if (!meta) return;

			switch (e.key) {
				case 'k':
				case 'K':
					e.preventDefault();
					if (systemStore.paletteOpen) systemStore.closePalette();
					else systemStore.openPalette();
					break;
				case '.':
					e.preventDefault();
					openModule('terminal');
					break;
				case 'l':
				case 'L':
					e.preventDefault();
					systemStore.setLang(systemStore.lang === 'de' ? 'en' : 'de');
					break;
				case '`':
					e.preventDefault();
					wmStore.cycle();
					break;
				case '0':
					e.preventDefault();
					openModule('welcome');
					break;
				case '1':
					e.preventDefault();
					openModule('projects');
					break;
				case '2':
					e.preventDefault();
					openModule('media');
					break;
				case '3':
					e.preventDefault();
					openModule('darkroom');
					break;
				case '4':
					e.preventDefault();
					openModule('writer');
					break;
				case '5':
					e.preventDefault();
					openModule('sysinfo');
					break;
				case '6':
					e.preventDefault();
					openModule('terminal');
					break;
				case '7':
					e.preventDefault();
					openModule('publications');
					break;
			}
		}
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('retro-os:setlang', onSetLang);
			window.removeEventListener('retro-os:palette', onPalette);
			window.removeEventListener('keydown', onKeyDown);
			clearInterval(clockInterval);
		};
	});
</script>

<div class="os-root">
	<MenuBar
		lang={systemStore.lang}
		era={systemStore.era}
		focusedTitle={focusedTitle()}
		time={formatNow(now)}
		onSetLang={(l) => systemStore.setLang(l)}
		onSetEra={(e) => systemStore.setEra(e)}
		onOpenAbout={() => openModule('about')}
		onOpenModule={openModule}
		onOpenPalette={() => systemStore.openPalette()}
		onOpenConsole={() => openModule('terminal')}
	/>

	<div class="desktop {deviceClass}">
		{#each wmStore.windows as win (win.id)}
			<Window win={win} viewport={{ w: viewportW, h: viewportH }} />
		{/each}
	</div>

	<Dock
		activeKeys={wmStore.windows.map((w) => w.id)}
		onOpenModule={openModule}
	/>

	<CommandPalette
		open={systemStore.paletteOpen}
		lang={systemStore.lang}
		onClose={() => systemStore.closePalette()}
		onOpenModule={openModule}
		onSetLang={(l) => systemStore.setLang(l)}
		onSetEra={(e) => systemStore.setEra(e)}
		projects={data.projects}
		writings={data.writings}
		photos={data.photos}
		albums={data.albums}
		publications={data.publications}
	/>

	{#if !systemStore.bootDone}
		<BootScreen onDone={() => systemStore.markBooted()} />
	{/if}
</div>
