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
			name: 'fullname',
			title: 'Full Name',
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
			name: 'portrait',
			title: 'Portrait',
			type: 'image',
			options: { hotspot: true }
		}),
		defineField({
			name: 'profession',
			title: 'Profession / Role',
			type: 'object',
			fields: [
				{ name: 'en', type: 'string', title: 'English' },
				{ name: 'de', type: 'string', title: 'Deutsch' }
			]
		}),
		defineField({
			name: 'currently',
			title: 'Currently (Now section)',
			type: 'object',
			fields: [
				{ name: 'en', type: 'text', title: 'English', rows: 3 },
				{ name: 'de', type: 'text', title: 'Deutsch', rows: 3 }
			]
		}),
		defineField({
			name: 'tools',
			title: 'Tools',
			type: 'array',
			of: [{ type: 'string' }]
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
