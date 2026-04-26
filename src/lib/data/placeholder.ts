export type LocaleString = { en: string; de: string };
export type LocaleStringArray = { en: string[]; de: string[] };

export interface Project {
	id: string;
	year: number;
	type: 'client' | 'personal';
	client: string;
	role: LocaleString;
	stack: string[];
	title: LocaleString;
	summary: LocaleString;
	tags: string[];
	links: string[];
}

export interface Essay {
	id: string;
	date: string;
	minutes: number;
	tags: string[];
	title: LocaleString;
	excerpt: LocaleString;
	body: LocaleStringArray;
}

export interface Track {
	id: string;
	title: string;
	artist: string;
	album: string;
	year: number;
	length: string;
	bpm: number;
}

export interface Album {
	id: string;
	title: string;
	artist: string;
	year: number;
	tracks: number;
}

export interface Photo {
	id: string;
	title: LocaleString;
	date: string;
	iso: number;
	shutter: string;
	aperture: string;
	lens: string;
	camera: string;
	tags: string[];
}

export interface SysData {
	user: string;
	hostname: string;
	build: string;
	uptime: string;
	shell: string;
	email: string;
	location: string;
	city_de: string;
	city_en: string;
	available_for: LocaleString;
}

export const PROJECTS: Project[] = [
	{
		id: 'atlas-cartography',
		year: 2025,
		type: 'client',
		client: 'Helvetia Cartographic Society',
		role: { en: 'Lead designer & developer', de: 'Lead-Designer & Entwickler' },
		stack: ['Svelte', 'MapLibre', 'PostGIS', 'TypeScript'],
		title: { en: 'Atlas - Cartographic Reader', de: 'Atlas - Kartografischer Reader' },
		summary: {
			en: 'An offline-capable reading interface for historical map atlases. Built around a custom tile pipeline and a typographic system tuned for cartographic detail.',
			de: 'Eine offline-fähige Leseoberfläche für historische Kartenatlanten. Eigene Tile-Pipeline und ein typografisches System, das auf kartografische Details abgestimmt ist.'
		},
		tags: ['cartography', 'reader', 'typography', 'offline-first'],
		links: ['atlas.helvetia-cs.org', 'github/mschubert/atlas-reader']
	},
	{
		id: 'fernschreiber',
		year: 2024,
		type: 'personal',
		client: 'Self-initiated',
		role: { en: 'Concept, design, code', de: 'Konzept, Design, Code' },
		stack: ['Rust', 'WebSocket', 'WebAudio', 'Canvas'],
		title: { en: 'Fernschreiber', de: 'Fernschreiber' },
		summary: {
			en: 'A real-time teletype emulator for distributed creative writing sessions. Each keystroke is broadcast across peers; the page sounds like a 1962 newsroom.',
			de: 'Ein Echtzeit-Fernschreiber-Emulator für verteilte kreative Schreibsitzungen. Jeder Tastendruck wird an Peers übertragen; die Seite klingt wie eine Redaktion von 1962.'
		},
		tags: ['real-time', 'audio', 'typewriter', 'experiment'],
		links: ['fernschreiber.app']
	},
	{
		id: 'polylux-archive',
		year: 2024,
		type: 'client',
		client: 'Polylux Editions',
		role: { en: 'Design system & frontend', de: 'Designsystem & Frontend' },
		stack: ['Astro', 'MDX', 'PocketBase'],
		title: { en: 'Polylux - Editorial Archive', de: 'Polylux - Redaktionelles Archiv' },
		summary: {
			en: 'A long-form publication archive with a paper-first reading mode, hand-tuned vertical rhythm, and a marginalia system for editor\'s notes.',
			de: 'Ein Archiv für Langform-Publikationen mit papierbasiertem Lesemodus, handabgestimmtem vertikalem Rhythmus und Marginaliensystem für Lektorenanmerkungen.'
		},
		tags: ['editorial', 'typography', 'archive'],
		links: ['polylux.press']
	},
	{
		id: 'bureau-os',
		year: 2023,
		type: 'personal',
		client: 'Self-initiated',
		role: { en: 'Everything', de: 'Alles' },
		stack: ['TypeScript', 'Three.js', 'Tone.js'],
		title: { en: 'Bureau', de: 'Bureau' },
		summary: {
			en: 'A small modular desktop environment in the browser. Drag-and-drop programs, file system in IndexedDB, deterministic synth across sessions.',
			de: 'Eine kleine modulare Desktop-Umgebung im Browser. Drag-and-Drop-Programme, Dateisystem in IndexedDB, deterministischer Synth über Sitzungen hinweg.'
		},
		tags: ['os', 'experiment', 'audio'],
		links: ['bureau.dev']
	},
	{
		id: 'kontur',
		year: 2023,
		type: 'client',
		client: 'Studio Kontur',
		role: { en: 'Brand site & motion', de: 'Markenwebsite & Motion' },
		stack: ['Next.js', 'Sanity', 'GSAP'],
		title: { en: 'Kontur - Studio Site', de: 'Kontur - Studio-Website' },
		summary: {
			en: 'A precise, near-monochromatic studio site with deliberate motion: type that settles into place, images that load with grain.',
			de: 'Eine präzise, fast monochromatische Studio-Website mit gezielter Motion: Typografie, die einrastet, Bilder, die mit Korn laden.'
		},
		tags: ['brand', 'motion', 'studio'],
		links: ['studio-kontur.de']
	},
	{
		id: 'telephon',
		year: 2022,
		type: 'personal',
		client: 'Open source',
		role: { en: 'Maintainer', de: 'Maintainer' },
		stack: ['Go', 'WebRTC', 'Vue'],
		title: { en: 'Telephon', de: 'Telephon' },
		summary: {
			en: 'A minimal mesh voice tool for small distributed teams. No accounts, no servers beyond signaling, no analytics. Goes well with a quiet office.',
			de: 'Ein minimales Mesh-Voice-Tool für kleine verteilte Teams. Keine Konten, keine Server außer Signaling, keine Analytik. Passt gut in ein ruhiges Büro.'
		},
		tags: ['webrtc', 'tooling', 'open source'],
		links: ['telephon.gg', 'github/mschubert/telephon']
	},
	{
		id: 'gravur',
		year: 2022,
		type: 'client',
		client: 'Gravur Verlag',
		role: { en: 'Reader app & typography', de: 'Reader-App & Typografie' },
		stack: ['SwiftUI', 'Combine'],
		title: { en: 'Gravur Reader', de: 'Gravur Reader' },
		summary: {
			en: 'A reading app for a small literary press. Reading positions sync across devices; footnotes expand inline without breaking the page rhythm.',
			de: 'Eine Lese-App für einen kleinen Literaturverlag. Lesepositionen synchronisieren geräteübergreifend; Fußnoten erweitern sich inline, ohne den Seitenrhythmus zu brechen.'
		},
		tags: ['reader', 'ios', 'typography'],
		links: ['gravur.app/reader']
	},
	{
		id: 'saiten',
		year: 2021,
		type: 'personal',
		client: 'Self-initiated',
		role: { en: 'Concept & code', de: 'Konzept & Code' },
		stack: ['WebAudio', 'WebMIDI', 'Tone.js'],
		title: { en: 'Saiten', de: 'Saiten' },
		summary: {
			en: 'A six-string browser instrument tuned for slow practice. Visualizes intonation drift over the last sixty seconds.',
			de: 'Ein sechssaitiges Browser-Instrument für langsames Üben. Visualisiert Intonationsabweichungen über die letzten sechzig Sekunden.'
		},
		tags: ['music', 'audio', 'tool'],
		links: ['saiten.studio']
	}
];

