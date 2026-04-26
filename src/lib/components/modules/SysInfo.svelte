<script lang="ts">
	import { getMessages } from '$lib/i18n.js';
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { PortableText } from '@portabletext/svelte';
	import type { InputValue } from '@portabletext/svelte';
	import { urlFor } from '$lib/sanity/image.js';
	import type { SysInfo } from '$lib/sanity/types.js';

	interface Props {
		sysInfo?: SysInfo | null;
		projects?: { _id: string }[];
		writings?: { _id: string }[];
		photos?: { _id: string }[];
		winId?: string;
	}

	const { sysInfo, projects = [], writings = [], photos = [] }: Props = $props();

	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	const l = $derived((field: { en?: string; de?: string } | undefined) =>
		field ? (lang === 'de' ? field.de : field.en) ?? '–' : '–'
	);

	const portraitUrl = $derived(
		sysInfo?.portrait ? urlFor(sysInfo.portrait).width(240).height(300).fit('crop').url() : null
	);
	const bio = $derived(
		sysInfo?.bio ? (lang === 'de' ? sysInfo.bio.de : sysInfo.bio.en) as InputValue : null
	);
</script>

<div class="sysinfo-wrap">
	<div class="sysinfo-header">
		<div class="portrait-frame">
			{#if portraitUrl}
				<img src={portraitUrl} alt="Portrait" class="portrait-img" />
			{:else}
				<div class="portrait-placeholder">
					<span class="mono dim">portrait</span>
				</div>
			{/if}
		</div>

		<div class="sysinfo-identity">
			<h1 class="sysinfo-name">{sysInfo?.fullname ?? sysInfo?.user ?? '–'}</h1>
			<div class="mono dim sysinfo-role">{l(sysInfo?.profession)}</div>

			{#if bio}
				<div class="sysinfo-bio">
					<PortableText value={bio} />
				</div>
			{:else}
				<p class="sysinfo-bio">–</p>
			{/if}

			<div class="sysinfo-meta-grid">
				<div class="mono dim meta-label">{t.available()}</div>
				<div>{l(sysInfo?.available_for)}</div>
				<div class="mono dim meta-label">{t.location()}</div>
				<div>{sysInfo?.location ?? '–'}</div>
				<div class="mono dim meta-label">{t.contact()}</div>
				<div><span class="mono accent">{sysInfo?.email ?? '–'}</span></div>
			</div>
		</div>
	</div>

	<div class="divider"></div>

	<div class="sysinfo-section">
		<div class="mono dim si-label">{t.now()}</div>
		<p class="section-body">{l(sysInfo?.currently)}</p>
	</div>

	<div class="sysinfo-section">
		<div class="mono dim si-label">{t.stack()}</div>
		{#if sysInfo?.stack && sysInfo.stack.length > 0}
			<div class="tag-list">
				{#each sysInfo.stack as item}
					<span class="tag">{item}</span>
				{/each}
			</div>
		{:else}
			<p class="section-body dim">–</p>
		{/if}
	</div>

	<div class="sysinfo-section">
		<div class="mono dim si-label">{t.tools()}</div>
		{#if sysInfo?.tools && sysInfo.tools.length > 0}
			<div class="mono dim tools-list">
				{sysInfo.tools.join(' · ')}
			</div>
		{:else}
			<p class="mono dim tools-list">–</p>
		{/if}
	</div>

	<div class="divider"></div>

	<div class="sysinfo-stats">
		<div class="stat-card">
			<div class="serif stat-number">{projects.length}</div>
			<div class="mono dim stat-label">
				{lang === 'de' ? 'Projekte im Archiv' : 'Projects in archive'}
			</div>
		</div>
		<div class="stat-card">
			<div class="serif stat-number">{writings.length}</div>
			<div class="mono dim stat-label">
				{lang === 'de' ? 'Essays veröffentlicht' : 'Essays published'}
			</div>
		</div>
		<div class="stat-card">
			<div class="serif stat-number">{photos.length}</div>
			<div class="mono dim stat-label">
				{lang === 'de' ? 'Aufnahmen archiviert' : 'Frames archived'}
			</div>
		</div>
	</div>

	<div class="divider"></div>

	<div class="mono dim sysinfo-footer">
		RetroOS {sysInfo?.build ?? '–'} · {sysInfo?.shell ?? '–'} · build 2026.04.25
	</div>
</div>

<style>
	.sysinfo-wrap {
		flex: 1;
		overflow-y: auto;
		padding: 28px 36px;
		background: var(--bg-1);
	}

	.sysinfo-header {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 28px;
		align-items: start;
	}

	.portrait-frame {
		width: 120px;
		height: 150px;
		border: 1px solid var(--line-1);
		overflow: hidden;
		flex-shrink: 0;
	}

	.portrait-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.portrait-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-2);
		font-size: 10px;
	}

	.sysinfo-identity {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sysinfo-name {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 600;
		margin: 0;
		color: var(--text-0);
	}

	.sysinfo-role {
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.sysinfo-bio {
		font-size: 13.5px;
		color: var(--text-1);
		line-height: 1.65;
		max-width: 560px;
		margin: 0;
	}

	.sysinfo-bio :global(p) {
		margin: 0 0 8px;
	}

	.sysinfo-meta-grid {
		display: grid;
		grid-template-columns: 120px 1fr;
		row-gap: 6px;
		font-size: 12.5px;
	}

	.meta-label {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.accent {
		color: var(--accent);
	}

	.divider {
		height: 1px;
		background: var(--line-1);
		margin: 22px 0;
	}

	.sysinfo-section {
		margin: 20px 0;
	}

	.si-label {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		margin-bottom: 8px;
	}

	.section-body {
		font-size: 13px;
		color: var(--text-1);
		line-height: 1.65;
		max-width: 560px;
		margin: 0;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tag {
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 3px 8px;
		border: 1px solid var(--line-1);
		color: var(--text-1);
		background: var(--bg-2);
	}

	.tools-list {
		font-size: 11.5px;
		line-height: 1.9;
		margin: 0;
	}

	.sysinfo-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 18px;
	}

	.stat-card {
		border: 1px solid var(--line-1);
		padding: 14px 16px;
		background: var(--bg-2);
	}

	.stat-number {
		font-family: var(--font-display);
		font-size: 32px;
		color: var(--accent);
		line-height: 1;
	}

	.stat-label {
		font-size: 10.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin-top: 6px;
	}

	.sysinfo-footer {
		font-size: 10.5px;
		letter-spacing: 0.06em;
	}
</style>
