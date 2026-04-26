import { defineType, defineField } from 'sanity';

export const writing = defineType({
	name: 'writing',
	title: 'Writing',
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
			options: { source: 'title.de' }
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: [
					{ title: 'Flash Fiction', value: 'flash-fiction' },
					{ title: 'Poem', value: 'poem' },
					{ title: 'Essay', value: 'essay' },
					{ title: 'Note', value: 'note' }
				]
			}
		}),
		defineField({
			name: 'date',
			title: 'Date',
			type: 'date'
		}),
		defineField({
			name: 'tags',
			title: 'Tags',
			type: 'array',
			of: [{ type: 'string' }]
		}),
		defineField({
			name: 'excerpt',
			title: 'Excerpt',
			type: 'object',
			fields: [
				{ name: 'en', type: 'text', title: 'English', rows: 3 },
				{ name: 'de', type: 'text', title: 'Deutsch', rows: 3 }
			]
		}),
		defineField({
			name: 'body',
			title: 'Body',
			type: 'object',
			fields: [
				{
					name: 'en',
					type: 'array',
					title: 'English',
					of: [{ type: 'block' }]
				},
				{
					name: 'de',
					type: 'array',
					title: 'Deutsch',
					of: [{ type: 'block' }]
				}
			]
		})
	],
	preview: {
		select: { title: 'title.de', subtitle: 'category' }
	}
});