export const ESSAYS: Essay[] = [
	{
		id: 'against-the-feed',
		date: '2025-09-12',
		minutes: 11,
		tags: ['essay', 'media'],
		title: { en: 'Against the Feed', de: 'Gegen den Feed' },
		excerpt: {
			en: 'The feed is not a place. It is a conveyor that asks you to accept that everything you see is the same kind of thing. I want to argue, briefly, that this is a category error - and that the cost of the error is the loss of attention as a textured, deliberate act.',
			de: 'Der Feed ist kein Ort. Er ist ein Förderband, das verlangt, alles als dasselbe zu akzeptieren. Ich möchte kurz argumentieren, dass dies ein Kategorienfehler ist - und dass die Kosten der Verlust von Aufmerksamkeit als strukturiertem, bewusstem Akt sind.'
		},
		body: {
			en: [
				'The feed is not a place. It is a conveyor that asks you to accept that everything you see is the same kind of thing - a wedding, an obituary, a recipe, a war crime, a joke at the expense of someone you went to school with.',
				'I want to argue, briefly, that this is a category error. The cost of the error is the loss of attention as a textured, deliberate act. We say we cannot focus and we mean we cannot bear what focus would reveal: that we have been paying attention to nothing for a long time.',
				'The remedy I am after is not abstinence. It is craft. A library has shelves. A newspaper has sections. A radio station has a program. The forms inherited from the twentieth century are not nostalgia - they are scaffolding for a kind of attention that survives more than ninety seconds.'
			],
			de: [
				'Der Feed ist kein Ort. Er ist ein Förderband, das verlangt, alles als dasselbe zu akzeptieren - eine Hochzeit, einen Nachruf, ein Rezept, ein Kriegsverbrechen, einen Witz auf Kosten von jemandem aus der Schulzeit.',
				'Ich möchte kurz argumentieren, dass dies ein Kategorienfehler ist. Die Kosten des Fehlers sind der Verlust von Aufmerksamkeit als strukturiertem, bewusstem Akt. Wir sagen, wir können uns nicht konzentrieren, und meinen, wir ertragen nicht, was Konzentration zeigen würde.',
				'Das Heilmittel, das ich suche, ist keine Abstinenz. Es ist Handwerk. Eine Bibliothek hat Regale. Eine Zeitung hat Ressorts. Ein Radiosender hat ein Programm. Die Formen, die uns das zwanzigste Jahrhundert hinterlassen hat, sind keine Nostalgie - sie sind Gerüste für eine Aufmerksamkeit, die länger als neunzig Sekunden überlebt.'
			]
		}
	},
	{
		id: 'small-software',
		date: '2025-06-04',
		minutes: 7,
		tags: ['essay', 'software'],
		title: { en: 'On Small Software', de: 'Über kleine Software' },
		excerpt: {
			en: 'I keep returning to programs that fit in a single human\'s head. They have an end. They feel like they were finished by someone who decided when they were finished, rather than abandoned by a team that was reorganized.',
			de: 'Ich kehre immer wieder zu Programmen zurück, die in den Kopf eines einzelnen Menschen passen. Sie haben ein Ende. Sie wirken fertig - beendet von jemandem, der entschied, wann sie fertig waren, statt verlassen von einem Team, das umstrukturiert wurde.'
		},
		body: {
			en: [
				"I keep returning to programs that fit in a single human's head. They have an end. They feel like they were finished by someone who decided when they were finished, rather than abandoned by a team that was reorganized.",
				'There is a particular pleasure in software that knows what it is. A note-taker that does not aspire to be a calendar. A music player that does not lecture you about an algorithm. The pleasure is the absence of being sold to.',
				'If we want this software to exist we will largely have to make it ourselves. That is, I think, a fine thing to spend a Saturday on.'
			],
			de: [
				'Ich kehre immer wieder zu Programmen zurück, die in den Kopf eines einzelnen Menschen passen. Sie haben ein Ende.',
				'Es liegt ein eigenes Vergnügen in Software, die weiß, was sie ist. Ein Notizwerkzeug, das nicht auch Kalender sein will. Ein Musikplayer, der einem keinen Algorithmus erklärt.',
				'Wenn wir wollen, dass solche Software existiert, müssen wir sie wohl selbst bauen. Das ist, finde ich, ein guter Zeitvertreib für einen Samstag.'
			]
		}
	},
	{
		id: 'atlas-notes',
		date: '2025-02-18',
		minutes: 9,
		tags: ['case study', 'atlas'],
		title: { en: 'Notes on the Atlas Reader', de: 'Notizen zum Atlas-Reader' },
		excerpt: {
			en: 'A short field report from eighteen months building a reading interface for historical maps. What we kept, what we threw away, and the day the cartographer told us our serif had no business in a margin.',
			de: 'Ein kurzer Feldbericht aus achtzehn Monaten Arbeit an einer Leseoberfläche für historische Karten. Was wir behielten, was wir verwarfen, und der Tag, an dem die Kartografin uns sagte, dass unsere Serife in einer Marginalie nichts zu suchen habe.'
		},
		body: {
			en: [
				'A short field report from eighteen months building a reading interface for historical maps. What we kept, what we threw away, and the day the cartographer told us our serif had no business in a margin.',
				'The first principle we settled on: the map is the document. Everything around it is annotation. This is harder to enforce than it sounds. Designers want to interpret. Cartographers want to defer.',
				"The second principle: the reader's hand is a tool. Pinch, pan, the small inertia of an old paper map. We spent two months on the inertia curve. It is still the thing I am most proud of in the project."
			],
			de: [
				'Ein kurzer Feldbericht aus achtzehn Monaten Arbeit an einer Leseoberfläche für historische Karten.',
				'Erstes Prinzip: Die Karte ist das Dokument. Alles drum herum ist Annotation. Schwerer durchzuhalten als es klingt - Designer wollen interpretieren, Kartografen wollen sich zurückhalten.',
				'Zweites Prinzip: Die Hand der Lesenden ist ein Werkzeug. Pinch, Pan, die kleine Trägheit einer alten Papierkarte. Wir haben zwei Monate an der Trägheitskurve gearbeitet. Sie ist noch immer das, worauf ich am meisten stolz bin.'
			]
		}
	},
	{
		id: 'long-form-tools',
		date: '2024-11-30',
		minutes: 6,
		tags: ['tools', 'writing'],
		title: { en: 'Tools for Long-Form Work', de: 'Werkzeuge für Langform-Arbeit' },
		excerpt: {
			en: 'An inventory of the small, durable tools I keep returning to: a paper notebook, a hand-rolled wiki, a single text file, and a kitchen timer that runs longer than any tab can.',
			de: 'Eine Inventur der kleinen, beständigen Werkzeuge, zu denen ich immer wieder zurückkehre: ein Papiernotizbuch, ein selbstgeschriebenes Wiki, eine einzelne Textdatei und ein Küchentimer, der länger läuft als jeder Tab.'
		},
		body: {
			en: [
				'An inventory of the small, durable tools I keep returning to: a paper notebook, a hand-rolled wiki, a single text file, and a kitchen timer that runs longer than any tab can.'
			],
			de: ['Eine Inventur der kleinen, beständigen Werkzeuge, zu denen ich immer wieder zurückkehre.']
		}
	}
];

