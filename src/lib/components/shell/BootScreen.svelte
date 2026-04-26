<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onDone: () => void;
	}

	const { onDone }: Props = $props();

	const bootMsgs = [
		m.boot_msg_1(),
		m.boot_msg_2(),
		m.boot_msg_3(),
		m.boot_msg_4(),
		m.boot_msg_5(),
		m.boot_msg_6()
	];

	let shown = $state(0);
	let fading = $state(false);

	$effect(() => {
		if (shown >= bootMsgs.length) {
			const id = setTimeout(() => {
				fading = true;
				setTimeout(onDone, 500);
			}, 600);
			return () => clearTimeout(id);
		}
		const id = setTimeout(
			() => (shown += 1),
			220 + Math.random() * 180
		);
		return () => clearTimeout(id);
	});

	$effect(() => {
		const skip = () => {
			fading = true;
			setTimeout(onDone, 250);
		};
		window.addEventListener('keydown', skip, { once: true });
		return () => window.removeEventListener('keydown', skip);
	});
</script>

<div class="boot" class:is-fading={fading}>
	<div style="display:flex;flex-direction:column;align-items:center;gap:24px;width:380px;max-width:80vw">
		<div class="boot-mark"></div>
		<div style="text-align:center">
			<div class="boot-title">{m.app_name()}</div>
			<div class="boot-version" style="margin-top:4px">{m.about_version()}</div>
		</div>
		<div class="boot-log" style="width:100%">{#each bootMsgs.slice(0, shown) as msg}<div><span class="ok">●</span> {msg}</div>{/each}{#if shown < bootMsgs.length}<div class="dim">_</div>{/if}</div>
	</div>
	<div class="boot-skip">{m.skip_hint()}</div>
</div>
