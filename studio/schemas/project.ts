import { defineType, defineField } from 'sanity';

export const project = defineType({
	name: 'project',
	title: 'Project',
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
			name: 'year',
			title: 'Year',
			type: 'number'
		}),
		defineField({
			name: 'type',
			title: 'Type',
			type: 'string',
			options: {
				list: [
					{ title: 'Client', value: 'client' },
					{ title: 'Personal', value: 'personal' }
				]
			}
		}),
		defineField({
			name: 'openSource',
			title: 'Open Source',
			type: 'boolean',
			description: 'Mark as open source (independent of project type)',
			initialValue: false
		}),
		defineField({
			name: 'client',
			title: 'Client Name',
			type: 'string',
			description: 'The name of the client (not translated)',
			hidden: ({ document }) => document?.type !== 'client'
		}),
		defineField({
			name: 'context',
			title: 'Context',
			type: 'object',
			description: 'Bilingual context description for personal projects',
			hidden: ({ document }) => document?.type !== 'personal',
			fields: [
				{ name: 'en', type: 'string', title: 'English' },
				{ name: 'de', type: 'string', title: 'Deutsch' }
			]
		}),
		defineField({
			name: 'role',
			title: 'Role',
			type: 'object',
			fields: [
				{ name: 'en', type: 'string', title: 'English' },
				{ name: 'de', type: 'string', title: 'Deutsch' }
			]
		}),
		defineField({
			name: 'stack',
			title: 'Tech Stack',
			type: 'array',
			description: 'English-only technology names',
			of: [{ type: 'string' }]
		}),
		defineField({
			name: 'summary',
			title: 'Summary',
			type: 'object',
			fields: [
				{ name: 'en', type: 'text', title: 'English', rows: 3 },
				{ name: 'de', type: 'text', title: 'Deutsch', rows: 3 }
			]
		}),
		defineField({
			name: 'tags',
			title: 'Tags',
			type: 'array',
			description: 'English-only tags',
			of: [{ type: 'string' }]
		}),
		defineField({
			name: 'links',
			title: 'Links',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'label', type: 'string', title: 'Label' },
						{ name: 'url', type: 'url', title: 'URL' }
					],
					preview: {
						select: { title: 'label', subtitle: 'url' }
					}
				}
			]
		}),
		defineField({
			name: 'cover',
			title: 'Cover Image',
			type: 'image',
			options: { hotspot: true }
		}),
		defineField({
			name: 'images',
			title: 'Detail Images',
			type: 'array',
			description: 'Up to 2 optional detail images',
			of: [{ type: 'image', options: { hotspot: true } }],
			validation: (rule) => rule.max(2)
		})
	],
	preview: {
		select: { title: 'title.en', subtitle: 'year' }
	}
});