export const TRACKS: Track[] = [
	{ id: 't1', title: 'Voigtländer (Edit)', artist: 'Hans Bohrmann', album: 'Stillstand', year: 1979, length: '5:42', bpm: 86 },
	{ id: 't2', title: 'Schwarzes Glas', artist: 'Asmus Tietchens', album: 'Notturno', year: 1983, length: '7:18', bpm: 72 },
	{ id: 't3', title: 'Lichtspiel No. 4', artist: 'Conrad Schnitzler', album: 'Gelb', year: 1974, length: '6:04', bpm: 94 },
	{ id: 't4', title: 'Holzfaser', artist: 'Cluster', album: 'II', year: 1972, length: '9:55', bpm: 64 },
	{ id: 't5', title: 'Niederrhein', artist: 'Harmonia', album: 'Deluxe', year: 1975, length: '4:31', bpm: 110 },
	{ id: 't6', title: 'Pendel', artist: 'Roedelius', album: 'Selbstportrait', year: 1979, length: '8:12', bpm: 58 },
	{ id: 't7', title: 'Sieben', artist: 'Popol Vuh', album: 'Hosianna Mantra', year: 1972, length: '6:33', bpm: 80 },
	{ id: 't8', title: 'Tageslicht', artist: 'Eberhard Schoener', album: 'Meditation', year: 1974, length: '11:08', bpm: 68 },
	{ id: 't9', title: 'Wegwarte', artist: 'Holger Czukay', album: 'Movies', year: 1979, length: '5:21', bpm: 102 },
	{ id: 't10', title: 'Klavierwerke (Auszug)', artist: 'Wolfgang Voigt', album: 'Königsforst', year: 1999, length: '12:40', bpm: 122 }
];

