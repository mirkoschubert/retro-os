import { defineType, defineField } from 'sanity';

export const track = defineType({
	name: 'track',
	title: 'Track',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string'
		}),
		defineField({
			name: 'artist',
			title: 'Artist',
			type: 'string'
		}),
		defineField({
			name: 'album',
			title: 'Album',
			type: 'reference',
			to: [{ type: 'album' }]
		}),
		defineField({
			name: 'year',
			title: 'Year',
			type: 'number'
		}),
		defineField({
			name: 'length',
			title: 'Duration (mm:ss)',
			type: 'string'
		}),
		defineField({
			name: 'bpm',
			title: 'BPM',
			type: 'number'
		}),
		defineField({
			name: 'audioFile',
			title: 'Audio File',
			type: 'file',
			options: { accept: 'audio/*' }
		}),
		defineField({
			name: 'tags',
			title: 'Tags',
			type: 'array',
			of: [{ type: 'string' }]
		})
	],
	preview: {
		select: { title: 'title', subtitle: 'artist' }
	}
});
