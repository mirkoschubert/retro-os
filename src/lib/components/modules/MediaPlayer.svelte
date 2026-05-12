<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { wmStore } from '$lib/stores/wm.svelte.js';
	import { urlForAudioFile } from '$lib/sanity/utils.js';
	import { urlFor } from '$lib/sanity/image.js';
	import type { Album, TrackItem } from '$lib/sanity/types.js';
	import {
		Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
		LayoutGrid, LayoutList, Volume2, VolumeX, ArrowLeft, Music2
	} from '@lucide/svelte';

	interface FlatTrack extends TrackItem {
		albumTitle: string;
		albumArtist: string;
		albumCover: Album['cover'];
		albumYear: Album['year'];
		albumId: string;
		trackNumber: number;
	}

	interface Props {
		winId?: string;
		albums?: Album[];
		initialAlbumId?: string;
		initialTrackKey?: string;
		albumView?: 'grid' | 'list';
	}

	const { albums = [], initialAlbumId, initialTrackKey, winId, albumView: albumViewProp }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	// Two views: 'albums' = all albums overview, 'single' = one album's track list
	let view = $state<'albums' | 'single'>('albums');
	let localAlbumView = $state<'grid' | 'list'>('list');
	const effectiveAlbumView = $derived(albumViewProp ?? localAlbumView);

	// Which album is shown in the single view (decoupled from what's playing)
	let focusedAlbumId = $state<string | null>(null);
	const focusedAlbum = $derived(albums.find((a) => a._id === focusedAlbumId) ?? null);

	// Playback context: which album's tracks are used for next/prev navigation
	// Set when user opens an album and starts playing. Independent of view.
	let playbackAlbumId = $state<string | null>(null);

	// Playback mode
	let repeatMode = $state<'none' | 'all' | 'one'>('none');
	let shuffle = $state(false);
	let shuffleQueue = $state<string[]>([]);
	let shufflePos = $state(0);

	// Handle initialAlbumId from CommandPalette / external caller
	let handledAlbumId = $state<string | null>(null);
	$effect(() => {
		if (initialAlbumId && initialAlbumId !== handledAlbumId) {
			handledAlbumId = initialAlbumId;
			const album = albums.find((a) => a._id === initialAlbumId);
			if (album) openAlbum(album, true);
		}
	});

	// Handle initialTrackKey: find the album, open its single view, play the specific track
	let handledTrackKey = $state<string | null>(null);
	$effect(() => {
		if (initialTrackKey && initialTrackKey !== handledTrackKey) {
			handledTrackKey = initialTrackKey;
			const album = albums.find((a) => a.tracks?.some((tr) => tr._key === initialTrackKey));
			if (album) {
				focusedAlbumId = album._id;
				view = 'single';
				if (winId) wmStore.updateProps(winId, { view: 'single', focusedAlbumId: album._id });
				playbackAlbumId = album._id;
				togglePlay(initialTrackKey);
			}
		}
	});

	let playingKey = $state<string | null>(null);
	let isPlaying = $state(false);
	let progress = $state(0);
	let currentTime = $state(0);
	let duration = $state(0);
	let vol = $state(0.62);
	let volOpen = $state(false);
	let volEl = $state<HTMLElement | null>(null);
	let volPointerActive = $state(false);
	let volChanged = $state(false);
	let volIgnoreClickUntil = 0;
	let volCloseTimer: ReturnType<typeof setTimeout> | null = null;
	let audioEl = $state<HTMLAudioElement | null>(null);

	function isCoarsePointer() {
		return typeof window !== 'undefined' &&
			window.matchMedia('(hover: none), (pointer: coarse)').matches;
	}

	function volClearTimer() {
		if (volCloseTimer) { clearTimeout(volCloseTimer); volCloseTimer = null; }
	}

	function openVolume() { volClearTimer(); volOpen = true; }

	function closeVolume() {
		volClearTimer();
		volOpen = false;
		volPointerActive = false;
		volChanged = false;
	}

	function volScheduleClose(delay = 180) {
		volClearTimer();
		volCloseTimer = setTimeout(() => { if (!volPointerActive) closeVolume(); }, delay);
	}

	function onVolWrapperPointerLeave() {
		if (!isCoarsePointer() && !volPointerActive) closeVolume();
	}

	function onVolButtonClick(e: MouseEvent) {
		if (!isCoarsePointer()) return;
		if (Date.now() < volIgnoreClickUntil) { e.preventDefault(); e.stopPropagation(); return; }
		if (volOpen) closeVolume(); else openVolume();
	}

	function finishVolumeGesture() {
		volPointerActive = false;
		volIgnoreClickUntil = Date.now() + 350;
		if (isCoarsePointer()) volScheduleClose(volChanged ? 120 : 180);
	}

	function onVolPointerDown(e: PointerEvent) {
		volPointerActive = true;
		volChanged = false;
		openVolume();
		try { (e.currentTarget as HTMLInputElement).setPointerCapture(e.pointerId); } catch { /* not supported on all browsers */ }
	}

	function onVolInput() { volChanged = true; }

	function onVolPointerUp(e: PointerEvent) {
		const el = e.currentTarget as HTMLInputElement;
		try { if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId); } catch { /* not supported on all browsers */ }
		finishVolumeGesture();
	}

	function onVolLostCapture() { finishVolumeGesture(); }
	function onVolPointerCancel() { finishVolumeGesture(); }

	$effect(() => {
		if (!volOpen) return;
		const finish = () => finishVolumeGesture();
		window.addEventListener('pointerup', finish, { passive: true });
		window.addEventListener('mouseup', finish, { passive: true });
		window.addEventListener('touchend', finish, { passive: true });
		window.addEventListener('touchcancel', finish, { passive: true });
		return () => {
			window.removeEventListener('pointerup', finish);
			window.removeEventListener('mouseup', finish);
			window.removeEventListener('touchend', finish);
			window.removeEventListener('touchcancel', finish);
		};
	});

	const trackDurations = new SvelteMap<string, number>();
	let durationsVersion = $state(0);
	let rafId: number | null = null;

	const CACHE_MAX = 20;
	const audioBlobCache = new SvelteMap<string, string>();

	$effect(() => {
		return () => {
			for (const url of audioBlobCache.values()) URL.revokeObjectURL(url);
			audioBlobCache.clear();
		};
	});

	const allTracks = $derived(
		albums.flatMap((a) =>
			(a.tracks ?? []).map((tr, i) => ({
				...tr,
				albumTitle: a.title,
				albumArtist: a.artist,
				albumCover: a.cover,
				albumYear: a.year,
				albumId: a._id,
				trackNumber: i + 1
			} satisfies FlatTrack))
		)
	);

	// Tracks used for next/prev navigation — scoped to the playback album if set
	const navTracks = $derived(
		playbackAlbumId
			? allTracks.filter((tr) => tr.albumId === playbackAlbumId)
			: allTracks
	);

	// Tracks shown in the single-album track list
	const singleTracks = $derived(
		focusedAlbumId
			? allTracks.filter((tr) => tr.albumId === focusedAlbumId)
			: []
	);

	const currentTrack = $derived(allTracks.find((t) => t._key === playingKey) ?? null);
	const currentCoverUrl = $derived(
		currentTrack?.albumCover ? albumCoverUrl(currentTrack.albumCover, 112) : null
	);

	function prefetchNextDuration(currentKey: string) {
		const idx = navTracks.findIndex((t) => t._key === currentKey);
		const next = navTracks[idx + 1];
		if (!next || !next.audioFile?.asset?._ref || trackDurations.has(next._key)) return;
		const a = new Audio();
		a.preload = 'metadata';
		a.addEventListener('loadedmetadata', () => {
			if (isFinite(a.duration)) { trackDurations.set(next._key, a.duration); durationsVersion += 1; }
			a.src = '';
		}, { once: true });
		a.src = urlForAudioFile(next.audioFile.asset._ref);
	}

	$effect(() => {
		if (!audioEl) return;

		function onTimeUpdate() {
			if (!audioEl) return;
			if (rafId !== null) return;
			rafId = requestAnimationFrame(() => {
				rafId = null;
				if (!audioEl) return;
				currentTime = audioEl.currentTime;
				duration = isFinite(audioEl.duration) ? audioEl.duration : 0;
				progress = duration > 0 ? currentTime / duration : 0;
			});
		}

		function onEnded() {
			if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
			isPlaying = false;
			playNext();
		}

		function onLoadedMetadata() {
			if (!audioEl) return;
			duration = isFinite(audioEl.duration) ? audioEl.duration : 0;
		}

		audioEl.addEventListener('timeupdate', onTimeUpdate);
		audioEl.addEventListener('ended', onEnded);
		audioEl.addEventListener('loadedmetadata', onLoadedMetadata);

		return () => {
			if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
			audioEl!.removeEventListener('timeupdate', onTimeUpdate);
			audioEl!.removeEventListener('ended', onEnded);
			audioEl!.removeEventListener('loadedmetadata', onLoadedMetadata);
		};
	});

	$effect(() => {
		if (audioEl) audioEl.volume = vol;
	});

	function getAudioUrl(track: FlatTrack): string | null {
		if (!track.audioFile?.asset?._ref) return null;
		return urlForAudioFile(track.audioFile.asset._ref);
	}

	async function resolveAudioSrc(url: string): Promise<string> {
		if (audioBlobCache.has(url)) return audioBlobCache.get(url)!;
		try {
			const res = await fetch(url);
			if (!res.ok) return url;
			const blob = await res.blob();
			const objectUrl = URL.createObjectURL(blob);
			audioBlobCache.set(url, objectUrl);
			if (audioBlobCache.size > CACHE_MAX) {
				const [oldKey, oldUrl] = audioBlobCache.entries().next().value as [string, string];
				URL.revokeObjectURL(oldUrl);
				audioBlobCache.delete(oldKey);
			}
			return objectUrl;
		} catch {
			return url;
		}
	}

	function togglePlay(key: string) {
		if (!audioEl) return;
		const track = allTracks.find((t) => t._key === key);
		if (!track) return;

		if (playingKey === key) {
			if (isPlaying) { audioEl.pause(); isPlaying = false; }
			else { audioEl.play().catch(() => {}); isPlaying = true; }
			return;
		}

		const url = getAudioUrl(track);
		if (!url) return;
		playingKey = key;
		progress = 0; currentTime = 0; duration = 0;
		audioEl.volume = vol;

		const win = winId ? wmStore.windows.find((w) => w.id === winId) : null;
		if (win?.minimized) {
			window.dispatchEvent(new CustomEvent('retro-os:notify', {
				detail: {
					title: track.title,
					body: `${track.artist ?? track.albumArtist} · ${track.albumTitle}`,
					coverUrl: track.albumCover ? albumCoverUrl(track.albumCover, 64) : undefined
				}
			}));
		}

		if (!trackDurations.has(key) && track.audioFile?.asset?._ref) {
			const a = new Audio();
			a.preload = 'metadata';
			a.addEventListener('loadedmetadata', () => {
				if (isFinite(a.duration)) { trackDurations.set(key, a.duration); durationsVersion += 1; }
				a.src = '';
			}, { once: true });
			a.src = urlForAudioFile(track.audioFile.asset._ref);
		}

		resolveAudioSrc(url).then((src) => {
			if (!audioEl) return;
			audioEl.src = src;
			audioEl.play().then(() => { isPlaying = true; prefetchNextDuration(key); }).catch(() => {});
		});
	}

	// Open an album: show single view, start playback only if not already playing from this album.
	// forcePlay=true is used by initialAlbumId (CommandPalette) to always start.
	function openAlbum(album: Album, forcePlay = false) {
		const alreadyPlaying = currentTrack?.albumId === album._id;
		focusedAlbumId = album._id;
		view = 'single';
		if (winId) wmStore.updateProps(winId, { view: 'single', focusedAlbumId: album._id });

		if (forcePlay || !alreadyPlaying) {
			playbackAlbumId = album._id;
			const firstKey = album.tracks?.[0]?._key;
			if (firstKey) {
				if (shuffle) buildShuffleQueue(firstKey);
				togglePlay(firstKey);
			}
		}
	}

	// Show current album's single view without touching playback
	function showPlayingAlbum() {
		if (!currentTrack) return;
		const album = albums.find((a) => a._id === currentTrack.albumId);
		if (!album) return;
		focusedAlbumId = album._id;
		view = 'single';
		if (winId) wmStore.updateProps(winId, { view: 'single', focusedAlbumId: album._id });
	}

	function goToAlbums() {
		view = 'albums';
		if (winId) wmStore.updateProps(winId, { view: 'albums' });
	}

	function setAlbumView(v: 'grid' | 'list') {
		localAlbumView = v;
		if (winId) wmStore.updateProps(winId, { albumView: v });
	}

	function buildShuffleQueue(currentKey: string | null) {
		const keys = navTracks.map((t) => t._key);
		for (let i = keys.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[keys[i], keys[j]] = [keys[j], keys[i]];
		}
		if (currentKey) {
			const ci = keys.indexOf(currentKey);
			if (ci > 0) { keys.splice(ci, 1); keys.unshift(currentKey); }
		}
		shuffleQueue = keys;
		shufflePos = currentKey ? 0 : -1;
	}

	function cycleRepeat() {
		if (repeatMode === 'none') repeatMode = 'all';
		else if (repeatMode === 'all') repeatMode = 'one';
		else repeatMode = 'none';
	}

	function toggleShuffle() {
		shuffle = !shuffle;
		if (shuffle) buildShuffleQueue(playingKey);
	}

	function playNext() {
		if (repeatMode === 'one' && playingKey && audioEl) {
			audioEl.currentTime = 0;
			audioEl.play().then(() => { isPlaying = true; }).catch(() => {});
			return;
		}
		if (shuffle) {
			const nextPos = shufflePos + 1;
			if (nextPos < shuffleQueue.length) {
				shufflePos = nextPos;
				togglePlay(shuffleQueue[nextPos]);
			} else if (repeatMode === 'all') {
				buildShuffleQueue(null);
				shufflePos = 0;
				if (shuffleQueue[0]) togglePlay(shuffleQueue[0]);
			}
			return;
		}
		if (!playingKey) return;
		const idx = navTracks.findIndex((t) => t._key === playingKey);
		const next = navTracks[idx + 1];
		if (next) {
			togglePlay(next._key);
		} else if (repeatMode === 'all' && navTracks.length > 0) {
			togglePlay(navTracks[0]._key);
		}
	}

	function playPrev() {
		if (!playingKey) return;
		if (currentTime > 3 && audioEl) { audioEl.currentTime = 0; return; }
		if (shuffle) {
			const prevPos = shufflePos - 1;
			if (prevPos >= 0) { shufflePos = prevPos; togglePlay(shuffleQueue[prevPos]); }
			return;
		}
		const idx = navTracks.findIndex((t) => t._key === playingKey);
		const prev = navTracks[idx - 1];
		if (prev) togglePlay(prev._key);
	}

	function seekTo(e: MouseEvent) {
		if (!audioEl || duration === 0) return;
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		audioEl.currentTime = ratio * duration;
	}

	function formatTime(sec: number): string {
		if (!isFinite(sec) || isNaN(sec)) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${String(s).padStart(2, '0')}`;
	}

	$effect(() => {
		if (!('mediaSession' in navigator)) return;
		if (!playingKey) return;
		navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
		navigator.mediaSession.setActionHandler('previoustrack', playPrev);
		if (currentTrack) {
			const coverSrc = currentTrack.albumCover
				? urlFor(currentTrack.albumCover).width(512).height(512).url()
				: null;
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentTrack.title,
				artist: currentTrack.artist ?? currentTrack.albumArtist,
				album: currentTrack.albumTitle,
				...(coverSrc ? { artwork: [{ src: coverSrc, sizes: '512x512', type: 'image/jpeg' }] } : {})
			});
		}
		return () => {
			navigator.mediaSession.setActionHandler('nexttrack', null);
			navigator.mediaSession.setActionHandler('previoustrack', null);
		};
	});

	$effect(() => {
		function onKeydown(e: KeyboardEvent) {
			const tag = (e.target as HTMLElement).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			if (e.metaKey || e.ctrlKey) return;
			switch (e.key) {
				case ' ':
					e.preventDefault();
					if (currentTrack) togglePlay(currentTrack._key);
					else if (allTracks[0]) togglePlay(allTracks[0]._key);
					break;
				case 'ArrowRight':
					if (e.altKey) { e.preventDefault(); playNext(); }
					break;
				case 'ArrowLeft':
					if (e.altKey) { e.preventDefault(); playPrev(); }
					break;
				case 'ArrowUp':
					if (e.altKey) { e.preventDefault(); vol = Math.min(1, Math.round((vol + 0.05) * 100) / 100); }
					break;
				case 'ArrowDown':
					if (e.altKey) { e.preventDefault(); vol = Math.max(0, Math.round((vol - 0.05) * 100) / 100); }
					break;
			}
		}
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	function albumCoverUrl(cover: Album['cover'], size = 320): string | null {
		if (!cover) return null;
		try { return urlFor(cover).width(size).height(size).url(); } catch { return null; }
	}
</script>

<audio bind:this={audioEl} style="position:absolute;width:0;height:0;pointer-events:none"></audio>

<div class="module" style="flex-direction:column">

	<!-- Toolbar -->
	<div class="toolbar">
		{#if view === 'single'}
			<button class="tb-btn" onclick={goToAlbums}><ArrowLeft size={13} /> {t.back_to_albums()}</button>
			<div class="sep"></div>
			<span class="tb-label">{focusedAlbum?.title ?? ''}</span>
		{:else}
			<!-- Albums view: show grid/list toggle -->
			<button
				class="tb-btn"
				class:is-active={effectiveAlbumView === 'list'}
				onclick={() => setAlbumView('list')}
			><LayoutList size={14} /></button>
			<button
				class="tb-btn"
				class:is-active={effectiveAlbumView === 'grid'}
				onclick={() => setAlbumView('grid')}
			><LayoutGrid size={14} /></button>
		{/if}
		<div style="flex:1"></div>
		<span class="dim mono">
			{view === 'single' ? singleTracks.length : albums.length}
			{view === 'single' ? (lang === 'de' ? 'Stücke' : 'tracks') : (lang === 'de' ? 'Alben' : 'albums')}
		</span>
	</div>

	<!-- Content -->
	<div style="display:flex;flex:1;overflow:hidden">

		{#if view === 'single'}
			<!-- Single album track list -->
			<div style="flex:1;overflow:auto">
				<table style="width:100%;border-collapse:collapse;font-size:12.5px">
					<thead>
						<tr style="color:var(--text-3);text-align:left;font-family:var(--font-mono);font-size:10.5px;text-transform:uppercase;letter-spacing:0.1em">
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1);width:32px"></th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">#</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">{lang === 'de' ? 'Titel' : 'Title'}</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">{lang === 'de' ? 'Interpret' : 'Artist'}</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1);text-align:right">♪</th>
						</tr>
					</thead>
					<tbody>
						{#each singleTracks as tr (tr._key)}
							{@const active = playingKey === tr._key}
							<tr
								onclick={() => {
									playbackAlbumId = focusedAlbumId;
									if (shuffle) buildShuffleQueue(tr._key);
									togglePlay(tr._key);
								}}
								style="background:{active ? 'var(--accent)' : 'transparent'};color:{active ? 'var(--bg-0)' : 'var(--text-1)'};cursor:pointer"
							>
								<td style="padding:6px 14px;width:32px;text-align:center">
									{#if active && isPlaying}<Volume2 size={13} />{:else if active}<Music2 size={13} />{:else}<span class="mono dim" style="font-size:9px">·</span>{/if}
								</td>
								<td style="padding:6px 14px" class="mono dim">{String(tr.trackNumber).padStart(2, '0')}</td>
								<td style="padding:6px 14px;color:{active ? 'var(--bg-0)' : 'var(--text-0)'};font-weight:500">{tr.title}</td>
								<td style="padding:6px 14px">{tr.artist ?? tr.albumArtist}</td>
								<td style="padding:6px 14px;text-align:right" class="mono">
									{#if active}
										{formatTime(duration)}
									{:else if durationsVersion >= 0 && trackDurations.has(tr._key)}
										{formatTime(trackDurations.get(tr._key)!)}
									{:else}
										-:--
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

		{:else if effectiveAlbumView === 'grid'}
			<!-- Grid view -->
			<div style="flex:1;overflow:auto;padding:16px">
				<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px">
					{#each albums as a (a._id)}
						{@const coverUrl = albumCoverUrl(a.cover, 320)}
						{@const playing = currentTrack?.albumId === a._id}
						<div
							style="cursor:pointer"
							role="button"
							tabindex="0"
							onclick={() => openAlbum(a)}
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openAlbum(a); }}
						>
							{#if coverUrl}
								<div style="position:relative">
									<img src={coverUrl} alt={a.title} style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;{playing ? 'outline:2px solid var(--accent);outline-offset:-2px' : ''}" />
									{#if playing && isPlaying}
										<div class="album-playing-badge"><Volume2 size={12} /></div>
									{/if}
								</div>
							{:else}
								<div class="ph-image" style="aspect-ratio:1/1">
									<div class="ph-cap">{a.type ?? 'album'}</div>
									<div class="ph-tag">{a.year ?? ''}</div>
								</div>
							{/if}
							<div style="margin-top:8px">
								<div style="color:{playing ? 'var(--accent)' : 'var(--text-0)'};font-weight:500;font-size:12px">{a.title}</div>
								<div class="dim" style="font-size:11.5px">{a.artist}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

		{:else}
			<!-- List view -->
			<div style="flex:1;overflow:auto">
				{#each albums as a (a._id)}
					{@const coverUrl = albumCoverUrl(a.cover, 240)}
					{@const desc = a.description?.[lang]}
					{@const playing = currentTrack?.albumId === a._id}
					<div
						class="album-list-row"
						class:album-playing={playing}
						role="button"
						tabindex="0"
						onclick={() => openAlbum(a)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openAlbum(a); }}
					>
						<div style="position:relative;flex-shrink:0;line-height:0">
							{#if coverUrl}
								<img src={coverUrl} alt={a.title} class="album-list-cover" />
							{:else}
								<div class="ph-image album-list-cover">
									<div class="ph-cap">{a.type ?? 'album'}</div>
									<div class="ph-tag">{a.year ?? ''}</div>
								</div>
							{/if}
							{#if playing && isPlaying}
								<div class="album-playing-badge"><Volume2 size={12} /></div>
							{/if}
						</div>
						<div class="album-list-meta">
							<div style="font-weight:500;color:{playing ? 'var(--accent)' : 'var(--text-0)'};font-size:13px">{a.title}</div>
							<div class="mono dim" style="font-size:10.5px;margin-top:4px;text-transform:uppercase;letter-spacing:0.08em">
								{a.artist} · {a.year ?? ''} · {a.type ?? 'album'}
							</div>
							{#if desc}
								<div class="dim" style="font-size:12px;margin-top:8px;line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
									{desc}
								</div>
							{/if}
							{#if a.spotifyUrl || a.appleMusicUrl || a.youtubeMusicUrl}
								<div style="display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px">
									{#if a.spotifyUrl}
										<a href={a.spotifyUrl} target="_blank" rel="external noreferrer noopener"
											title={t.open_on_spotify()} class="album-stream-link mono"
											onclick={(e) => e.stopPropagation()}>↗ Spotify</a>
									{/if}
									{#if a.appleMusicUrl}
										<a href={a.appleMusicUrl} target="_blank" rel="external noreferrer noopener"
											title={t.open_on_apple_music()} class="album-stream-link mono"
											onclick={(e) => e.stopPropagation()}>↗ Apple Music</a>
									{/if}
									{#if a.youtubeMusicUrl}
										<a href={a.youtubeMusicUrl} target="_blank" rel="external noreferrer noopener"
											title={t.open_on_youtube_music()} class="album-stream-link mono"
											onclick={(e) => e.stopPropagation()}>↗ YouTube Music</a>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

	</div>

	<!-- Transport bar -->
	<div class="transport">
		<!-- Cover: click to show album single view (no playback change) -->
		{#if currentTrack && currentCoverUrl}
			<button class="transport-cover-btn" title={currentTrack.albumTitle} onclick={showPlayingAlbum}>
				<img src={currentCoverUrl} alt={currentTrack.albumTitle} class="transport-cover" />
			</button>
		{:else}
			<div class="ph-image transport-cover"></div>
		{/if}

		<!-- Track info + progress -->
		<div class="transport-info">
			<div class="transport-title">
				{currentTrack ? currentTrack.title : (lang === 'de' ? '- Kein Stück gewählt' : '- No track selected')}
			</div>
			<div class="transport-meta mono dim">
				{currentTrack
					? `${currentTrack.artist ?? currentTrack.albumArtist} · ${currentTrack.albumTitle} · ${currentTrack.albumYear ?? ''}`
					: (lang === 'de' ? 'Kein Album ausgewählt' : 'No album selected')}
			</div>
			<div
				role="slider"
				tabindex="0"
				aria-label={lang === 'de' ? 'Wiedergabeposition' : 'Playback position'}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(progress * 100)}
				onclick={seekTo}
				onkeydown={(e) => {
					if (!audioEl || duration === 0) return;
					if (e.key === 'ArrowRight') audioEl.currentTime = Math.min(duration, currentTime + 5);
					if (e.key === 'ArrowLeft') audioEl.currentTime = Math.max(0, currentTime - 5);
				}}
				class="progress-bar"
			>
				<div class="progress-fill" style="width:{progress * 100}%"></div>
			</div>
			<div class="transport-time mono dim">
				<span>{formatTime(currentTime)}</span>
				<span>{formatTime(duration)}</span>
			</div>
		</div>

		<!-- Controls -->
		<div class="transport-controls">
			<button
				class="ctrl-btn ctrl-mode"
				class:ctrl-active={shuffle}
				class:ctrl-disabled={repeatMode === 'one'}
				disabled={repeatMode === 'one'}
				title="Shuffle"
				onclick={toggleShuffle}
			><Shuffle size={15} /></button>

			<button class="ctrl-btn ctrl-skip" title="Previous" onclick={playPrev}><SkipBack size={17} /></button>

			<button
				class="ctrl-btn ctrl-play"
				onclick={() => {
					if (currentTrack) togglePlay(currentTrack._key);
					else if (allTracks[0]) {
						playbackAlbumId = allTracks[0].albumId;
						togglePlay(allTracks[0]._key);
					}
				}}
			>{#if isPlaying}<Pause size={17} />{:else}<Play size={17} />{/if}</button>

			<button class="ctrl-btn ctrl-skip" title="Next" onclick={playNext}><SkipForward size={17} /></button>

			<button
				class="ctrl-btn ctrl-mode"
				class:ctrl-active={repeatMode !== 'none'}
				title="Repeat"
				onclick={cycleRepeat}
			>{#if repeatMode === 'one'}<Repeat1 size={15} />{:else}<Repeat size={15} />{/if}</button>
		</div>

		<!-- Volume popover -->
		<div
			class="transport-vol"
			class:vol-open={volOpen}
			role="group"
			bind:this={volEl}
			onpointerleave={onVolWrapperPointerLeave}
		>
			<button
				class="ctrl-btn ctrl-vol-btn"
				title="Volume"
				onclick={onVolButtonClick}
				aria-label="Volume"
				aria-expanded={volOpen}
			>{#if vol === 0}<VolumeX size={14} />{:else}<Volume2 size={14} />{/if}</button>
			<div class="vol-popover" role="dialog" aria-label="Volume control">
				<input
					type="range"
					min="0" max="1" step="0.01"
					bind:value={vol}
					class="vol-slider"
					aria-label="Volume"
					onpointerdown={onVolPointerDown}
					onpointerup={onVolPointerUp}
					onpointercancel={onVolPointerCancel}
					onlostpointercapture={onVolLostCapture}
					oninput={onVolInput}
				/>
			</div>
		</div>
	</div>

</div>

<style>
	/* Album list view */
	.album-list-row {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px;
		border-bottom: 1px solid var(--line-0);
		cursor: pointer;
	}
	.album-list-row:hover { background: var(--bg-2); }
	.album-list-cover {
		width: 120px;
		height: 120px;
		object-fit: cover;
	}
	.album-playing-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		background: var(--accent);
		color: var(--bg-0);
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.album-list-meta {
		flex: 1;
		min-width: 0;
		padding-top: 4px;
	}
	.album-stream-link {
		color: var(--accent);
		text-decoration: none;
		font-size: 11px;
	}
	.album-stream-link:hover { text-decoration: underline; }

	/* Transport — single row: Cover | Info+Progress | Controls | Vol */
	.transport {
		height: 80px;
		flex-shrink: 0;
		background: var(--bg-2);
		border-top: 1px solid var(--line-0);
		display: flex;
		align-items: center;
		padding: 0 14px;
		gap: 14px;
	}
	.transport-cover-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		flex-shrink: 0;
		display: block;
	}
	.transport-cover-btn:hover .transport-cover { opacity: 0.8; }
	.transport-cover {
		width: 52px;
		height: 52px;
		object-fit: cover;
		display: block;
		flex-shrink: 0;
	}
	.transport-info {
		min-width: 0;
		flex: 1;
	}
	.transport-title {
		color: var(--text-0);
		font-weight: 500;
		font-size: 13px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.transport-meta {
		font-size: 10.5px;
		letter-spacing: 0.06em;
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.transport-time {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		margin-top: 3px;
	}
	.progress-bar {
		margin-top: 8px;
		height: 4px;
		background: var(--bg-3);
		border: 1px solid var(--line-1);
		position: relative;
		cursor: pointer;
	}
	.progress-fill {
		position: absolute;
		inset: 0;
		background: var(--accent);
	}

	/* Controls */
	.transport-controls {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}
	.ctrl-btn {
		background: var(--bg-1);
		border: 1px solid var(--line-1);
		color: var(--text-2);
		font-size: 16px;
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: 2px;
		padding: 0;
		line-height: 1;
	}
	:global(html[data-era="workbench"]) .ctrl-btn { border-radius: 0; }
	.ctrl-btn:hover { border-color: var(--accent); color: var(--text-0); }
	.ctrl-active { color: var(--accent) !important; border-color: var(--accent); }
	.ctrl-mode {
		font-size: 18px;
		width: 30px;
		height: 30px;
		color: var(--text-3);
	}
	.ctrl-disabled {
		opacity: 0.35;
		cursor: not-allowed;
		pointer-events: none;
	}
	.ctrl-skip {
		width: 34px;
		font-size: 18px;
		color: var(--text-1);
	}
	.ctrl-play {
		width: 42px;
		height: 42px;
		background: var(--bg-3);
		color: var(--text-0);
		font-size: 18px;
		border-color: var(--line-2);
	}
	.ctrl-play:hover { background: var(--accent); border-color: var(--accent); color: var(--bg-0); }

	/* Volume popover */
	.transport-vol {
		position: relative;
		flex-shrink: 0;
	}
	.ctrl-vol-btn {
		width: 32px;
		height: 32px;
		color: var(--text-3);
		position: relative;
		z-index: 2;
	}
	.vol-popover {
		z-index: 2;
		position: absolute;
		/* Kein Gap: Popover sitzt direkt auf dem Button, padding gibt visuellen Abstand */
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--bg-2);
		border: 1px solid var(--line-1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		padding: 10px 8px 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.12s ease;
	}
	/* Touch: Button-Toggle öffnet */
	.transport-vol.vol-open .vol-popover {
		opacity: 1;
		pointer-events: all;
	}
	.vol-slider {
		writing-mode: vertical-lr;
		direction: rtl;
		height: 80px;
		width: 20px;
		accent-color: var(--accent);
		cursor: pointer;
		touch-action: none;
	}

	/* Desktop only: hover opens the popover (fine pointer = mouse, not touch) */
	@media (hover: hover) and (pointer: fine) {
		.transport-vol:hover .vol-popover {
			opacity: 1;
			pointer-events: all;
		}
	}

	@media (max-width: 640px) {
		.transport {
			height: auto;
			flex-wrap: wrap;
			padding: 10px 12px 8px;
			gap: 8px;
		}
		.transport-cover-btn,
		.ph-image.transport-cover {
			align-self: flex-start;
		}
		.transport-controls {
			order: 3;
			flex: 1;
			justify-content: center;
		}
		.transport-vol {
			order: 4;
		}
	}
</style>
