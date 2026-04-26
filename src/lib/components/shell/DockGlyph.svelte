<script lang="ts">
	interface Props {
		kind: string;
	}
	const { kind }: Props = $props();
	const sw = 1.4;
</script>

{#if kind === 'projects'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<rect x="3" y="5" width="18" height="14" />
		<line x1="3" y1="9" x2="21" y2="9" />
		<line x1="9" y1="9" x2="9" y2="19" />
	</svg>
{:else if kind === 'media'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<circle cx="12" cy="12" r="8" />
		<circle cx="12" cy="12" r="2" />
	</svg>
{:else if kind === 'darkroom'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<rect x="3" y="6" width="18" height="13" />
		<circle cx="12" cy="12" r="4" />
		<rect x="9" y="3" width="6" height="3" />
	</svg>
{:else if kind === 'writer'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<line x1="6" y1="5" x2="18" y2="5" />
		<line x1="6" y1="9" x2="18" y2="9" />
		<line x1="6" y1="13" x2="14" y2="13" />
		<line x1="6" y1="17" x2="16" y2="17" />
	</svg>
{:else if kind === 'sysinfo'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<circle cx="12" cy="12" r="9" />
		<line x1="12" y1="11" x2="12" y2="17" />
		<circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
	</svg>
{:else if kind === 'archive'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<rect x="3" y="4" width="18" height="5" />
		<rect x="4" y="9" width="16" height="11" />
		<line x1="10" y1="13" x2="14" y2="13" />
	</svg>
{:else if kind === 'publications'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<rect x="4" y="3" width="16" height="18" />
		<line x1="8" y1="8" x2="16" y2="8" />
		<line x1="8" y1="12" x2="16" y2="12" />
		<line x1="8" y1="16" x2="12" y2="16" />
	</svg>
{:else if kind === 'terminal'}
	<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw}>
		<rect x="3" y="5" width="18" height="14" />
		<polyline points="7,10 10,12 7,14" />
		<line x1="12" y1="14" x2="17" y2="14" />
	</svg>
{/if}
