import { defineType, defineField, defineArrayMember } from 'sanity';

export const album = defineType({
	name: 'album',
	title: 'Album',
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
			name: 'year',
			title: 'Year',
			type: 'number'
		}),
		defineField({
			name: 'type',
			title: 'Album Type',
			type: 'string',
			options: {
				list: [
					{ title: 'Single', value: 'single' },
					{ title: 'EP', value: 'ep' },
					{ title: 'Album', value: 'album' }
				]
			}
		}),
		defineField({
			name: 'cover',
			title: 'Cover',
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
			name: 'spotifyUrl',
			title: 'Spotify URL',
			type: 'url'
		}),
		defineField({
			name: 'appleMusicUrl',
			title: 'Apple Music URL',
			type: 'url'
		}),
		defineField({
			name: 'youtubeMusicUrl',
			title: 'YouTube Music URL',
			type: 'url'
		}),
		defineField({
			name: 'tracks',
			title: 'Tracks',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'track',
					title: 'Track',
					fields: [
						defineField({ name: 'title', title: 'Title', type: 'string' }),
						defineField({ name: 'artist', title: 'Artist', type: 'string' }),
						defineField({
							name: 'audioFile',
							title: 'Audio File',
							type: 'file',
							options: { accept: 'audio/*' }
						})
					],
					preview: {
						select: { title: 'title', subtitle: 'artist' }
					}
				})
			]
		})
	],
	preview: {
		select: { title: 'title', subtitle: 'artist' }
	}
});
