import type { SanityImageSource } from '@sanity/image-url';
export type { SanityImageSource };

export type LocaleString = { en?: string; de?: string };
export type LocaleText = { en?: string; de?: string };
export type LocaleBlocks = { en?: unknown[]; de?: unknown[] };

export interface SanitySlug {
	current: string;
}

export interface SanityImage {
	asset: { _ref: string; _type: 'reference' };
	hotspot?: { x: number; y: number; width: number; height: number };
}

export interface ProjectLink {
	label: string;
	url: string;
}

export interface Project {
	_id: string;
	title: LocaleString;
	slug: SanitySlug;
	year: number;
	type: 'client' | 'personal';
	openSource?: boolean;
	client?: string;
	context?: LocaleString;
	role?: LocaleString;
	stack?: string[];
	summary?: LocaleString;
	tags?: string[];
	links?: ProjectLink[];
	cover?: SanityImageSource;
	images?: SanityImageSource[];
}

export interface Writing {
	_id: string;
	title: LocaleString;
	slug: SanitySlug;
	category: 'flash-fiction' | 'poem' | 'essay' | 'note';
	date: string;
	tags?: string[];
	excerpt?: LocaleText;
	body?: LocaleBlocks;
}

export interface PressLink {
	_id: string;
	title: string;
	url: string;
	date?: string;
	note?: string;
}

export interface Publication {
	_id: string;
	name: string;
	slug: SanitySlug;
	url?: string;
	logo?: SanityImageSource;
	description?: LocaleText;
	period?: { from?: number; to?: number };
	category?: 'tech' | 'culture' | 'music' | 'lifestyle';
	links: PressLink[];
}

export interface TrackItem {
	_key: string;
	title: string;
	artist?: string;
	audioFile?: { asset: { _ref: string; _type: 'reference' } };
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	year?: number;
	type?: 'single' | 'ep' | 'album';
	slug?: SanitySlug;
	cover?: SanityImageSource;
	description?: LocaleText;
	spotifyUrl?: string;
	appleMusicUrl?: string;
	youtubeMusicUrl?: string;
	tracks?: TrackItem[];
}

export interface SeriesRef {
	_id: string;
	title: LocaleString;
}

export interface PhotoImage {
	asset: { _ref: string; _type: 'reference' };
	hotspot?: { x: number; y: number; width: number; height: number };
	width?: number;
	height?: number;
}

export interface Photo {
	_id: string;
	title?: LocaleString;
	image?: PhotoImage;
	date?: string;
	series?: SeriesRef;
	camera?: string;
	lens?: string;
	iso?: number;
	shutter?: string;
	aperture?: string;
}

export interface PhotoSeries {
	_id: string;
	title: LocaleString;
	slug: SanitySlug;
	date?: string;
	description?: LocaleText;
	photoCount: number;
}

export interface SysInfo {
	user?: string;
	fullname?: string;
	hostname?: string;
	build?: string;
	shell?: string;
	email?: string;
	location?: string;
	available_for?: LocaleString;
	bio?: LocaleBlocks;
	portrait?: SanityImage;
	profession?: LocaleString;
	currently?: LocaleString;
	tools?: string[];
	stack?: string[];
}