export const ALBUMS: Album[] = [
	{ id: 'stillstand', title: 'Stillstand', artist: 'Hans Bohrmann', year: 1979, tracks: 8 },
	{ id: 'notturno', title: 'Notturno', artist: 'Asmus Tietchens', year: 1983, tracks: 9 },
	{ id: 'gelb', title: 'Gelb', artist: 'Conrad Schnitzler', year: 1974, tracks: 6 },
	{ id: 'deluxe', title: 'Deluxe', artist: 'Harmonia', year: 1975, tracks: 5 }
];

export const PHOTOS: Photo[] = [
	{ id: 'p1', title: { en: 'Strandpromenade, Sylt', de: 'Strandpromenade, Sylt' }, date: '2024-08-14', iso: 200, shutter: '1/250', aperture: 'f/8', lens: '35mm', camera: 'Leica Q2 Mono', tags: ['sea', 'north'] },
	{ id: 'p2', title: { en: 'Ruhrgebiet, Morning', de: 'Ruhrgebiet, Morgens' }, date: '2024-04-02', iso: 400, shutter: '1/60', aperture: 'f/4', lens: '35mm', camera: 'Leica Q2 Mono', tags: ['urban', 'industrial'] },
	{ id: 'p3', title: { en: 'Atelier, Cologne', de: 'Atelier, Köln' }, date: '2024-01-19', iso: 800, shutter: '1/30', aperture: 'f/2', lens: '35mm', camera: 'Leica Q2 Mono', tags: ['interior', 'studio'] },
	{ id: 'p4', title: { en: 'Forest, Eifel', de: 'Wald, Eifel' }, date: '2023-11-04', iso: 200, shutter: '1/125', aperture: 'f/5.6', lens: '50mm', camera: 'Pentax 67', tags: ['forest', 'film'] },
	{ id: 'p5', title: { en: 'Underpass, Düsseldorf', de: 'Unterführung, Düsseldorf' }, date: '2023-09-22', iso: 1600, shutter: '1/15', aperture: 'f/2.8', lens: '28mm', camera: 'Ricoh GR III', tags: ['urban', 'night'] },
	{ id: 'p6', title: { en: 'Window, Lisbon', de: 'Fenster, Lissabon' }, date: '2023-06-08', iso: 200, shutter: '1/500', aperture: 'f/8', lens: '35mm', camera: 'Leica Q2 Mono', tags: ['travel', 'architecture'] },
	{ id: 'p7', title: { en: 'Allotment, Saxony', de: 'Schrebergarten, Sachsen' }, date: '2022-07-30', iso: 400, shutter: '1/250', aperture: 'f/4', lens: '50mm', camera: 'Pentax 67', tags: ['garden', 'film'] },
	{ id: 'p8', title: { en: 'Long Hall', de: 'Langer Flur' }, date: '2022-05-11', iso: 800, shutter: '1/60', aperture: 'f/2.8', lens: '28mm', camera: 'Ricoh GR III', tags: ['interior'] },
	{ id: 'p9', title: { en: 'Snow, Erzgebirge', de: 'Schnee, Erzgebirge' }, date: '2022-02-14', iso: 200, shutter: '1/500', aperture: 'f/5.6', lens: '35mm', camera: 'Leica Q2 Mono', tags: ['winter', 'landscape'] }
];

export const SYS: SysData = {
	user: 'mirko',
	hostname: 'msos',
	build: '11.4 "Charcoal"',
	uptime: '14d 06:22',
	shell: 'msh 0.9.2',
	email: 'studio@mirkoschubert.de',
	location: 'Koeln - Cologne',
	city_de: 'Köln',
	city_en: 'Cologne',
	available_for: { en: 'Selected commissions, Q3 2026', de: 'Ausgewählte Aufträge, Q3 2026' }
};

export function pickL(lang: 'en' | 'de', val: LocaleString | string): string {
	if (typeof val === 'string') return val;
	return val[lang] ?? val.en ?? '';
}
