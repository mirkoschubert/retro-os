<script lang="ts">
	import {
		LayoutDashboard, Disc, Camera, BookOpen,
		Newspaper, Info, SquareTerminal
	} from '@lucide/svelte';

	interface Props {
		kind: string;
	}
	const { kind }: Props = $props();
</script>

{#if kind === 'projects'}
	<LayoutDashboard size={22} strokeWidth={1.4} />
{:else if kind === 'media'}
	<Disc size={22} strokeWidth={1.4} />
{:else if kind === 'darkroom'}
	<Camera size={22} strokeWidth={1.4} />
{:else if kind === 'writer'}
	<BookOpen size={22} strokeWidth={1.4} />
{:else if kind === 'publications'}
	<Newspaper size={22} strokeWidth={1.4} />
{:else if kind === 'sysinfo'}
	<Info size={22} strokeWidth={1.4} />
{:else if kind === 'terminal'}
	<SquareTerminal size={22} strokeWidth={1.4} />
{/if}
