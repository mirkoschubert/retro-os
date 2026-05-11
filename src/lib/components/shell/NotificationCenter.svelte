<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { notificationStore } from '$lib/stores/notifications.svelte.js';

	function dismiss(id: string) {
		notificationStore.dismiss(id);
	}

	onMount(() => {
		function onNotify(e: Event) {
			const detail = (e as CustomEvent).detail ?? {};
			notificationStore.push({
				title: detail.title ?? '',
				body: detail.body,
				coverUrl: detail.coverUrl,
				duration: detail.duration
			});
		}
		window.addEventListener('retro-os:notify', onNotify);
		return () => window.removeEventListener('retro-os:notify', onNotify);
	});
</script>

<div class="notification-center" aria-live="polite" aria-atomic="false">
	{#each notificationStore.notifications as n (n.id)}
		<div
			class="toast"
			role="status"
			in:fly={{ x: 120, duration: 220, opacity: 0 }}
			out:fly={{ x: 120, duration: 280, opacity: 0 }}
		>
			{#if n.coverUrl}
				<img src={n.coverUrl} alt="" class="toast-cover" aria-hidden="true" />
			{/if}
			<div class="toast-text">
				<div class="toast-title">{n.title}</div>
				{#if n.body}
					<div class="toast-body">{n.body}</div>
				{/if}
			</div>
			<button class="toast-close" onclick={() => dismiss(n.id)} aria-label="Dismiss notification">×</button>
		</div>
	{/each}
</div>

<style>
	.notification-center {
		position: fixed;
		top: 38px;
		right: 16px;
		z-index: 500;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 10px;
		width: 280px;
		background: var(--bg-2);
		border: 1px solid var(--line-1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
		pointer-events: all;
	}

	.toast-cover {
		width: 36px;
		height: 36px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.toast-text {
		flex: 1;
		min-width: 0;
	}

	.toast-title {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-0);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toast-body {
		font-size: 10.5px;
		color: var(--text-3);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 2px;
		font-family: var(--font-mono);
		letter-spacing: 0.04em;
	}

	.toast-close {
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		font-size: 15px;
		line-height: 1;
		padding: 0 2px;
		flex-shrink: 0;
	}

	.toast-close:hover {
		color: var(--text-0);
	}
</style>
