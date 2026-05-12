import { pickLocale } from '$lib/sanity/utils.js';
import type { Project, Writing, Photo, Album, SysInfo, Publication } from '$lib/sanity/types.js';

export type Lang = 'en' | 'de';

export interface HistoryLine {
	kind: 'in' | 'out' | 'err' | 'sys';
	text: string;
}

export interface TerminalData {
	projects: Project[];
	writings: Writing[];
	photos: Photo[];
	albums: Album[];
	publications: Publication[];
	sysInfo: SysInfo | null | undefined;
	lang: Lang;
}

// ── Virtual filesystem ──────────────────────────────────────────────────────

export const DIRS = ['projects', 'writing', 'photos', 'music', 'publications'] as const;
export type Dir = (typeof DIRS)[number];

export const DIR_EXT: Record<Dir, string> = {
	projects: '.proj',
	writing: '.txt',
	photos: '.jpg',
	music: '.mp3',
	publications: '.pub'
};

export const DIR_MODULE: Record<Dir, string> = {
	projects: 'projects',
	writing: 'writer',
	photos: 'darkroom',
	music: 'media',
	publications: 'publications'
};

export function isTopDir(s: string): s is Dir {
	return (DIRS as readonly string[]).includes(s);
}

/** Slugify: converts umlauts, then lowercases and replaces non-word chars */
export function slugify(s: string): string {
	return s
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/Ä/g, 'ae')
		.replace(/Ö/g, 'oe')
		.replace(/Ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.slice(0, 32);
}

export interface DirEntry {
	date: string;
	slug: string; // with extension or trailing /
	name: string;
	id: string;
	albumId?: string;
}

export function getDirEntries(dir: Dir, data: TerminalData): DirEntry[] {
	const { projects, writings, photos, albums, publications, lang } = data;
	switch (dir) {
		case 'projects':
			return projects.map((p) => ({
				date: String(p.year ?? '????'),
				slug: (p.slug?.current ?? slugify(pickLocale(lang, p.title) ?? p._id)) + DIR_EXT.projects,
				name: pickLocale(lang, p.title) ?? p._id,
				id: p._id
			}));
		case 'writing':
			return writings.map((w) => ({
				date: w.date ?? '????-??-??',
				slug: (w.slug?.current ?? slugify(pickLocale(lang, w.title) ?? w._id)) + DIR_EXT.writing,
				name: pickLocale(lang, w.title) ?? w._id,
				id: w._id
			}));
		case 'photos':
			return photos.map((p) => ({
				date: p.date ?? '????-??-??',
				slug: slugify(pickLocale(lang, p.title) ?? p._id) + DIR_EXT.photos,
				name: pickLocale(lang, p.title) ?? p._id,
				id: p._id
			}));
		case 'music':
			return albums.map((a) => ({
				date: String(a.year ?? '????'),
				slug: (a.slug?.current ?? slugify(a.title)) + '/',
				name: a.title,
				id: a._id
			}));
		case 'publications':
			return publications.map((p) => ({
				date: p.period?.from
					? `${p.period.from}${p.period.to ? '-' + p.period.to : '-now'}`
					: '????',
				slug: (p.slug?.current ?? slugify(p.name)) + DIR_EXT.publications,
				name: p.name ?? '',
				id: p._id
			}));
	}
}

export function getAlbumTracks(albumId: string, albums: Album[]): DirEntry[] {
	const album = albums.find((a) => a._id === albumId);
	if (!album) return [];
	return (album.tracks ?? []).map((tr) => ({
		date: String(album.year ?? '????'),
		slug: slugify(tr.title) + DIR_EXT.music,
		name: tr.title,
		id: tr._key,
		albumId: album._id
	}));
}

function stripExt(s: string, ext: string): string {
	return s.endsWith(ext) ? s.slice(0, -ext.length) : s.replace(/\/$/, '');
}

