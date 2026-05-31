import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host') ?? '';
	event.locals.lang = /\.de(:\d+)?$/i.test(host) ? 'de' : 'en';
	return resolve(event);
};
