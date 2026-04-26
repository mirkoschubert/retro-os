import { defineType, defineField } from 'sanity';

export const photoSeries = defineType({
	name: 'photoSeries',
	title: 'Photo Series',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'object',
			fields: [
				{ name: 'en', type: 'string', title: 'English' },
				{ name: 'de', type: 'string', title: 'Deutsch' }
			]
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'title.en' }
		}),
		defineField({
			name: 'date',
			title: 'Date',
			type: 'date'
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'object',
			fields: [
				{ name: 'en', type: 'text', title: 'English', rows: 2 },
				{ name: 'de', type: 'text', title: 'Deutsch', rows: 2 }
			]
		}),
		defineField({
			name: 'tags',
			title: 'Tags',
			type: 'array',
			of: [{ type: 'string' }]
		})
	],
	preview: {
		select: { title: 'title.en', subtitle: 'date' }
	}
});