export function findEntryBySlug(dir: Dir, slug: string, data: TerminalData): DirEntry | undefined {
	const ext = DIR_EXT[dir];
	const bare = stripExt(slug, ext);
	return getDirEntries(dir, data).find((e) => stripExt(e.slug, ext) === bare);
}

export function findAlbumBySlug(slug: string, albums: Album[]): Album | undefined {
	const bare = slug.replace(/\/$/, '');
	return albums.find((a) => (a.slug?.current ?? slugify(a.title)) === bare);
}

export function findAlbumTrackBySlug(
	albumId: string,
	slug: string,
	albums: Album[]
): DirEntry | undefined {
	const ext = DIR_EXT.music;
	const bare = stripExt(slug, ext);
	return getAlbumTracks(albumId, albums).find((t) => stripExt(t.slug, ext) === bare);
}

// ── CWD ────────────────────────────────────────────────────────────────────

/**
 * cwd format:
 *   '~'                     → root
 *   'projects'              → top-level dir
 *   'music'                 → music top-level (shows albums)
 *   'music:slug:id'         → inside an album  (colon-separated, no slash collision)
 */
export type Cwd =
	| { kind: 'root' }
	| { kind: 'dir'; dir: Dir }
	| { kind: 'musicAlbum'; albumId: string; albumSlug: string };

export function parseCwd(cwd: string): Cwd {
	if (cwd === '~') return { kind: 'root' };
	if (cwd.startsWith('music:')) {
		const [, albumSlug, albumId] = cwd.split(':');
		return { kind: 'musicAlbum', albumId: albumId ?? '', albumSlug: albumSlug ?? '' };
	}
	if (isTopDir(cwd)) return { kind: 'dir', dir: cwd };
	return { kind: 'root' };
}

export function makeMusicAlbumCwd(album: Album): string {
	return `music:${album.slug?.current ?? slugify(album.title)}:${album._id}`;
}

/** Human-readable label for the prompt */
export function cwdLabel(cwd: string): string {
	if (cwd === '~') return '~';
	if (cwd.startsWith('music:')) {
		const [, albumSlug] = cwd.split(':');
		return `~/music/${albumSlug}`;
	}
	return `~/${cwd}`;
}

// ── Module map ─────────────────────────────────────────────────────────────

export const MODULE_MAP: Record<string, string> = {
	projects: 'projects',
	project: 'projects',
	writer: 'writer',
	writing: 'writer',
	media: 'media',
	music: 'media',
	darkroom: 'darkroom',
	photos: 'darkroom',
	publications: 'publications',
	pub: 'publications',
	sysinfo: 'sysinfo',
	about: 'sysinfo',
	terminal: 'terminal'
};

// ── Easter egg data ────────────────────────────────────────────────────────

export const DOTFILES: Record<string, string[]> = {
	'.regrets': [
		'That one time I deleted the wrong branch in prod.\nAnd that other time. And the third time.',
		'Every project I started with "this time I will write tests first."',
		'Replied to an email with "sounds good" before reading it fully.',
		'Spent three days optimising something nobody used.',
		'Named a variable "data2". It is still there.'
	],
	'.dreams': [
		'Ship something so good it becomes boring infrastructure for other people.',
		'Write one thing that someone reads twice.',
		'One project. Finished. Documented. Deployed. With tests.',
		'Wake up and the side project has users.'
	],
	'.unfinished-projects': [
		'[REDACTED - list too long to display]\nSee also: .regrets'
	],
	'.old-band-name': [
		'Classified. Some things are better left in 1996.'
	],
	'.mixtapes-from-2003': [
		'Title: "nu skool breaks vol. 3 (for real this time)"\nStatus: Unfinished.'
	]
};

export function readDotfile(name: string): string | undefined {
	const entries = DOTFILES[name];
	if (!entries || entries.length === 0) return undefined;
	return entries[Math.floor(Math.random() * entries.length)];
}

