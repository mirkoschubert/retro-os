<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { urlForAudioFile } from '$lib/sanity/utils.js';
	import { urlFor } from '$lib/sanity/image.js';
	import type { Album, TrackItem } from '$lib/sanity/types.js';

	interface FlatTrack extends TrackItem {
		albumTitle: string;
		albumArtist: string;
		albumCover: Album['cover'];
		albumYear: Album['year'];
		trackNumber: number;
	}

	interface Props {
		winId?: string;
		albums?: Album[];
	}

	const { albums = [] }: Props = $props();
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	let view = $state<'library' | 'albums'>('library');
	let playingKey = $state<string | null>(null);
	let isPlaying = $state(false);
	let progress = $state(0);
	let currentTime = $state(0);
	let duration = $state(0);
	let vol = $state(0.62);
	let audioEl = $state<HTMLAudioElement | null>(null);
	let trackDurations = $state<Map<string, number>>(new Map());

	const allTracks = $derived(
		albums.flatMap((a) =>
			(a.tracks ?? []).map((tr, i) => ({
				...tr,
				albumTitle: a.title,
				albumArtist: a.artist,
				albumCover: a.cover,
				albumYear: a.year,
				trackNumber: i + 1
			} satisfies FlatTrack))
		)
	);

	const currentTrack = $derived(allTracks.find((t) => t._key === playingKey) ?? null);

	// Preload metadata for all tracks to get durations without downloading audio data
	$effect(() => {
		for (const tr of allTracks) {
			if (!tr.audioFile?.asset?._ref || trackDurations.has(tr._key)) continue;
			const url = urlForAudioFile(tr.audioFile.asset._ref);
			const a = new Audio();
			a.preload = 'metadata';
			a.addEventListener('loadedmetadata', () => {
				if (isFinite(a.duration)) {
					const next = new Map(trackDurations);
					next.set(tr._key, a.duration);
					trackDurations = next;
				}
			}, { once: true });
			a.src = url;
		}
	});

	$effect(() => {
		if (!audioEl) return;

		function onTimeUpdate() {
			if (!audioEl) return;
			currentTime = audioEl.currentTime;
			duration = isFinite(audioEl.duration) ? audioEl.duration : 0;
			progress = duration > 0 ? currentTime / duration : 0;
		}

		function onEnded() {
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

	function togglePlay(key: string) {
		if (!audioEl) return;
		const track = allTracks.find((t) => t._key === key);
		if (!track) return;

		if (playingKey === key) {
			if (isPlaying) {
				audioEl.pause();
				isPlaying = false;
			} else {
				audioEl.play().catch(() => {});
				isPlaying = true;
			}
			return;
		}

		const url = getAudioUrl(track);
		if (!url) return;
		playingKey = key;
		progress = 0;
		currentTime = 0;
		duration = 0;
		audioEl.src = url;
		audioEl.volume = vol;
		audioEl.play().then(() => { isPlaying = true; }).catch(() => {});
	}

	function playNext() {
		if (!playingKey) return;
		const idx = allTracks.findIndex((t) => t._key === playingKey);
		const next = allTracks[idx + 1];
		if (next) togglePlay(next._key);
	}

	function playPrev() {
		if (!playingKey) return;
		if (currentTime > 3 && audioEl) {
			audioEl.currentTime = 0;
			return;
		}
		const idx = allTracks.findIndex((t) => t._key === playingKey);
		const prev = allTracks[idx - 1];
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

	// Media Session API: registers next/prev hardware keys and OS media center
	$effect(() => {
		if (!('mediaSession' in navigator)) return;
		if (!playingKey) return;

		navigator.mediaSession.setActionHandler('nexttrack', playNext);
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

	// Keyboard shortcuts — mounted on window so no ARIA issues on the container div
	$effect(() => {
		function onKeydown(e: KeyboardEvent) {
			const tag = (e.target as HTMLElement).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			// Only intercept when no other modifier besides Alt is held
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
		try {
			return urlFor(cover).width(size).height(size).url();
		} catch {
			return null;
		}
	}
</script>

<audio bind:this={audioEl} style="position:absolute;width:0;height:0;pointer-events:none"></audio>

<div class="module" style="flex-direction:column">
	<div class="toolbar">
		<button class="tb-btn" class:is-active={view === 'library'} onclick={() => (view = 'library')}>{t.library()}</button>
		<button class="tb-btn" class:is-active={view === 'albums'} onclick={() => (view = 'albums')}>{t.albums()}</button>
		<div class="sep"></div>
		<span class="tb-label mono">/Library/Music</span>
		<div style="flex:1"></div>
		<span class="dim mono">{allTracks.length} {lang === 'de' ? 'Stücke' : 'items'}</span>
	</div>

	<div style="display:flex;flex:1;overflow:hidden">
		{#if view === 'library'}
			<div style="flex:1;overflow:auto">
				<table style="width:100%;border-collapse:collapse;font-size:12.5px">
					<thead>
						<tr style="color:var(--text-3);text-align:left;font-family:var(--font-mono);font-size:10.5px;text-transform:uppercase;letter-spacing:0.1em">
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1);width:32px"></th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">#</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">{lang === 'de' ? 'Titel' : 'Title'}</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">{lang === 'de' ? 'Interpret' : 'Artist'}</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1)">{lang === 'de' ? 'Album' : 'Album'}</th>
							<th style="padding:8px 14px;border-bottom:1px solid var(--line-1);text-align:right">♪</th>
						</tr>
					</thead>
					<tbody>
						{#each allTracks as tr (tr._key)}
							{@const active = playingKey === tr._key}
							<tr
								onclick={() => togglePlay(tr._key)}
								style="background:{active ? 'var(--accent)' : 'transparent'};color:{active ? 'var(--bg-0)' : 'var(--text-1)'};cursor:pointer"
							>
								<td style="padding:6px 14px;width:32px;text-align:center" class="mono">{active && isPlaying ? '▶' : active ? '‖' : '·'}</td>
								<td style="padding:6px 14px" class="mono dim">{String(tr.trackNumber).padStart(2, '0')}</td>
								<td style="padding:6px 14px;color:{active ? 'var(--bg-0)' : 'var(--text-0)'};font-weight:500">{tr.title}</td>
								<td style="padding:6px 14px">{tr.artist ?? tr.albumArtist}</td>
								<td style="padding:6px 14px" class={active ? '' : 'dim'}>{tr.albumTitle}</td>
								<td style="padding:6px 14px;text-align:right" class="mono">
									{#if active}
										{formatTime(duration)}
									{:else if trackDurations.has(tr._key)}
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
		{:else}
			<div style="flex:1;overflow:auto;padding:16px">
				<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px">
					{#each albums as a (a._id)}
						{@const coverUrl = albumCoverUrl(a.cover, 320)}
						{@const firstTrackKey = a.tracks?.[0]?._key}
						<div
							style="cursor:pointer"
							role="button"
							tabindex="0"
							onclick={() => { if (firstTrackKey) { view = 'library'; togglePlay(firstTrackKey); } }}
							onkeydown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && firstTrackKey) { view = 'library'; togglePlay(firstTrackKey); } }}
						>
							{#if coverUrl}
								<img src={coverUrl} alt={a.title} style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block" />
							{:else}
								<div class="ph-image" style="aspect-ratio:1/1">
									<div class="ph-cap">{a.type ?? 'album'}</div>
									<div class="ph-tag">{a.year ?? ''}</div>
								</div>
							{/if}
							<div style="margin-top:8px">
								<div style="color:var(--text-0);font-weight:500;font-size:12px">{a.title}</div>
								<div class="dim" style="font-size:11.5px">{a.artist}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Transport bar -->
	<div style="height:78px;flex-shrink:0;background:var(--bg-2);border-top:1px solid var(--line-0);display:flex;align-items:center;padding:0 18px;gap:16px">
		{#if currentTrack && albumCoverUrl(currentTrack.albumCover, 112)}
			<img
				src={albumCoverUrl(currentTrack.albumCover, 112)!}
				alt={currentTrack.albumTitle}
				style="width:56px;height:56px;object-fit:cover;flex-shrink:0"
			/>
		{:else}
			<div class="ph-image" style="width:56px;height:56px;flex-shrink:0"></div>
		{/if}
		<div style="min-width:0;flex:1">
			<div style="color:var(--text-0);font-weight:500;font-size:13px">
				{currentTrack ? currentTrack.title : (lang === 'de' ? '- Kein Stück gewählt' : '- No track selected')}
			</div>
			<div class="dim mono" style="font-size:10.5px;letter-spacing:0.06em;margin-top:2px">
				{currentTrack
					? `${currentTrack.artist ?? currentTrack.albumArtist} · ${currentTrack.albumTitle} · ${currentTrack.albumYear ?? ''}`
					: 'Library'}
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
				style="margin-top:8px;height:4px;background:var(--bg-3);border:1px solid var(--line-1);position:relative;cursor:pointer"
			>
				<div style="position:absolute;inset:0;width:{progress * 100}%;background:var(--accent)"></div>
			</div>
			<div class="mono dim" style="display:flex;justify-content:space-between;font-size:10px;margin-top:3px">
				<span>{formatTime(currentTime)}</span>
				<span>{formatTime(duration)}</span>
			</div>
		</div>
		<div style="display:flex;gap:6px">
			<button
				onclick={playPrev}
				style="width:32px;height:32px;background:var(--bg-1);border:1px solid var(--line-1);color:var(--text-1);font-size:14px"
				class="mono"
			>≪</button>
			<button
				onclick={() => { if (currentTrack) togglePlay(currentTrack._key); }}
				style="width:40px;height:40px;background:var(--bg-1);border:1px solid var(--line-1);color:var(--text-0);font-size:16px"
				class="mono"
			>{isPlaying ? '❚❚' : '▶'}</button>
			<button
				onclick={playNext}
				style="width:32px;height:32px;background:var(--bg-1);border:1px solid var(--line-1);color:var(--text-1);font-size:14px"
				class="mono"
			>≫</button>
		</div>
		<div style="display:flex;align-items:center;gap:8px;width:120px;flex-shrink:0;min-width:0">
			<span class="mono dim" style="font-size:11px;flex-shrink:0">VOL</span>
			<input type="range" min="0" max="1" step="0.01" bind:value={vol} style="flex:1;min-width:0;accent-color:var(--accent)" />
		</div>
	</div>
</div>
