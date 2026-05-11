<script lang="ts">
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { getMessages } from '$lib/i18n.js';

	interface Props {
		token: string;
	}

	const { token }: Props = $props();

	const isMac = systemStore.isMac;
	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	// Returns [label, isMod] for a given token.
	// isMod drives the shortcut-mod vs shortcut-key CSS class.
	const resolved = $derived((): { label: string; mod: boolean } => {
		switch (token) {
			case 'cmd':
				return isMac
					? { label: '⌘', mod: true }
					: { label: t.key_cmd(), mod: true };
			case 'shift':
				return { label: '⇧', mod: true };
			case 'alt':
				return isMac
					? { label: '⌥', mod: true }
					: { label: 'Alt', mod: true };
			case 'ctrl':
				return isMac
					? { label: '⌃', mod: true }
					: { label: t.key_cmd(), mod: true };
			case 'esc':
				return { label: 'Esc', mod: false };
			default:
				return { label: token, mod: false };
		}
	});
</script>

<kbd class={resolved().mod ? 'shortcut-mod' : 'shortcut-key'}>{resolved().label}</kbd>