export const HACK_LINES = [
	'> Initializing exploit framework v2.3.1...',
	'> Scanning target: 192.168.0.1',
	'> Port scan complete: 22, 80, 443, 8080 open',
	'> Loading payload: retro_shell_v4.sh',
	'> Bypassing firewall...          [##########] 100%',
	'> Gaining root access...         [##########] 100%',
	'> Cracking password hash...      [##########] 100%',
	'> Injecting payload...',
	'> Exfiltrating data: portfolio.tar.gz (42 MB)',
	'> Establishing persistence...',
	'> Covering tracks...',
	'> Closing connection.',
	'',
	'> Just kidding. There is nothing to hack here.',
	'> (But it looked cool for a second, right?)'
];

export const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export function buildNeofetch(sysInfo: SysInfo | null | undefined): string {
	const hostname = sysInfo?.hostname ?? 'retro-os';
	const shell = sysInfo?.shell ?? 'msh';
	const build = sysInfo?.build ?? '1.0.0';
	const tools = sysInfo?.tools?.slice(0, 4).join('  ') ?? '-';
	const stack = sysInfo?.stack?.slice(0, 4).join('  ') ?? '-';
	const sep = '-'.repeat(hostname.length + 10);
	return [
		`        .---.        ${hostname}@retro-os`,
		`       /     \\       ${sep}`,
		`      | () () |      OS: RetroOS ${build}`,
		`       \\  ^  /       Shell: ${shell}`,
		`        |||||        Tools: ${tools}`,
		`        |||||        Stack: ${stack}`,
		`                     Build: ${build}`
	].join('\n');
}

// ── Autocomplete ───────────────────────────────────────────────────────────

export function tryAutocomplete(
	raw: string,
	cwd: string,
	data: TerminalData
): string | null {
	const spaceIdx = raw.indexOf(' ');
	if (spaceIdx === -1) return null;
	const verb = raw.slice(0, spaceIdx).toLowerCase();
	const partial = raw.slice(spaceIdx + 1);
	const p = partial.toLowerCase();
	const parsed = parseCwd(cwd);

	// ── helpers ──────────────────────────────────────────────────────────────
	// matchDir: returns slug WITH trailing slash (visual dir marker), or null
	function matchDir(entries: DirEntry[], pfx: string): string | null {
		const e = entries.find((e) => e.slug.replace(/\/$/, '').startsWith(pfx));
		return e ? e.slug.replace(/\/?$/, '/') : null;
	}
function matchEntry(entries: DirEntry[], pfx: string): string | null {
		const e = entries.find((e) => e.slug.startsWith(pfx));
		return e ? e.slug : null;
	}

	// ── cd ────────────────────────────────────────────────────────────────────
	// completion appends / so the user can keep tabbing into subdirs;
	// the cd handler strips the trailing slash before lookup
	if (verb === 'cd') {
		if (parsed.kind === 'root') {
			if (p.startsWith('music/')) {
				const slug = matchDir(getDirEntries('music', data), p.slice(6));
				return slug ? `cd music/${slug}` : null;
			}
			const dir = DIRS.find((d) => d.startsWith(p));
			return dir ? `cd ${dir}/` : null;
		}
		if (parsed.kind === 'dir' && parsed.dir === 'music') {
			const slug = matchDir(getDirEntries('music', data), p);
			return slug ? `cd ${slug}` : null;
		}
		return '..'.startsWith(p) && p.length > 0 ? 'cd ..' : null;
	}

	// ── ls ────────────────────────────────────────────────────────────────────
	// ls appends / to show it's a directory
	if (verb === 'ls') {
		if (parsed.kind === 'root') {
			if (p.startsWith('music/')) {
				const slug = matchDir(getDirEntries('music', data), p.slice(6));
				return slug ? `ls music/${slug}` : null;
			}
			const dir = DIRS.find((d) => d.startsWith(p));
			return dir ? `ls ${dir}/` : null;
		}
		return null;
	}

	// ── open ─────────────────────────────────────────────────────────────────
	if (verb === 'open') {
		if (parsed.kind === 'root') {
			// open music/  →  open music/album/  →  open music/album/track.mp3
			if (p.startsWith('music/')) {
				const rest = p.slice(6);
				const slash2 = rest.indexOf('/');
				if (slash2 === -1) {
					// completing album slug (matchDir already adds trailing /)
					const slug = matchDir(getDirEntries('music', data), rest);
					return slug ? `open music/${slug}` : null;
				}
				// completing track
				const albumSlug = rest.slice(0, slash2);
				const trackPfx = rest.slice(slash2 + 1);
				const album = findAlbumBySlug(albumSlug, data.albums);
				if (!album) return null;
				const slug = matchEntry(getAlbumTracks(album._id, data.albums), trackPfx);
				return slug ? `open music/${albumSlug}/${slug}` : null;
			}
			// open projects/slug.proj  etc.
			if (p.includes('/')) {
				const slash = p.indexOf('/');
				const dirPart = p.slice(0, slash);
				const slugPfx = p.slice(slash + 1);
				if (isTopDir(dirPart)) {
					const slug = matchEntry(getDirEntries(dirPart as Dir, data), slugPfx);
					return slug ? `open ${dirPart}/${slug}` : null;
				}
			}
			// open <module>
			const key = Object.keys(MODULE_MAP).find((k) => k.startsWith(p));
			return key ? `open ${key}` : null;
		}

		if (parsed.kind === 'dir' && parsed.dir === 'music') {
			// complete album slug  (open lieb → open liebe-und-leben/)
			const slug = matchDir(getDirEntries('music', data), p);
			return slug ? `open ${slug}` : null;
		}
		if (parsed.kind === 'dir') {
			const slug = matchEntry(getDirEntries(parsed.dir, data), p);
			return slug ? `open ${slug}` : null;
		}
		if (parsed.kind === 'musicAlbum') {
			const slug = matchEntry(getAlbumTracks(parsed.albumId, data.albums), p);
			return slug ? `open ${slug}` : null;
		}
	}

	// ── cat  (dotfiles from ~, complete hidden filenames) ────────────────────
	if (verb === 'cat') {
		const key = Object.keys(DOTFILES).find((f) => f.startsWith(p) || f.startsWith('.' + p));
		return key ? `cat ${key}` : null;
	}

	return null;
}

