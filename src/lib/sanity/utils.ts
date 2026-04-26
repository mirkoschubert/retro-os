import { client } from './client';

export function urlForAudioFile(ref: string): string {
	const { projectId, dataset } = client.config();
	// ref format: "file-{hash}-{extension}"
	const parts = ref.split('-');
	const extension = parts[parts.length - 1];
	const hash = parts.slice(1, parts.length - 1).join('-');
	return `https://cdn.sanity.io/files/${projectId}/${dataset}/${hash}.${extension}`;
}

export function calcReadingTime(blocks: unknown[], _lang: 'en' | 'de'): number {
	if (!blocks || blocks.length === 0) return 1;
	let text = '';
	for (const block of blocks) {
		const b = block as Record<string, unknown>;
		if (b._type !== 'block') continue;
		const children = b.children as Array<{ text?: string }> | undefined;
		if (!children) continue;
		for (const child of children) {
			if (child.text) text += child.text + ' ';
		}
	}
	const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(wordCount / 200));
}

export function pickLocale(lang: 'en' | 'de', obj?: { en?: string; de?: string }): string {
	if (!obj) return '';
	return obj[lang] ?? obj.en ?? '';
}
