/**
 * Seed script - populates Sanity with real content from mirkoschubert.de
 * Run: pnpm tsx scripts/seed.ts
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
	try {
		const lines = readFileSync(resolve(process.cwd(), '.env'), 'utf-8').split('\n');
		for (const line of lines) {
			const match = line.match(/^([^#=]+)=(.*)$/);
			if (match) process.env[match[1].trim()] = match[2].trim();
		}
	} catch {
		// rely on externally set env vars
	}
}
loadEnv();

const client = createClient({
	projectId: process.env.PUBLIC_SANITY_PROJECT_ID ?? '',
	dataset: process.env.PUBLIC_SANITY_DATASET ?? 'production',
	apiVersion: '2024-01-01',
	token: process.env.SANITY_API_TOKEN,
	useCdn: false
});

function inferLinkLabel(url: string): string {
	try {
		const h = new URL(url).hostname.replace(/^www\./, '');
		if (h.includes('github.com')) return 'GitHub';
		if (h.includes('npmjs.com')) return 'npm';
		if (h.includes('web.archive.org')) return 'Web Archive';
		return 'Website';
	} catch {
		if (url.includes('web.archive.org')) return 'Web Archive';
		if (url.includes('github.com')) return 'GitHub';
		if (url.includes('npmjs.com')) return 'npm';
		return 'Website';
	}
}

function randomKey() {
	return Math.random().toString(36).slice(2, 10);
}

function toLink(url: string, label?: string) {
	return { _key: randomKey(), label: label ?? inferLinkLabel(url), url };
}

function block(key: string, text: string) {
	return {
		_type: 'block',
		_key: key,
		style: 'normal',
		markDefs: [],
		children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }]
	};
}

async function wipe(type: string) {
	const ids = await client.fetch<string[]>(`*[_type == $type]._id`, { type });
	if (ids.length === 0) return;
	const tx = client.transaction();
	for (const id of ids) tx.delete(id);
	await tx.commit();
	console.log(`  gelöscht: ${ids.length} x ${type}`);
}

async function seed() {
	console.log('Sanity wird befüllt...\n');

	// ------------------------------------------------------------------ //
	// Publikationen & Press-Links
	// ------------------------------------------------------------------ //
	console.log('Publikationen...');
	await wipe('pressLink');
	await wipe('publication');

	const publications = [
		{
			_type: 'publication',
			_id: 'pub-netzwelt',
			name: 'Netzwelt',
			slug: { _type: 'slug', current: 'netzwelt' },
			url: 'https://www.netzwelt.de',
			description: {
				en: 'German IT and consumer electronics magazine.',
				de: 'Deutsches IT- und Consumer-Electronics-Magazin.'
			},
			period: { from: 2009, to: 2018 },
			category: 'tech'
		},
		{
			_type: 'publication',
			_id: 'pub-teltarif',
			name: 'teltarif.de',
			slug: { _type: 'slug', current: 'teltarif' },
			url: 'https://www.teltarif.de',
			description: {
				en: 'German telecommunications news and tariff portal.',
				de: 'Deutsches Telekommunikations-Nachrichtenportal.'
			},
			period: { from: 2011, to: 2013 },
			category: 'tech'
		},
		{
			_type: 'publication',
			_id: 'pub-4phones',
			name: '4phones.de',
			slug: { _type: 'slug', current: '4phones' },
			url: 'https://www.4phones.de',
			description: {
				en: 'Mobile phone news and reviews.',
				de: 'Mobiltelefon-News und Tests.'
			},
			period: { from: 2011, to: 2014 },
			category: 'tech'
		},
		{
			_type: 'publication',
			_id: 'pub-phonostar',
			name: 'phonostar.de',
			slug: { _type: 'slug', current: 'phonostar' },
			url: 'https://www.phonostar.de',
			description: {
				en: 'Online radio portal.',
				de: 'Online-Radioportal.'
			},
			period: { from: 2010, to: 2011 },
			category: 'culture'
		},
		{
			_type: 'publication',
			_id: 'pub-sinn-und-verstand',
			name: 'sinn-und-verstand.net',
			slug: { _type: 'slug', current: 'sinn-und-verstand' },
			url: 'https://www.sinn-und-verstand.net',
			description: {
				en: 'Culture and society magazine.',
				de: 'Kultur- und Gesellschaftsmagazin.'
			},
			period: { from: 2012, to: 2014 },
			category: 'culture'
		},
		{
			_type: 'publication',
			_id: 'pub-techfacts',
			name: 'techfacts.de',
			slug: { _type: 'slug', current: 'techfacts' },
			url: 'https://www.techfacts.de',
			description: {
				en: 'Tech news portal.',
				de: 'Tech-Nachrichtenportal.'
			},
			period: { from: 2010, to: 2011 },
			category: 'tech'
		},
		{
			_type: 'publication',
			_id: 'pub-mendetta',
			name: 'mendetta.com',
			slug: { _type: 'slug', current: 'mendetta' },
			url: 'https://www.mendetta.com',
			description: {
				en: 'Online magazine.',
				de: 'Online-Magazin.'
			},
			period: { from: 2010, to: 2011 },
			category: 'culture'
		},
		{
			_type: 'publication',
			_id: 'pub-apfelwahn',
			name: 'Apfelwahn.de',
			slug: { _type: 'slug', current: 'apfelwahn' },
			url: 'https://www.apfelwahn.de',
			description: {
				en: 'Apple-focused tech blog.',
				de: 'Apple-fokussierter Tech-Blog.'
			},
			period: { from: 2011, to: 2012 },
			category: 'tech'
		},
		{
			_type: 'publication',
			_id: 'pub-7mobile',
			name: '7mobile-blog.de',
			slug: { _type: 'slug', current: '7mobile-blog' },
			url: 'https://www.7mobile-blog.de',
			description: {
				en: 'Mobile phone blog.',
				de: 'Mobiltelefon-Blog.'
			},
			period: { from: 2011, to: 2012 },
			category: 'tech'
		}
	];

	for (const pub of publications) {
		await client.createOrReplace(pub);
	}
	console.log(`  angelegt: ${publications.length} Publikationen`);

	const pressLinks = [
		{
			_type: 'pressLink',
			title: 'Routenplaner für das Fahrrad: Naviki im Test',
			url: 'https://www.netzwelt.de/news/naviki',
			date: '2018-03-10',
			publication: { _type: 'reference', _ref: 'pub-netzwelt' }
		},
		{
			_type: 'pressLink',
			title: 'Sony Reader PRS-300 im Test',
			url: 'https://www.netzwelt.de/news/sony-reader',
			date: '2016-02-10',
			publication: { _type: 'reference', _ref: 'pub-netzwelt' }
		},
		{
			_type: 'pressLink',
			title: 'Anleitung: Audiobearbeitung mit Wavepad',
			url: 'https://www.netzwelt.de/news/wavepad',
			date: '2008-01-10',
			publication: { _type: 'reference', _ref: 'pub-netzwelt' }
		},
		{
			_type: 'pressLink',
			title: 'Microsoft: Windows Phone 8 vorgestellt',
			url: 'https://www.4phones.de/news/windows-phone-8',
			date: '2020-06-12',
			publication: { _type: 'reference', _ref: 'pub-4phones' }
		},
		{
			_type: 'pressLink',
			title: 'WWDC 2012: Apple stellt iOS vor',
			url: 'https://www.4phones.de/news/wwdc-2012',
			date: '2012-06-12',
			publication: { _type: 'reference', _ref: 'pub-4phones' }
		}
	];

	for (const link of pressLinks) {
		await client.create(link);
	}
	console.log(`  angelegt: ${pressLinks.length} Press-Links`);

	// ------------------------------------------------------------------ //
	// Projekte (Software + Webseiten)
	// ------------------------------------------------------------------ //
	console.log('\nProjekte...');
	await wipe('project');

	const projects: ({ _type: string; _id: string } & Record<string, unknown>)[] = [
		// Open Source (personal + openSource: true)
		{
			_type: 'project',
			_id: 'project-gdpr-cli',
			title: { en: 'gdpr-cli', de: 'gdpr-cli' },
			slug: { _type: 'slug', current: 'gdpr-cli' },
			year: 2018,
			type: 'personal',
			openSource: true,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Author & maintainer', de: 'Autor & Maintainer' },
			stack: ['Node.js', 'npm'],
			summary: {
				en: 'A command-line tool that scans websites for HTML, CSS, and JavaScript that may transmit personal data to third-party services like Google, Facebook, or WordPress. Built in response to the GDPR taking effect in 2018.',
				de: 'Ein Kommandozeilen-Tool, das Webseiten nach HTML-, CSS- und JavaScript-Code durchsucht, der personenbezogene Daten an Drittdienste wie Google, Facebook oder WordPress senden könnte. Entstanden anlässlich des DSGVO-Inkrafttretens 2018.'
			},
			tags: ['privacy', 'cli', 'open-source'],
			links: [
				toLink('https://github.com/mirkoschubert/gdpr-cli'),
				toLink('https://www.npmjs.com/package/gdpr-cli')
			]
		},
		{
			_type: 'project',
			_id: 'project-wunderground-cli',
			title: { en: 'wunderground-cli', de: 'wunderground-cli' },
			slug: { _type: 'slug', current: 'wunderground-cli' },
			year: 2017,
			type: 'personal',
			openSource: true,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Author', de: 'Autor' },
			stack: ['Node.js', 'npm'],
			summary: {
				en: 'A command-line weather tool with graphically formatted output, using data from wunderground.com. Accesses both private and public weather stations for high accuracy.',
				de: 'Ein Kommandozeilen-Wetterwerkzeug mit grafisch aufbereiteter Ausgabe auf Basis von Wunderground-Daten. Greift auf private und öffentliche Wetterstationen zu.'
			},
			tags: ['weather', 'cli', 'open-source'],
			links: [
				toLink('https://github.com/mirkoschubert/wunderground-cli'),
				toLink('https://www.npmjs.com/package/wunderground-cli')
			]
		},
		{
			_type: 'project',
			_id: 'project-minimal-contact-form',
			title: { en: 'Minimal Contact Form', de: 'Minimal Contact Form' },
			slug: { _type: 'slug', current: 'minimal-contact-form' },
			year: 2023,
			type: 'personal',
			openSource: true,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Author', de: 'Autor' },
			stack: ['WordPress', 'PHP'],
			summary: {
				en: 'A minimal WordPress contact form plugin without bloat, external dependencies, or tracking.',
				de: 'Ein minimales WordPress-Kontaktformular-Plugin ohne Bloat, externe Abhängigkeiten oder Tracking.'
			},
			tags: ['wordpress', 'plugin', 'open-source'],
			links: [toLink('https://github.com/mirkoschubert/minimal-contact-form')]
		},
		// Personal websites
		{
			_type: 'project',
			_id: 'project-mirkoschubert-com',
			title: { en: 'mirkoschubert.com', de: 'mirkoschubert.com' },
			slug: { _type: 'slug', current: 'mirkoschubert-com' },
			year: 2001,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'Personal website - running in various forms since 2001.',
				de: 'Persönliche Website - seit 2001 in verschiedenen Formen am Laufen.'
			},
			tags: ['personal', 'web'],
			links: [toLink('https://mirkoschubert.com')]
		},
		{
			_type: 'project',
			_id: 'project-mirkoschubert-de',
			title: { en: 'mirkoschubert.de', de: 'mirkoschubert.de' },
			slug: { _type: 'slug', current: 'mirkoschubert-de' },
			year: 2003,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'Personal portfolio site - the German counterpart to mirkoschubert.com, online since September 2003.',
				de: 'Persönliche Portfolio-Website - seit September 2003 online.'
			},
			tags: ['personal', 'web'],
			links: [toLink('https://mirkoschubert.de')]
		},
		{
			_type: 'project',
			_id: 'project-flussabwaerts',
			title: { en: 'flussabwaerts.de', de: 'flussabwaerts.de' },
			slug: { _type: 'slug', current: 'flussabwaerts' },
			year: 2004,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'Personal blog and writing project.',
				de: 'Persönlicher Blog und Schreibprojekt.'
			},
			tags: ['personal', 'blog', 'writing'],
			links: [toLink('https://flussabwaerts.de')]
		},
		{
			_type: 'project',
			_id: 'project-kalave',
			title: { en: 'kalave.de', de: 'kalave.de' },
			slug: { _type: 'slug', current: 'kalave' },
			year: 2003,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'Early creative web project.',
				de: 'Frühes kreatives Webprojekt.'
			},
			tags: ['personal', 'web'],
			links: [toLink('https://kalave.de')]
		},
		{
			_type: 'project',
			_id: 'project-engelsaugen-kalave',
			title: { en: 'engelsaugen.kalave.de', de: 'engelsaugen.kalave.de' },
			slug: { _type: 'slug', current: 'engelsaugen-kalave' },
			year: 2003,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A subdomain of kalave.de giving a friend a platform to publish her own poems and short stories.',
				de: 'Eine Unterseite von kalave.de, auf der eine Freundin eigene Gedichte und Kurzgeschichten veröffentlichen konnte.'
			},
			tags: ['personal', 'web', 'poetry'],
			links: [toLink('http://web.archive.org/web/20040614112247/http://engelsaugen.kalave.de:80/')]
		},
		{
			_type: 'project',
			_id: 'project-silenced-world-de',
			title: { en: 'silenced-world.de', de: 'silenced-world.de' },
			slug: { _type: 'slug', current: 'silenced-world-de' },
			year: 2008,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'Music project website for the Silenced World album.',
				de: 'Musik-Projektseite zum Album Silenced World.'
			},
			tags: ['music', 'web'],
			links: [toLink('https://silenced-world.de')]
		},
		{
			_type: 'project',
			_id: 'project-musiker-knowhow',
			title: { en: 'musiker-knowhow.de', de: 'musiker-knowhow.de' },
			slug: { _type: 'slug', current: 'musiker-knowhow' },
			year: 2008,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A website offering practical tips and guides on instruments and music theory for aspiring and professional musicians, without equipment reviews.',
				de: 'Eine Webseite mit praktischen Tipps und Anleitungen zu Instrumenten und Musiktheorie für angehende und professionelle Musiker, ohne Ausrüstungsrezensionen.'
			},
			tags: ['music', 'web', 'guide'],
			links: [toLink('http://www.musiker-knowhow.de')]
		},
		{
			_type: 'project',
			_id: 'project-lyrissimo',
			title: { en: 'lyrissimo.de', de: 'lyrissimo.de' },
			slug: { _type: 'slug', current: 'lyrissimo' },
			year: 2009,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A platform for poetry and short stories. A new home for years of poems and micro fiction, occasionally accompanied by readings.',
				de: 'Eine Plattform für Lyrik und Kurzgeschichten. Eine neue Heimat für jahrelang geschriebene Gedichte und Mikro-Prosa, gelegentlich mit Lesungen begleitet.'
			},
			tags: ['poetry', 'web', 'writing'],
			links: [toLink('https://web.archive.org/web/*/lyrissimo.de')]
		},
		{
			_type: 'project',
			_id: 'project-musiker-websites',
			title: { en: 'musiker-websites.de', de: 'musiker-websites.de' },
			slug: { _type: 'slug', current: 'musiker-websites' },
			year: 2009,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A short-lived home for web design services aimed at musicians.',
				de: 'Ein kurzzeitiges Zuhause für das Angebot als Webdesigner - mit Ausrichtung auf Musiker.'
			},
			tags: ['web', 'music', 'design'],
			links: [toLink('https://web.archive.org/web/20151001000000*/musiker-websites.de')]
		},
		// Client project
		{
			_type: 'project',
			_id: 'project-oldie-musictime',
			title: { en: 'oldie-musictime.de', de: 'oldie-musictime.de' },
			slug: { _type: 'slug', current: 'oldie-musictime' },
			year: 2009,
			type: 'client',
			openSource: false,
			client: 'Oldie Musictime',
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A client website for a musician from Cottbus who performs as a solo entertainer or duo in the surrounding area.',
				de: 'Ein Auftragswerk für einen Cottbuser Musiker, der als Alleinunterhalter oder manchmal auch zu zweit in der Umgebung spielt.'
			},
			tags: ['web', 'music', 'commission'],
			links: [toLink('http://www.oldie-musictime.de/')]
		},
		{
			_type: 'project',
			_id: 'project-linkwink',
			title: { en: 'linkwink.de', de: 'linkwink.de' },
			slug: { _type: 'slug', current: 'linkwink' },
			year: 2010,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A blog project presenting interesting and curious websites. Short-lived due to being fully occupied with work as a music teacher and journalist.',
				de: 'Ein Blog-Projekt, das interessante und kuriose Webseiten vorstellte. Kurze Lebensdauer, da der Gründer beruflich als Musikpädagoge und Journalist voll ausgelastet war.'
			},
			tags: ['web', 'blog', 'links'],
			links: [toLink('http://web.archive.org/web/*/http://www.linkwink.de')]
		},
		{
			_type: 'project',
			_id: 'project-mallorcamag',
			title: { en: 'mallorcamag.de', de: 'mallorcamag.de' },
			slug: { _type: 'slug', current: 'mallorcamag' },
			year: 2011,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A magazine to share a passion for Mallorca beyond the tourist hotspots. Discontinued after about a year as the tourism market proved too competitive.',
				de: 'Ein Magazin, um andere Mallorca-Begeisterte daran teilhaben zu lassen und die Insel abseits des Ballermann-Tourismus näher zu bringen. Nach etwa einem Jahr eingestellt.'
			},
			tags: ['web', 'travel', 'magazine'],
			links: [toLink('http://web.archive.org/web/20130423125131/http://www.mallorcamag.de/')]
		},
		{
			_type: 'project',
			_id: 'project-blog-idee',
			title: { en: 'blog-idee.de', de: 'blog-idee.de' },
			slug: { _type: 'slug', current: 'blog-idee' },
			year: 2011,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A website publishing guides on running a blog and ideas for possible blog topics.',
				de: 'Eine Webseite, auf der Anleitungen zum Führen eines Blogs sowie Ideen für mögliche Blogs veröffentlicht wurden.'
			},
			tags: ['web', 'blog', 'guide'],
			links: [toLink('http://web.archive.org/web/20110213042356/http://www.blog-idee.de:80/')]
		},
		{
			_type: 'project',
			_id: 'project-n3wz',
			title: { en: 'n3wz.de', de: 'n3wz.de' },
			slug: { _type: 'slug', current: 'n3wz' },
			year: 2011,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'An own tech blog started after entering journalism in IT and consumer electronics. Eventually abandoned to focus on client work.',
				de: 'Ein eigener Tech-Blog nach dem Einstieg als Journalist in den Ressorts IT & Consumer Electronics. Letztendlich aufgegeben, um sich auf Kundenarbeit zu konzentrieren.'
			},
			tags: ['web', 'blog', 'tech'],
			links: [toLink('https://web.archive.org/web/20131206140611/http://www.n3wz.de/')]
		},
		{
			_type: 'project',
			_id: 'project-minimalismus-tipps',
			title: { en: 'minimalismus-tipps.de', de: 'minimalismus-tipps.de' },
			slug: { _type: 'slug', current: 'minimalismus-tipps' },
			year: 2016,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A directory where beginners and advanced readers can look up links to numerous bloggers dealing with minimalism. Originally founded in June 2015 by Gabi Raeggel, taken over in July 2016.',
				de: 'Ein Verzeichnis, in dem Einsteiger wie Fortgeschrittene viele Links zu zahlreichen Bloggern nachschlagen können, die sich mit dem Thema Minimalismus beschäftigen. Ursprünglich im Juni 2015 von Gabi Räggel gegründet, im Juli 2016 übernommen.'
			},
			tags: ['web', 'minimalism', 'guide'],
			links: [toLink('https://minimalismus-tipps.de')]
		},
		{
			_type: 'project',
			_id: 'project-digitaler-minimalismus',
			title: { en: 'digitaler-minimalismus.de', de: 'digitaler-minimalismus.de' },
			slug: { _type: 'slug', current: 'digitaler-minimalismus' },
			year: 2015,
			type: 'personal',
			openSource: false,
			context: { en: 'Personal project', de: 'Eigeninitiative' },
			role: { en: 'Design & development', de: 'Design & Entwicklung' },
			stack: [],
			summary: {
				en: 'A niche blog on returning to what matters in the digital world, with sporadically published, well-researched articles. Originally built with WordPress, later moved to Medium.',
				de: 'Ein Nischen-Blog über die Besinnung auf das Wesentliche in der digitalen Welt mit sporadisch veröffentlichten, gut recherchierten Artikeln. Ursprünglich mit WordPress erstellt, später auf Medium umgezogen.'
			},
			tags: ['web', 'blog', 'minimalism', 'digital'],
			links: [toLink('https://digitaler-minimalismus.de')]
		}
	];

	for (const project of projects) {
		await client.createOrReplace(project);
	}
	console.log(`  angelegt: ${projects.length} Projekte`);

	// ------------------------------------------------------------------ //
	// Writings (Flash Fiction + Gedichte)
	// ------------------------------------------------------------------ //
	console.log('\nTexte...');
	await wipe('writing');

	const writings: ({ _id: string; _type: string } & Record<string, unknown>)[] = [
		// --- Flash Fiction ---
		{
			_type: 'writing',
			_id: 'writing-mitteilung-voyager-ii',
			title: { en: 'Message from Voyager II', de: 'Mitteilung der Voyager II' },
			slug: { _type: 'slug', current: 'mitteilung-der-voyager-ii' },
			category: 'flash-fiction',
			date: '2023-09-17',
			minutes: 4,
			tags: ['science-fiction', 'satire', 'weltall'],
			excerpt: {
				en: 'A NASA engineer is tasked with drafting a final message for the Voyager II probe as it leaves the solar system. What he writes is not what mission control expected.',
				de: 'Ein NASA-Ingenieur soll eine letzte Botschaft für die Raumsonde Voyager II verfassen, kurz bevor sie das Sonnensystem verlässt. Was er schreibt, entspricht nicht dem, was die Missionskontrolle erwartet.'
			},
			body: {
				de: [
					block('d1', 'Dunkelheit lag auf den Monitoren, als Daniel das Mission Control Center betrat. Er dachte an Mercury, Apollo, an "Houston, wir haben ein Problem" - und daran, dass sich heute kaum noch jemand für die Voyager-Sonden interessiert.'),
					block('d2', 'Durch Auslosung hatte er die Aufgabe erhalten, eine Abschiedsbotschaft für die Voyager II zu verfassen. Sie verließ das Sonnensystem. Jemand musste etwas sagen.'),
					block('d3', 'Er schrieb drei Tage lang. Dann schickte er ab, was er geschrieben hatte.'),
					block('d4', 'Die Botschaft warnte fremde Zivilisationen vor der Menschheit. Beschrieb sie als kriegerisch, eigennützig, selbstzerstörerisch. "Bitte versucht nicht, uns zu kontaktieren", schloss er. "Wir würden euch angreifen, gefangen nehmen und eure Technologie ausbeuten."'),
					block('d5', 'Die Missionskontrolle veröffentlichte eine andere Botschaft.')
				],
				en: [
					block('e1', 'Darkness lay on the monitors when Daniel entered Mission Control. He thought of Mercury, Apollo, of "Houston, we have a problem" - and of how nobody cared about the Voyager probes anymore.'),
					block('e2', 'By lottery he had been assigned the task of drafting a farewell message for Voyager II. It was leaving the solar system. Someone had to say something.'),
					block('e3', 'He wrote for three days. Then he sent what he had written.'),
					block('e4', 'The message warned alien civilisations about humanity. Described it as warlike, self-serving, self-destructive. "Please do not try to contact us," he concluded. "We would attack you, take you prisoner, and exploit your technology."'),
					block('e5', 'Mission control published a different message.')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-unendliche-kurzgeschichte',
			title: { en: 'The Infinite Short Story', de: 'Die unendliche Kurzgeschichte' },
			slug: { _type: 'slug', current: 'die-unendliche-kurzgeschichte' },
			category: 'flash-fiction',
			date: '2017-01-16',
			minutes: 4,
			tags: ['metafiktion', 'buecher', 'rekursion'],
			excerpt: {
				en: 'A boy finds a mysterious book in the school library. Inside, a fisherman finds the same book. Inside that book, a grandfather reads to his grandson - the very scene unfolding in the story you are reading.',
				de: 'Ein Junge findet in der Schulbibliothek ein seltsames Buch mit einem goldenen Unendlichkeitssymbol. Darin findet ein alter Fischer dasselbe Buch. Darin liest ein Großvater seinem Enkel vor - genau die Szene, die gerade stattfindet.'
			},
			body: {
				de: [
					block('d1', 'Der Großvater saß im Sessel neben dem Kamin. Der Enkel hockte auf dem Teppich und lauschte. "Bist du bereit?", fragte der Großvater, und schlug das Buch auf.'),
					block('d2', 'In dem Buch fand ein Junge in der Schulbibliothek ein seltsames Buch mit einem goldenen Unendlichkeitssymbol auf dem Einband. Er begann zu lesen.'),
					block('d3', 'In jenem Buch entdeckte ein einsamer alter Fischer beim Fischen ein Buch in einer Schutzfolie. Er öffnete es. Darin stand: "Bist du bereit? Der alte Mann schlug das Buch auf..."'),
					block('d4', 'Der Großvater hielt inne. Der Enkel schaute auf. Auf dem Einband des Buches, das der Großvater hielt, war ein goldenes Unendlichkeitssymbol.')
				],
				en: [
					block('e1', 'The grandfather sat in the armchair by the fireplace. The grandson crouched on the carpet and listened. "Are you ready?" the grandfather asked, and opened the book.'),
					block('e2', 'In the book, a boy found a strange book in the school library with a golden infinity symbol on the cover. He began to read.'),
					block('e3', 'In that book, a lonely old fisherman discovered a book wrapped in plastic while fishing. He opened it. Inside it said: "Are you ready? The old man opened the book..."'),
					block('e4', 'The grandfather paused. The grandson looked up. On the cover of the book the grandfather held, there was a golden infinity symbol.')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-anders',
			title: { en: 'Different', de: 'Anders' },
			slug: { _type: 'slug', current: 'anders' },
			category: 'flash-fiction',
			date: '2002-04-14',
			minutes: 3,
			tags: ['humor', 'vampir', 'nerd'],
			excerpt: {
				de: '"Manche Dinge sind anders als sie scheinen", murmelte der Vampir, bleckte seine schief sitzenden Zähne und leerte sein Glas in einem Zug.',
				en: '"Some things are different from how they appear," the vampire muttered, bared his crooked teeth, and emptied his glass in one go.'
			},
			body: {
				de: [
					block('d1', '"Manche Dinge sind anders als sie scheinen", murmelte der Vampir, bleckte seine schief sitzenden Zähne und schwenkte das Glas, in dem eine rote Flüssigkeit schwappte. Er leerte es in einem Zug.'),
					block('d2', 'Er saß in einer abgedunkelten Bar, während draußen bereits der Morgen graute. Hinter den Gardinen des einzigen Fensters eilten Passanten vorbei. Der Straßenlärm drang kaum merklich in das Lokal. Das Leben in der Großstadt erwachte schon früh, denn viele wollten ihre Vorgesetzten nicht damit ärgern, dass sie zu spät kamen. Der Vampir bewunderte manchmal diese emsige Geschäftigkeit, die die Menschen an den Tag legten. Wie die Männer und Frauen tagein, tagaus so vielen verschiedenen Tätigkeiten nachgingen. Er konnte sich das gar nicht vorstellen!'),
					block('d3', 'Der Vampir lebte in einem dunklen Hinterzimmer der Bar, das ihm der Eigentümer zu einem Spottpreis vermietet hatte. Dafür musste er ab und an aushelfen, wenn der Laden einmal gut besucht war. Was eigentlich noch nie vorgekommen ist. So konnte er in seinem Zimmer, das er manchmal liebevoll "die Gruft" nannte, ungestört seiner Lieblingsbeschäftigung nachgehen: Sich die Nächte mit unzähligen Code-Zeilen um die Ohren schlagen, um die Software seiner Auftraggeber nach Fehlern zu durchsuchen.'),
					block('d4', 'Jemand öffnete die Tür und der Vampir schloss geblendet seine Augen. Tageslicht war er einfach nicht mehr gewohnt.'),
					block('d5', '"Tür zu!", raunte er, als der letzte Gast torkelnd den Laden verließ. Der Barmann schaute auf, unterbrach kurz seine Arbeit und warf das Geschirrtuch gekonnt über seine Schulter.'),
					block('d6', '"Du bist ein Nerd", sagte er zum Vampir. "Tagelang schließt Du Dich in Deinem Zimmer ein und kommst nur raus, um etwas zu trinken. Wann hast Du denn eigentlich zum letzten Mal in den Spiegel geschaut?"'),
					block('d7', '"Das versuche ich zu vermeiden", meinte sein Gegenüber.'),
					block('d8', '"Wahrscheinlich wird der Spiegel blind, wenn er Deine Augenringe sieht", witzelte der Barmann. "Wenn Du so weitermachst, wird wirklich jede Frau einen großen Bogen um Dich machen."'),
					block('d9', 'Der Vampir senkte den Blick. Zu gern hätte er sich seinen Gelüsten hingegeben, doch in einem hatte der Mann hinterm Tresen recht: Über das Vorspiel kam er schon seit Jahren nicht mehr hinaus. Er musste seinen Bekanntschaften lediglich versuchen, die Bluse aufzuknöpfen und ihnen einen Kuss auf den Hals zu hauchen, und schon liefen sie schreiend weg. Mit Frauen hatte er einfach kein Glück!'),
					block('d10', '"Und wie dürr Du aussiehst!", fuhr der Barmann fort. "Du solltest mehr essen! Ich könnte Dir eine halbe Pizza Napoletana anbieten, habe ich in meiner Pause nicht mehr geschafft."'),
					block('d11', 'Der Vampir schüttelte nachdenklich den Kopf. "Du weißt doch, dass ich eine Knoblauch-Allergie habe", sagte er. "Aber noch etwas zu trinken nehme ich gern, bevor ich mich in meine Gruft zum Schlafen begebe."'),
					block('d12', 'Der Barmann seufzte und schenkte ihm nach. So konnte er ihm wahrlich nicht helfen. Dann wandte er sich um und putzte weiter seine Gläser. Gedankenverloren saß der Vampir am Tresen, hob sein Glas und trank genüsslich seinen Rotwein.')
				],
				en: [
					block('e1', '"Some things are different from how they appear," the vampire muttered, bared his crooked teeth, and swirled the glass in which a red liquid sloshed. He emptied it in one go.'),
					block('e2', 'He sat in a darkened bar while morning was already breaking outside. Behind the curtains of the only window, passers-by hurried past. Street noise barely penetrated the establishment. The vampire sometimes admired the industrious bustle people put on display.'),
					block('e3', 'The vampire lived in a dark back room of the bar, which the owner had rented to him for a pittance. In return he had to help out occasionally when the place was busy - which had never actually happened. So he could pursue his favourite pastime undisturbed in his room, which he sometimes fondly called "the crypt": spending nights wrestling with endless lines of code, searching clients\' software for bugs.'),
					block('e4', '"You\'re a nerd," the barman said. "You lock yourself in your room for days and only come out to drink. When did you last look in a mirror?"'),
					block('e5', '"I try to avoid that," his counterpart replied.'),
					block('e6', 'The vampire shook his head thoughtfully. "You know I have a garlic allergy," he said. "But I\'ll gladly have another drink before I retire to my crypt to sleep."'),
					block('e7', 'The barman sighed and poured. He really couldn\'t help him. Then he turned and kept polishing his glasses. The vampire sat absently at the counter, raised his glass, and savoured his red wine.')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-traumfrau',
			title: { en: 'Dream Woman', de: 'Traumfrau' },
			slug: { _type: 'slug', current: 'traumfrau' },
			category: 'flash-fiction',
			date: '2019-03-12',
			minutes: 1,
			tags: ['liebe', 'einsamkeit'],
			excerpt: {
				de: '"Wollen wir schlafen gehen?", fragst Du und ich nicke nur.',
				en: '"Shall we go to sleep?" you ask and I just nod.'
			},
			body: {
				de: [
					block('d1', '"Wollen wir schlafen gehen?", fragst Du und ich nicke nur. Langsam entkleidest Du Dich und kuschelst Dich in die warme Bettdecke. Ich folge Dir und lege mich hinter Dich, streichle zärtlich Deine Konturen nach - ein leichter Schauer auf Deiner Haut. Ich schmiege mich an Dich, genieße Deinen Geruch.'),
					block('d2', 'Vertraut.'),
					block('d3', 'Irgendwann nimmst Du meine Hand und führst sie zu Deinem Bauch, verschränkst Deine Finger in meine. Dein Zeigefinger streichelt langsam meinen Daumen. Du schließt Deine müden Augen und murmelst leise: "Bleib immer bei mir." Ich folge Dir in Deine Träume.'),
					block('d4', 'Ich wache auf. Mein Bett ist kalt und leer. Verschlafen blinzle ich den Morgen weg.')
				],
				en: [
					block('e1', '"Shall we go to sleep?" you ask and I just nod. Slowly you undress and snuggle into the warm duvet. I follow you and lie behind you, tenderly tracing your contours - a light shiver on your skin. I press close to you, breathe in your scent.'),
					block('e2', 'Familiar.'),
					block('e3', 'At some point you take my hand and guide it to your stomach, intertwining your fingers with mine. Your index finger slowly strokes my thumb. You close your tired eyes and murmur quietly: "Stay with me always." I follow you into your dreams.'),
					block('e4', 'I wake up. My bed is cold and empty. Half-asleep, I blink the morning away.')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-entscheidungen',
			title: { en: 'Decisions', de: 'Entscheidungen' },
			slug: { _type: 'slug', current: 'entscheidungen' },
			category: 'flash-fiction',
			date: '2013-03-12',
			minutes: 1,
			tags: ['alltag', 'reflexion'],
			excerpt: {
				de: 'Täglich begegnen sie uns: Entscheidungen. Im Kleinen wie im Großen machen sie uns das Leben attraktiver, geschmeidiger - oder manchmal auch ängstlicher.',
				en: 'Every day we encounter them: decisions. Large or small, they make life more attractive, more fluid - or sometimes more frightening.'
			},
			body: {
				de: [
					block('d1', 'Täglich begegnen sie uns: Entscheidungen. Im Kleinen wie im Großen machen sie uns das Leben attraktiver, geschmeidiger oder manchmal auch ängstlicher.'),
					block('d2', 'Magst Du Deinen Kaffee lieber schwarz oder mit Milch und Zucker? Soll ich heute zu Hause bleiben oder arbeiten gehen? Behält er die Wohnung oder sucht er sich eine andere - vielleicht in einer anderen Stadt? Sollten sie sich trennen oder wegen des Kindes besser zusammen bleiben und an ihrer Beziehung arbeiten?'),
					block('d3', 'Keine dieser Entscheidungen fallen leicht, aber ihr Gegenspieler - die Gewohnheit - macht sie häufig erträglicher. Wir müssen nicht jedes Mal den Kaffee neu erfinden - wir trinken ihn lieber immer schwarz. Und auch arbeiten gehen wir an fast jedem Wochentag.'),
					block('d4', 'Bleiben noch die schweren Entscheidungen, die wohl überlegt sein sollten. Weil sie andere Entscheidungen beeinflussen und so einen neuen, erschwerlichen Konsens bilden.')
				],
				en: [
					block('e1', 'Every day we encounter them: decisions. Large or small, they make life more attractive, more fluid - or sometimes more frightening.'),
					block('e2', 'Do you prefer your coffee black or with milk and sugar? Should I stay home today or go to work? Does he keep the flat or look for another one - maybe in a different city? Should they separate or stay together for the child and work on their relationship?'),
					block('e3', 'None of these decisions come easily, but their counterpart - habit - often makes them more bearable. We don\'t have to reinvent coffee every time - we simply always drink it black. And we go to work on almost every weekday.'),
					block('e4', 'That leaves the difficult decisions, which should be well considered. Because they influence other decisions and thus form a new, more complex consensus.')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-gluecklich',
			title: { en: 'Happy?', de: 'Glücklich?' },
			slug: { _type: 'slug', current: 'gluecklich' },
			category: 'flash-fiction',
			date: '2006-03-12',
			minutes: 1,
			tags: ['einsamkeit', 'cafe'],
			excerpt: {
				de: '"Ich bin glücklich", sagt eine Person in einem kleinen Café. Der Stuhl ihr gegenüber bleibt leer.',
				en: '"I am happy," a person says in a small cafe. The chair across from them remains empty.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-zukunft',
			title: { en: 'Future', de: 'Zukunft' },
			slug: { _type: 'slug', current: 'zukunft' },
			category: 'flash-fiction',
			date: '2006-03-12',
			minutes: 1,
			tags: ['utopie', 'vision'],
			excerpt: {
				de: 'Frühlingshafte Temperaturen. Weiße Wände aus Stoff wehen sanft im Wind.',
				en: 'Spring-like temperatures. White walls of cloth sway gently in the wind.'
			},
			body: {
				de: [
					block('d1', 'Frühlingshafte Temperaturen. Weiße Wände aus Stoff wehen sanft im Wind. Zwölf der weisen Frauen und Männer sitzen um eine wabernde Kugel aus Licht, verbunden ihre Gedanken untereinander, und schaffen die Materie, die sie benötigen.'),
					block('d2', 'Nebenan lernen Kinder, was sie im Leben brauchen. Die Lehrer bilden sie nach ihren Fähigkeiten aus und schaffen die Basis für ihr zukünftiges Wirken.'),
					block('d3', 'Einer der Weisen nutzt seine Stimme, um seinen Worten mehr Gewicht zu verleihen: "Lehren wir unseren Ahnen, wie sie ein friedvolles Leben genießen können, damit wir es heute so haben wie es ist."')
				],
				en: [
					block('e1', 'Spring-like temperatures. White walls of cloth sway gently in the wind. Twelve of the wise women and men sit around a shimmering ball of light, their thoughts connected to one another, creating the matter they need.'),
					block('e2', 'Next door, children learn what they need for life. Teachers train them according to their abilities, laying the foundation for their future work.'),
					block('e3', 'One of the wise ones uses their voice to give their words more weight: "Let us teach our ancestors how to enjoy a peaceful life, so that we may have it today as it is."')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-das-leben-ist-schoen',
			title: { en: 'Life Is Beautiful', de: 'Das Leben ist schön' },
			slug: { _type: 'slug', current: 'das-leben-ist-schoen' },
			category: 'flash-fiction',
			date: '2013-12-03',
			minutes: 1,
			tags: ['lyrik-prosa', 'liebe', 'natur'],
			excerpt: {
				de: '"Das Leben ist schön", sagt sie, schaut dabei auf den von Wolken besprenkelten Abendhimmel...',
				en: '"Life is beautiful," she says, gazing at the cloud-dappled evening sky...'
			},
			body: {
				de: [
					block('d1', '"Das Leben ist schön", sagt sie, schaut dabei auf den von Wolken besprenkelten, in zartesten Farben spielenden Abendhimmel, dessen Leuchtkraft immer weiter zu- anstatt abnimmt, beginnt sich im Rhythmus des Windes zu wiegen, ihn zu atmen als sei es der zarte Kuss der Liebe der sie streift, sie sanft am Nacken berührt und ihr süße Worte zuflüstert - Worte, die Erinnerungen schaffen und sich im gleichen Augenblick ihrer bemächtigen, um das schönste der Gefühle, nämlich das der allumfassenden Liebe zu wecken und sie im Winde wiegend vorzufinden, träumend auf ihre schöne Welt blickend und abwesend zugleich; und sie dreht sich im Kreise der Unendlichkeit, steigt dabei höher und höher empor, lässt die vorbeiziehenden Vögel vor Neid erblassen, sei es, weil sie noch nie so etwas Schönes gesehen haben, sei es, weil sie zitternd vor Angst und Verlangen ihrem großen Vergnügen zusehen dürfen, kommt den langsam dahinziehenden Wolken des Himmels immer näher, verschmilzt mit den Farben des von der untergehenden Sonne glänzenden Horizonts, explodiert in sichtlicher Wonne und alles überstrahlendem Glanz, lässt die ersten Sterne aufleuchten und sie ihr den Weg zurück zur Erde weisen, auf der sie stehen, in den zarten alles umfassenden Himmel blickend den kühlen Wind bewundern und sich sagen hören wird: "Das Leben ist schön."')
				],
				en: [
					block('e1', '"Life is beautiful," she says, gazing at the cloud-dappled evening sky playing in the most delicate colours, its luminosity growing rather than fading, beginning to sway in the rhythm of the wind, breathing it as if it were the tender kiss of love grazing her, touching her softly at the nape of the neck and whispering sweet words to her - words that create memories and in the same instant seize them, to awaken the most beautiful of feelings, namely that of all-encompassing love, finding her swaying in the wind, dreaming and gazing at her beautiful world and absent at once; and she spins in the circle of infinity, rising higher and higher, making the passing birds pale with envy, whether because they have never seen anything so beautiful, or because trembling with fear and longing they are permitted to witness her great pleasure, coming ever closer to the slowly drifting clouds of the sky, merging with the colours of the horizon gleaming in the setting sun, exploding in visible bliss and all-surpassing radiance, letting the first stars light up and guide her way back to the earth, on which she stands, admiring the cool wind while gazing into the tender all-embracing sky and hearing herself say: "Life is beautiful."')
				]
			}
		},
		// --- Gedichte (body wird im Studio eingepflegt) ---
		{
			_type: 'writing',
			_id: 'writing-verlieben',
			title: { de: 'Verlieben', en: 'Falling in Love' },
			slug: { _type: 'slug', current: 'verlieben' },
			category: 'poem',
			date: '2014-01-01',
			tags: ['lyrik', 'geister', 'nacht'],
			excerpt: {
				de: 'Ein Gedicht über eine nächtliche, übernatürliche Begegnung - und das Überwinden der Furcht.',
				en: 'A poem about a nocturnal, supernatural encounter - and the overcoming of fear.'
			},
			body: {
				de: [
					block('d1', 'Geister ziehen leise\nDurch den leeren Raum\nSingen eine Weise\nDoch ich hör sie kaum'),
					block('d2', 'Nach dem ersten Schlage\nSchwillt das Singen an\nStellt sich nur die Frage\nOb ich\'s spüren kann'),
					block('d3', 'Dann beim zweiten, dritten\nSeh ich sie schon ganz\nMuss nicht lange bitten\nUm den Geistertanz'),
					block('d4', 'Und die Uhr schlägt weiter\nNähert sich der Acht\nAlle tanzen heiter\nDurch die dunkle Nacht'),
					block('d5', 'Plötzlich rasseln Ketten\nUnten dort im Gang\nStören schon den netten\nMitternachtsgesang'),
					block('d6', 'Und mich plagen Ängste\nDie ich nie gekannt\nSorgen haben bängste\nAhnungen gesandt'),
					block('d7', 'Doch ich schau mir gerne\nDiese Ketten an -\nNur aus großer Ferne\nUnd nur dann und wann.'),
					block('d8', 'Kurz bevor dem Letzten\nFass ich wieder Mut\nWas die Geister schätzten\nIst jetzt doppelt gut'),
					block('d9', 'Wenn der Schlag dann ausklingt\nTanz ich froh und feist\nNichts, was mich hinausbringt\nWerde selbst zum Geist')
				],
				en: [
					block('e1', '[Translation pending]')
				]
			}
		},
		{
			_type: 'writing',
			_id: 'writing-bit-geschichte',
			title: { de: 'Bit-Geschichte', en: 'Bit Story' },
			slug: { _type: 'slug', current: 'bit-geschichte' },
			category: 'poem',
			date: '2013-01-01',
			tags: ['lyrik', 'humor', 'technik', 'informatik'],
			excerpt: {
				de: 'Einst machte sich ein Bit ganz leise auf eine strapaziöse Reise durch einen Prozessor. Ein humorvolles Gedicht in 256 Silben.',
				en: 'Once upon a time a bit quietly set out on a strenuous journey through a processor. A humorous poem in 256 syllables.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-hoert-auf',
			title: { de: 'Hört auf!', en: 'Stop It!' },
			slug: { _type: 'slug', current: 'hoert-auf' },
			category: 'poem',
			date: '2012-01-01',
			tags: ['lyrik', 'stille', 'konflikt'],
			excerpt: {
				de: 'Vier Strophen über Stille, emotionale Belastung und unausgesprochene Konflikte.',
				en: 'Four stanzas about silence, emotional strain, and unspoken conflict.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-normalitaet',
			title: { de: 'Normalität?', en: 'Normality?' },
			slug: { _type: 'slug', current: 'normalitaet' },
			category: 'poem',
			date: '2012-04-27',
			tags: ['lyrik', 'alltag', 'gesellschaft'],
			excerpt: {
				de: 'Fünf Strophen, die grundlegende Fragen zur Normalität im Alltag stellen - von Arbeitsbelastung über Konflikte bis zur existenziellen Reflexion.',
				en: 'Five stanzas questioning what is normal in everyday life - from work overload to conflict to existential reflection.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-nachgefragt',
			title: { de: 'Nachgefragt', en: 'Asked' },
			slug: { _type: 'slug', current: 'nachgefragt' },
			category: 'poem',
			date: '2012-01-01',
			tags: ['lyrik', 'fürsorge', 'beziehung'],
			excerpt: {
				de: 'Ein vierstrophiges Gedicht über Besorgnis um eine nahestehende Person und den Wunsch nach Kommunikation trotz Konflikten.',
				en: 'A four-stanza poem about concern for someone close and the wish for communication despite conflict.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-an-die-presse',
			title: { de: 'An die Presse', en: 'To the Press' },
			slug: { _type: 'slug', current: 'an-die-presse' },
			category: 'poem',
			date: '2012-01-01',
			tags: ['lyrik', 'medien', 'gesellschaft'],
			excerpt: {
				de: 'Zwei Strophen mit kritischer Perspektive auf Medienberichterstattung und Sensationsgier.',
				en: 'Two stanzas with a critical perspective on media reporting and sensationalism.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-vertrauen',
			title: { de: 'Vertrauen', en: 'Trust' },
			slug: { _type: 'slug', current: 'vertrauen' },
			category: 'poem',
			date: '2012-01-01',
			tags: ['lyrik', 'vertrauen', 'mut'],
			excerpt: {
				de: 'Drei Strophen über Verletzlichkeit und blinden Glauben - von Unsicherheit zu bedingungslosem Vertrauen.',
				en: 'Three stanzas about vulnerability and blind faith - from uncertainty to unconditional trust.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-winter',
			title: { de: 'Winter', en: 'Winter' },
			slug: { _type: 'slug', current: 'winter' },
			category: 'poem',
			date: '2011-01-01',
			tags: ['lyrik', 'natur', 'jahreszeiten', 'umwelt'],
			excerpt: {
				de: 'Fünf Strophen: Die Schönheit einer verschneiten Winterlandschaft - und die Zerstörung durch Rauch und Lärm.',
				en: 'Five stanzas: the beauty of a snowy winter landscape - and its destruction by smoke and noise.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-neumond',
			title: { de: 'Neumond', en: 'New Moon' },
			slug: { _type: 'slug', current: 'neumond' },
			category: 'poem',
			date: '2011-01-01',
			tags: ['lyrik', 'nacht', 'fest', 'vergaenglichkeit'],
			excerpt: {
				de: 'Ein Fest in der Nacht - bunte Lichter, heitere Lieder, gute Vorsätze. Und bei Vollmond werden alle sie vergessen haben.',
				en: 'A celebration in the night - colourful lights, cheerful songs, good intentions. And by full moon, everyone will have forgotten them.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-herbsttanz',
			title: { de: 'Herbsttanz', en: 'Autumn Dance' },
			slug: { _type: 'slug', current: 'herbsttanz' },
			category: 'poem',
			date: '2011-01-01',
			tags: ['lyrik', 'natur', 'herbst', 'vergaenglichkeit'],
			excerpt: {
				de: 'Bevor das Blatt zu Boden schwebt, greift es der Wind und lädt es ein zum Blättertanz.',
				en: 'Before the leaf drifts to the ground, the wind catches it and invites it to the autumn dance.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-tief-im-innern',
			title: { de: 'Tief im Innern', en: 'Deep Inside' },
			slug: { _type: 'slug', current: 'tief-im-innern' },
			category: 'poem',
			date: '2011-07-11',
			tags: ['lyrik', 'fernweh', 'sinnsuche'],
			excerpt: {
				de: 'Fünf Strophen über innere Unruhe, den Drang nach Aufbruch und die Suche nach persönlicher Erfüllung.',
				en: 'Five stanzas about inner restlessness, the urge to depart, and the search for personal fulfilment.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-ein-laecheln',
			title: { de: 'Ein Lächeln', en: 'A Smile' },
			slug: { _type: 'slug', current: 'ein-laecheln' },
			category: 'poem',
			date: '2009-04-14',
			tags: ['lyrik', 'mimik', 'freude'],
			excerpt: {
				de: 'Sie zieht ihren Mund ein wenig breiter, zeigt ihre Zähne im strahlenden Weiß.',
				en: 'She pulls her mouth a little wider, shows her teeth in brilliant white.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-unuebersehbar',
			title: { de: 'Unübersehbar', en: 'Unmistakable' },
			slug: { _type: 'slug', current: 'unuebersehbar' },
			category: 'poem',
			date: '2010-01-18',
			tags: ['lyrik', 'liebe', 'natur'],
			excerpt: {
				de: 'Vier Strophen mit Naturbildern - vom Sandkorn über Blumen bis zur Sonne - um emotionale Nähe auszudrücken.',
				en: 'Four stanzas with nature imagery - from a grain of sand to flowers to the sun - to express emotional closeness.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-worte',
			title: { de: 'Worte', en: 'Words' },
			slug: { _type: 'slug', current: 'worte' },
			category: 'poem',
			date: '2001-12-16',
			tags: ['lyrik', 'sprache', 'stille'],
			excerpt: {
				de: 'Vorgetragen am 16. Dezember 2001 in der Radiosendung "Lucy in the Sky" auf Radio Fritz. Über die Bedeutung von Sprache - und die Erfüllung im Schweigen.',
				en: 'Read on 16 December 2001 on the radio show "Lucy in the Sky" on Radio Fritz. On the meaning of language - and the fulfilment found in silence.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-ahnung',
			title: { de: 'Ahnung', en: 'Premonition' },
			slug: { _type: 'slug', current: 'ahnung' },
			category: 'poem',
			date: '2009-03-11',
			tags: ['lyrik', 'intuition', 'begegnung'],
			excerpt: {
				de: 'Drei Strophen über flüchtige Momente, emotionale Verbindung und ein diffuses Gefühl von dem, was kommen könnte.',
				en: 'Three stanzas about fleeting moments, emotional connection, and a vague feeling of what might come.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-das-leben-lebt-jeder-nur-einmal',
			title: {
				de: 'Das Leben lebt jeder nur einmal',
				en: 'You Only Live Life Once'
			},
			slug: { _type: 'slug', current: 'das-leben-lebt-jeder-nur-einmal' },
			category: 'poem',
			date: '2009-07-27',
			tags: ['lyrik', 'vergaenglichkeit', 'leben'],
			excerpt: {
				de: 'Vier Strophen über die Einmaligkeit des Lebens und die menschliche Tendenz, sie nicht zu würdigen.',
				en: 'Four stanzas on the uniqueness of life and the human tendency not to honour it.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-irgendwann',
			title: { de: 'Irgendwann', en: 'Someday' },
			slug: { _type: 'slug', current: 'irgendwann' },
			category: 'poem',
			date: '2009-07-27',
			tags: ['lyrik', 'hoffnung', 'hindernisse'],
			excerpt: {
				de: 'Drei Strophen: Hindernisse, Sorgen, Ängste - und am Ende: Träume, Wurzeln, Ziele. Gibt es immer - irgendwann.',
				en: 'Three stanzas: obstacles, worries, fears - and at the end: dreams, roots, goals. There is always - someday.'
			}
		},
		{
			_type: 'writing',
			_id: 'writing-ohne-titel',
			title: { de: 'Ohne Titel', en: 'Untitled' },
			slug: { _type: 'slug', current: 'ohne-titel' },
			category: 'poem',
			date: '2009-07-27',
			tags: ['lyrik', 'freundschaft', 'natur'],
			excerpt: {
				de: 'Für Katharina. Vier Strophen, jeweils beginnend mit "sehen" - von der Weltperspektive bis zur Freundschaft.',
				en: 'For Katharina. Four stanzas each beginning with "see" - from the world perspective to friendship.'
			}
		}
	];

	for (const writing of writings) {
		await client.createOrReplace(writing);
	}
	console.log(`  angelegt: ${writings.length} Texte`);

	// ------------------------------------------------------------------ //
	// Musik
	// ------------------------------------------------------------------ //
	console.log('\nMusik...');
	await wipe('track');
	await wipe('album');

	const albums = [
		{
			_type: 'album',
			_id: 'album-silenced-world',
			title: 'Silenced World',
			artist: 'Mirko Schubert',
			year: 2012,
			description: {
				de: 'Instrumentale Klaviermusik aus jahrelanger Beschäftigung mit Jazz, Funk und Fusion. Zunächst als Solo-Programm mit Playback aufgeführt, später mit einer Band. Veröffentlicht unter Creative Commons BY-NC-SA 4.0.',
				en: 'Instrumental piano music rooted in years of engagement with jazz, funk, and fusion. First performed as a solo programme with playback, later with a band. Released under Creative Commons BY-NC-SA 4.0.'
			},
			links: ['https://soundcloud.com/mirkoschubert/sets/silenced-world-1']
		},
		{
			_type: 'album',
			_id: 'album-electronic-journey',
			title: 'Electronic Journey',
			artist: 'Mirko Schubert',
			year: 2010,
			description: {
				de: 'Eine EP mit zwei Songs, entstanden während eines Umzugs nach Hamburg, als das Klavier nicht verfügbar war. Ausschließlich mit Apple Logic Pro und der MacBook-Tastatur eingespielt. Zeitweise in den Charts auf mp3.de. Veröffentlicht unter Creative Commons BY-NC-SA 4.0.',
				en: 'An EP of two songs, created during a move to Hamburg when the piano was unavailable. Recorded exclusively with Apple Logic Pro and the MacBook keyboard. Briefly charted on mp3.de. Released under Creative Commons BY-NC-SA 4.0.'
			}
		},
		{
			_type: 'album',
			_id: 'album-tage-wie-diese',
			title: 'Tage wie diese',
			artist: 'Mirko Schubert',
			year: 2004,
			description: {
				de: '14 Titel, während des Studiums mit einem Minidisc-Rekorder aufgenommen und im Selbstverlag auf CD veröffentlicht. Zwei Songs textlich unterstützt von Jana Hoffmann. Enthält überarbeitete Versionen einiger Titel sowie den Bonus-Track "Perfekt". Veröffentlicht unter Creative Commons BY-NC-SA 4.0.',
				en: '14 tracks recorded during university studies with a MiniDisc recorder and self-released on CD. Two songs with lyrics co-written by Jana Hoffmann. Includes revised versions of some tracks and the bonus track "Perfekt". Released under Creative Commons BY-NC-SA 4.0.'
			}
		}
	];

	for (const album of albums) {
		await client.createOrReplace(album);
	}
	console.log(`  angelegt: ${albums.length} Alben`);

	const tracks = [
		{
			_type: 'track',
			_id: 'track-silenced-world',
			title: 'Silenced World',
			artist: 'Mirko Schubert',
			album: { _type: 'reference', _ref: 'album-silenced-world' },
			year: 2012,
			tags: ['jazz', 'fusion', 'klavier', 'instrumental']
		},
		{
			_type: 'track',
			_id: 'track-electronic-journey',
			title: 'Electronic Journey',
			artist: 'Mirko Schubert',
			album: { _type: 'reference', _ref: 'album-electronic-journey' },
			year: 2010,
			tags: ['electronic', 'ambient']
		},
		{
			_type: 'track',
			_id: 'track-tage-wie-diese',
			title: 'Tage wie diese',
			artist: 'Mirko Schubert',
			album: { _type: 'reference', _ref: 'album-tage-wie-diese' },
			year: 2004,
			tags: ['klavier', 'singer-songwriter']
		}
	];

	for (const track of tracks) {
		await client.createOrReplace(track);
	}
	console.log(`  angelegt: ${tracks.length} Tracks`);

	// ------------------------------------------------------------------ //
	// System Info
	// ------------------------------------------------------------------ //
	console.log('\nSystem Info...');
	await wipe('sysInfo');

	await client.createOrReplace({
		_type: 'sysInfo',
		_id: 'sysinfo-main',
		user: 'mirko',
		hostname: 'mirko-os',
		build: 'RetroOS 11.4 "Charcoal"',
		shell: 'msh 0.9.2',
		email: 'office@mirkoschubert.de',
		location: 'Hamburg, DE',
		available_for: {
			en: 'Selected commissions - get in touch',
			de: 'Ausgewählte Aufträge - meld dich gerne'
		},
		stack: [
			'SvelteKit',
			'TypeScript',
			'Node.js',
			'Rust',
			'Go',
			'PostgreSQL',
			'Sanity',
			'Vercel'
		]
	});
	console.log('  angelegt: System Info');

	console.log('\nFertig.');
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
