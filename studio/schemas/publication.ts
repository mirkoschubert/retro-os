import { defineType, defineField } from 'sanity';

export const publication = defineType({
	name: 'publication',
	title: 'Publication',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Name',
			type: 'string'
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'name' }
		}),
		defineField({
			name: 'url',
			title: 'URL',
			type: 'url'
		}),
		defineField({
			name: 'logo',
			title: 'Logo',
			type: 'image',
			options: { hotspot: true }
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
			name: 'period',
			title: 'Period',
			type: 'object',
			fields: [
				{ name: 'from', type: 'number', title: 'From (year)' },
				{ name: 'to', type: 'number', title: 'To (year)' }
			]
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: [
					{ title: 'Tech', value: 'tech' },
					{ title: 'Culture', value: 'culture' },
					{ title: 'Music', value: 'music' },
					{ title: 'Lifestyle', value: 'lifestyle' }
				]
			}
		})
	],
	preview: {
		select: { title: 'name', subtitle: 'url' }
	}
});
