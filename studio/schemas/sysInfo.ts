import { defineType, defineField } from 'sanity';

export const sysInfo = defineType({
	name: 'sysInfo',
	title: 'System Info',
	type: 'document',
	fields: [
		defineField({
			name: 'user',
			title: 'Username',
			type: 'string'
		}),
		defineField({
			name: 'hostname',
			title: 'Hostname',
			type: 'string'
		}),
		defineField({
			name: 'build',
			title: 'Build Name',
			type: 'string'
		}),
		defineField({
			name: 'shell',
			title: 'Shell',
			type: 'string'
		}),
		defineField({
			name: 'email',
			title: 'Email',
			type: 'string'
		}),
		defineField({
			name: 'location',
			title: 'Location',
			type: 'string'
		}),
		defineField({
			name: 'available_for',
			title: 'Available for',
			type: 'object',
			fields: [
				{ name: 'en', type: 'string', title: 'English' },
				{ name: 'de', type: 'string', title: 'Deutsch' }
			]
		}),
		defineField({
			name: 'bio',
			title: 'Bio',
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
		}),
		defineField({
			name: 'stack',
			title: 'Tech Stack',
			type: 'array',
			of: [{ type: 'string' }]
		})
	],
	preview: {
		select: { title: 'hostname', subtitle: 'user' }
	}
});