// ── Command runner ─────────────────────────────────────────────────────────

export interface RunResult {
	lines: HistoryLine[];
	newCwd?: string;
	clearAll?: boolean;
	startHack?: boolean;
	startMatrix?: boolean;
	silent?: boolean; // skip append entirely (no history echo, no blank line)
}

function out(text: string): HistoryLine { return { kind: 'out', text }; }
function err(text: string): HistoryLine { return { kind: 'err', text }; }

export function runCommand(
	cmd: string,
	cwd: string,
	data: TerminalData,
	openModule: (key: string, extra?: Record<string, unknown>) => void
): RunResult {
	const trimmed = cmd.trim();
	const parts = trimmed.split(/\s+/);
	const head = (parts[0] ?? '').toLowerCase();
	const arg = parts.slice(1).join(' ');
	const { lang, albums } = data;
	const parsed = parseCwd(cwd);
	const promptStr = `${cwdLabel(cwd)}/$ `;
	const lines: HistoryLine[] = [{ kind: 'in', text: `${promptStr}${trimmed}` }];

	switch (head) {
		case 'help':
			if (arg.toLowerCase() === 'eggs') {
				lines.push(out(
					lang === 'de'
						? 'Versteckte Befehle:\n  neofetch              Systeminfo im neofetch-Stil\n  uname -a              Kernel-Version\n  sudo <anything>       Versuch es ruhig\n  matrix                Vollbild-Katakana-Regen (Strg+C beendet)\n  hack                  Filmreifer Hacking-Output\n  cowsay [text]         Eine Kuh spricht\n  think different       Apfel-Anspielung\n  ls -lha               Versteckte Dateien im Home-Verzeichnis\n  cat <dotfile>         Eine versteckte Datei lesen'
						: 'Hidden commands:\n  neofetch              System info in neofetch style\n  uname -a              Kernel version\n  sudo <anything>       Go ahead, try it\n  matrix                Fullscreen katakana rain (Ctrl+C to stop)\n  hack                  Cinematic hacking sequence\n  cowsay [text]         A cow speaks\n  think different       Apple reference\n  ls -lha               Hidden files in home directory\n  cat <dotfile>         Read a hidden file'
				));
			} else {
				lines.push(out(
					lang === 'de'
						? 'Befehle:\n  help                  Diese Liste\n  whoami                Kurzbiografie\n  ls [pfad]             Inhalte anzeigen\n  cd <ordner>           Verzeichnis wechseln\n  open <slug|programm>  Eintrag oder Programm oeffnen\n  neofetch              Systeminfo\n  lang [en|de]          Sprache wechseln\n  clear                 Bildschirm loeschen'
						: 'Commands:\n  help                  This list\n  whoami                Short bio\n  ls [path]             List contents\n  cd <dir>              Change directory\n  open <slug|program>   Open entry or program\n  neofetch              System info\n  lang [en|de]          Switch language\n  clear                 Clear screen'
				));
			}
			break;

		case 'whoami': {
			const { sysInfo } = data;
			const name = sysInfo?.fullname ?? sysInfo?.user ?? '-';
			const email = sysInfo?.email ?? '-';
			const prof = sysInfo?.profession
				? (lang === 'de' ? sysInfo.profession.de : sysInfo.profession.en) ?? '-'
				: '-';
			const avail = sysInfo?.available_for
				? (lang === 'de' ? sysInfo.available_for.de : sysInfo.available_for.en) ?? '-'
				: '-';
			lines.push(out(`${name} - ${email}\n${prof}\n${avail}`));
			break;
		}

		case 'ls': {
			const flags = arg.startsWith('-') ? arg.split(/\s+/)[0] : '';
			const lsArg = flags ? parts.slice(2).join(' ') : arg;

			if (flags && (flags.includes('a') || flags.includes('l') || flags.includes('h'))) {
				if (parsed.kind !== 'root') {
					lines.push(out(lang === 'de' ? '(Versteckte Dateien nur im Home-Verzeichnis. Tippe `cd ~` zurueck.)' : '(Hidden files are in the home directory. Type `cd ~` to go back.)'));
					break;
				}
				lines.push(out(
					`total 42\ndrwxr-xr-x  .\ndrwxr-xr-x  ..\n` +
					Object.keys(DOTFILES).map((f) => `-rw-r--r--  ${f}`).join('\n')
				));
				break;
			}

			if (lsArg) {
				// ls music/album-slug
				if (lsArg.startsWith('music/')) {
					const albumSlug = lsArg.slice(6).replace(/\/$/, '');
					const album = findAlbumBySlug(albumSlug, albums);
					if (!album) { lines.push(err(`ls: ${lsArg}: no such directory`)); break; }
					const tracks = getAlbumTracks(album._id, albums);
					lines.push(out(
						tracks.length === 0
							? '(no tracks)'
							: tracks.map((t) => `${t.date.padEnd(6)}  ${t.slug.padEnd(32)}  ${t.name}`).join('\n')
					));
					break;
				}
				// ls projects / ls writing / etc.
				if (isTopDir(lsArg)) {
					const entries = getDirEntries(lsArg as Dir, data);
					lines.push(out(
						entries.length === 0
							? (lang === 'de' ? '(keine Eintraege)' : '(no entries)')
							: entries.map((e) => `${e.date.padEnd(12)}  ${e.slug.padEnd(32)}  ${e.name}`).join('\n')
					));
					break;
				}
				lines.push(err(`ls: ${lsArg}: ${lang === 'de' ? 'kein solches Verzeichnis' : 'no such directory'}`));
				break;
			}

			// ls without arg, depends on cwd
			if (parsed.kind === 'root') {
				lines.push(out(DIRS.map((d) => `${d}/`).join('   ')));
			} else if (parsed.kind === 'dir') {
				if (parsed.dir === 'music') {
					const entries = getDirEntries('music', data);
					lines.push(out(
						entries.length === 0
							? (lang === 'de' ? '(keine Alben)' : '(no albums)')
							: entries.map((e) => `${e.date.padEnd(8)}  ${e.slug.padEnd(32)}  ${e.name}`).join('\n')
					));
				} else {
					const entries = getDirEntries(parsed.dir, data);
					lines.push(out(
						entries.length === 0
							? (lang === 'de' ? '(keine Eintraege)' : '(no entries)')
							: entries.map((e) => `${e.date.padEnd(12)}  ${e.slug.padEnd(32)}  ${e.name}`).join('\n')
					));
				}
			} else if (parsed.kind === 'musicAlbum') {
				const tracks = getAlbumTracks(parsed.albumId, albums);
				lines.push(out(
					tracks.length === 0
						? (lang === 'de' ? '(keine Tracks)' : '(no tracks)')
						: tracks.map((t) => `${t.date.padEnd(8)}  ${t.slug.padEnd(32)}  ${t.name}`).join('\n')
				));
			}
			break;
		}

		case 'cd': {
			const target = arg.trim().replace(/\/$/, '');
			if (!target || target === '~') return { lines, newCwd: '~' };
			if (target === '..' || target === '../') {
				return { lines, newCwd: parsed.kind === 'musicAlbum' ? 'music' : '~' };
			}
			// cd music/album-slug from root
			if (target.startsWith('music/') && parsed.kind === 'root') {
				const albumSlug = target.slice(6).replace(/\/$/, '');
				const album = findAlbumBySlug(albumSlug, albums);
				if (!album) { lines.push(err(`cd: ${target}: no such directory`)); return { lines }; }
				return { lines, newCwd: makeMusicAlbumCwd(album) };
			}
			if (parsed.kind === 'root' && isTopDir(target)) {
				return { lines, newCwd: target };
			}
			if (parsed.kind === 'dir' && parsed.dir === 'music') {
				const album = findAlbumBySlug(target, albums);
				if (!album) { lines.push(err(`cd: ${target}: no such directory`)); return { lines }; }
				return { lines, newCwd: makeMusicAlbumCwd(album) };
			}
			lines.push(err(`cd: ${target}: ${lang === 'de' ? 'kein solches Verzeichnis' : 'no such directory'}`));
			return { lines };
		}

		case 'open': {
			// from root with slash path
			if (parsed.kind === 'root' && arg.includes('/')) {
				const firstSlash = arg.indexOf('/');
				const dirPart = arg.slice(0, firstSlash);
				const rest = arg.slice(firstSlash + 1);
				if (dirPart === 'music') {
					const secondSlash = rest.indexOf('/');
					if (secondSlash === -1) {
						// open music/album-slug  → open album
						const album = findAlbumBySlug(rest.replace(/\/$/, ''), albums);
						if (!album) { lines.push(err(`open: ${arg}: not found`)); break; }
						openModule('media', { initialAlbumId: album._id });
						lines.push(out(`-> media: ${album.title}`));
					} else {
						const albumSlug = rest.slice(0, secondSlash);
						const trackSlug = rest.slice(secondSlash + 1);
						const album = findAlbumBySlug(albumSlug, albums);
						if (!album) { lines.push(err(`open: ${arg}: not found`)); break; }
						const track = findAlbumTrackBySlug(album._id, trackSlug, albums);
						if (!track) { lines.push(err(`open: ${arg}: track not found`)); break; }
						openModule('media', { initialTrackKey: track.id });
						lines.push(out(`-> media: ${track.name}`));
					}
					break;
				}
				if (isTopDir(dirPart)) {
					const entry = findEntryBySlug(dirPart as Dir, rest, data);
					if (!entry) { lines.push(err(`open: ${arg}: not found`)); break; }
					openModule(DIR_MODULE[dirPart as Dir], { initialId: entry.id });
					lines.push(out(`-> ${DIR_MODULE[dirPart as Dir]}: ${entry.name}`));
					break;
				}
			}

			if (parsed.kind === 'root') {
				const target = MODULE_MAP[arg.toLowerCase()];
				if (target) {
					openModule(target);
					lines.push(out(`-> ${target}`));
				} else {
					lines.push(err(`open: ${arg || '?'}: ${lang === 'de' ? 'unbekanntes Programm' : 'unknown program'}`));
				}
			} else if (parsed.kind === 'dir' && parsed.dir === 'music') {
				const album = findAlbumBySlug(arg.replace(/\/$/, ''), albums);
				if (!album) { lines.push(err(`open: ${arg}: not found`)); break; }
				openModule('media', { initialAlbumId: album._id });
				lines.push(out(`-> media: ${album.title}`));
			} else if (parsed.kind === 'dir') {
				const entry = findEntryBySlug(parsed.dir, arg, data);
				if (!entry) { lines.push(err(`open: ${arg}: not found`)); break; }
				openModule(DIR_MODULE[parsed.dir], { initialId: entry.id });
				lines.push(out(`-> ${DIR_MODULE[parsed.dir]}: ${entry.name}`));
			} else if (parsed.kind === 'musicAlbum') {
				const track = findAlbumTrackBySlug(parsed.albumId, arg, albums);
				if (!track) { lines.push(err(`open: ${arg}: not found`)); break; }
				openModule('media', { initialTrackKey: track.id });
				lines.push(out(`-> media: ${track.name}`));
			}
			break;
		}

		case 'cat': {
			const file = arg.trim();
			const content = readDotfile(file);
			lines.push(content !== undefined
				? out(content)
				: err(`cat: ${file}: ${lang === 'de' ? 'Datei nicht gefunden' : 'No such file or directory'}`)
			);
			break;
		}

		case 'lang':
			if (typeof window !== 'undefined' && (arg === 'en' || arg === 'de')) {
				window.dispatchEvent(new CustomEvent('retro-os:setlang', { detail: arg }));
				lines.push(out(`lang -> ${arg}`));
			} else {
				lines.push(out(lang));
			}
			break;

		case 'clear':
			return { lines: [], clearAll: true, newCwd: '~' };

		// ── Easter eggs ───────────────────────────────────────────────────────

		case 'neofetch':
			lines.push(out(buildNeofetch(data.sysInfo)));
			break;

		case 'uname':
			lines.push(out('RetroOS msh 1.0.0 #1 SMP Mon Jan 01 00:00:00 UTC 1984 x86_msh'));
			break;

		case 'sudo':
			lines.push(err('sudo: Permission denied. Nice try.'));
			break;

		case 'matrix':
			return { lines, startMatrix: true };

		case 'hack':
			return { lines, startHack: true };

		case 'cowsay': {
			const quote = arg || (lang === 'de' ? 'Muh.' : 'Moo.');
			const bar = '-'.repeat(quote.length + 2);
			lines.push(out([
				` ${bar}`,
				`< ${quote} >`,
				` ${bar}`,
				`        \\   ^__^`,
				`         \\  (oo)\\_______`,
				`            (__)\\       )\\/\\`,
				`                ||----w |`,
				`                ||     ||`
			].join('\n')));
			break;
		}

		case 'think':
			if (arg.toLowerCase() === 'different') {
				lines.push(out(
					lang === 'de'
						? '"Denk anders." - Irgendeine Firma, 1997\n(Dieser Rechner laeuft auf SvelteKit. Nah dran.)'
						: '"Think different." - Some company, 1997\n(This machine runs on SvelteKit. Close enough.)'
				));
			} else {
				lines.push(err(`${head} ${arg}: ${lang === 'de' ? 'Befehl nicht gefunden' : 'command not found'}`));
			}
			break;

		case '~':
			// silent shorthand for cd ~ — no echo, no blank line
			return { lines: [], newCwd: '~', silent: true };

		default:
			lines.push(err(`${head}: ${lang === 'de' ? 'Befehl nicht gefunden' : 'command not found'}`));
	}

	return { lines };
}
