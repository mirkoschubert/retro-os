import type { PageServerLoad } from './$types';
import { client } from '$lib/sanity/client';
import {
	projectsQuery,
	writingsQuery,
	publicationsQuery,
	albumsQuery,
	photosQuery,
	photoSeriesQuery,
	sysInfoQuery
} from '$lib/sanity/queries';
import type {
	Project,
	Writing,
	Publication,
	Album,
	Photo,
	PhotoSeries,
	SysInfo
} from '$lib/sanity/types';

export const load: PageServerLoad = async () => {
	try {
		const [projects, writings, publications, albums, photos, photoSeries, sysInfo] =
			await Promise.all([
				client.fetch<Project[]>(projectsQuery),
				client.fetch<Writing[]>(writingsQuery),
				client.fetch<Publication[]>(publicationsQuery),
				client.fetch<Album[]>(albumsQuery),
				client.fetch<Photo[]>(photosQuery),
				client.fetch<PhotoSeries[]>(photoSeriesQuery),
				client.fetch<SysInfo>(sysInfoQuery)
			]);

		return { projects, writings, publications, albums, photos, photoSeries, sysInfo };
	} catch {
		return {
			projects: [] as Project[],
			writings: [] as Writing[],
			publications: [] as Publication[],
			albums: [] as Album[],
			photos: [] as Photo[],
			photoSeries: [] as PhotoSeries[],
			sysInfo: null as SysInfo | null
		};
	}
};
