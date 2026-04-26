import { defineType, defineField } from 'sanity';

export const photo = defineType({
	name: 'photo',
	title: 'Photo',
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
			name: 'image',
			title: 'Image',
			type: 'image',
			options: { hotspot: true }
		}),
		defineField({
			name: 'date',
			title: 'Date',
			type: 'date'
		}),
		defineField({
			name: 'series',
			title: 'Series',
			type: 'reference',
			to: [{ type: 'photoSeries' }]
		}),
		defineField({
			name: 'camera',
			title: 'Camera',
			type: 'string'
		}),
		defineField({
			name: 'lens',
			title: 'Lens',
			type: 'string'
		}),
		defineField({
			name: 'iso',
			title: 'ISO',
			type: 'number'
		}),
		defineField({
			name: 'shutter',
			title: 'Shutter Speed',
			type: 'string'
		}),
		defineField({
			name: 'aperture',
			title: 'Aperture',
			type: 'string'
		}),
		defineField({
			name: 'tags',
			title: 'Tags',
			type: 'array',
			of: [{ type: 'string' }]
		})
	],
	preview: {
		select: { title: 'title.en', media: 'image', subtitle: 'date' }
	}
});
