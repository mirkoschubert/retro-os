import { defineType, defineField } from 'sanity';

export const pressLink = defineType({
	name: 'pressLink',
	title: 'Press Link',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Article Title',
			type: 'string'
		}),
		defineField({
			name: 'url',
			title: 'URL',
			type: 'url'
		}),
		defineField({
			name: 'date',
			title: 'Date',
			type: 'date'
		}),
		defineField({
			name: 'publication',
			title: 'Publication',
			type: 'reference',
			to: [{ type: 'publication' }]
		}),
		defineField({
			name: 'note',
			title: 'Note',
			type: 'string'
		})
	],
	preview: {
		select: { title: 'title', subtitle: 'publication.name' }
	}
});
