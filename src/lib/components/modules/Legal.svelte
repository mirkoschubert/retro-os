<script lang="ts">
	import { systemStore } from '$lib/stores/system.svelte.js';
	import { getMessages } from '$lib/i18n.js';

	interface Props {
		initialTab?: 'impressum' | 'datenschutz';
		winId?: string;
	}

	const { initialTab = 'impressum' }: Props = $props();

	const lang = $derived(systemStore.lang);
	const t = $derived(getMessages(lang));

	let activeTab = $state<'impressum' | 'datenschutz'>('impressum');

	$effect(() => {
		activeTab = initialTab;
	});
</script>

<div class="legal-wrap">
	<div class="legal-tabs">
		<button
			class="legal-tab"
			class:is-active={activeTab === 'impressum'}
			onclick={() => (activeTab = 'impressum')}
		>
			{t.legal_impressum()}
		</button>
		<button
			class="legal-tab"
			class:is-active={activeTab === 'datenschutz'}
			onclick={() => (activeTab = 'datenschutz')}
		>
			{t.legal_datenschutz()}
		</button>
	</div>

	<div class="legal-body">
		{#if activeTab === 'impressum'}
			{#if lang === 'de'}
				<h2>Impressum</h2>
				<p>Angaben gemäß §5 DDG</p>

				<h3>Verantwortlich</h3>
				<p>
					Mirko Schubert<br />
					<!-- TODO: Straße und Hausnummer --><br />
					<!-- TODO: PLZ und Stadt --><br />
					Deutschland
				</p>

				<h3>Kontakt</h3>
				<p>
					E-Mail: <a href="mailto:office@mirkoschubert.de">office@mirkoschubert.de</a>
				</p>

				<h3>Hinweis zur Online-Streitbeilegung</h3>
				<p>
					Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
					<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
						ec.europa.eu/consumers/odr
					</a>.<br />
					Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
				</p>

				<h3>Haftung für Inhalte</h3>
				<p>
					Als Diensteanbieter bin ich gemäß §7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach
					den allgemeinen Gesetzen verantwortlich. Nach §§8 bis 10 TMG bin ich als Diensteanbieter
					jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
					überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
					hinweisen.
				</p>

				<h3>Urheberrecht</h3>
				<p>
					Die durch mich erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
					Urheberrecht. Alle Rechte vorbehalten.
				</p>
			{:else}
				<h2>Imprint</h2>
				<p>Information according to §5 DDG (German Digital Services Act)</p>

				<h3>Responsible</h3>
				<p>
					Mirko Schubert<br />
					<!-- TODO: Street and number --><br />
					<!-- TODO: ZIP and city --><br />
					Germany
				</p>

				<h3>Contact</h3>
				<p>
					Email: <a href="mailto:office@mirkoschubert.de">office@mirkoschubert.de</a>
				</p>

				<p class="legal-note">
					This imprint is governed by German law. The authoritative version is available on
					mirkoschubert.de (German).
				</p>
			{/if}
		{:else}
			{#if lang === 'de'}
				<h2>Datenschutzerklärung</h2>

				<h3>Verantwortlicher</h3>
				<p>Mirko Schubert, office@mirkoschubert.de</p>

				<h3>Erhobene Daten</h3>
				<p>
					Diese Website erhebt keine personenbezogenen Daten über Formulare oder Tracking-Skripte.
					Beim Aufruf der Seite werden serverseitig temporäre Zugriffsprotokolle durch den
					Hosting-Anbieter (Vercel Inc.) erstellt. Diese enthalten IP-Adresse, Zeitstempel,
					angefragte URL und Browser-Kennung und werden automatisch nach kurzer Zeit gelöscht.
				</p>

				<h3>Hosting</h3>
				<p>
					Diese Website wird gehostet von Vercel Inc., 340 Pine Street, Suite 603, San Francisco,
					CA 94104, USA. Vercel kann im Rahmen der Verarbeitung Zugriffsdaten erheben. Weitere
					Informationen: <a
						href="https://vercel.com/legal/privacy-policy"
						target="_blank"
						rel="noopener noreferrer">vercel.com/legal/privacy-policy</a
					>.
				</p>

				<h3>Inhalte aus Sanity</h3>
				<p>
					Portfolio-Inhalte werden über die API von Sanity Inc. (San Francisco, USA) bereitgestellt.
					Es werden keine personenbezogenen Daten von Besuchern an Sanity übermittelt.
				</p>

				<h3>Keine Cookies, kein Tracking</h3>
				<p>
					Diese Website setzt keine Tracking-Cookies und verwendet keine Analyse-Dienste (kein
					Google Analytics, kein Matomo o.ä.). Im localStorage des Browsers werden
					Benutzereinstellungen gespeichert (Sprache, Theme, Fensterzustand). Diese Daten verlassen
					das Gerät nicht.
				</p>

				<h3>Rechte der Nutzer</h3>
				<p>
					Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung
					deiner Daten sowie das Recht auf Datenübertragbarkeit. Kontakt: office@mirkoschubert.de
				</p>

				<h3>Beschwerderecht</h3>
				<p>
					Du hast das Recht, dich bei einer Aufsichtsbehörde zu beschweren. In NRW ist dies die
					Landesbeauftragte für Datenschutz und Informationsfreiheit (LDI NRW).
				</p>
			{:else}
				<h2>Privacy Policy</h2>

				<h3>Controller</h3>
				<p>Mirko Schubert, office@mirkoschubert.de</p>

				<h3>Data collected</h3>
				<p>
					This website does not collect personal data through forms or tracking scripts. The hosting
					provider (Vercel Inc.) creates temporary server-side access logs containing IP address,
					timestamp, requested URL, and browser identifier. These are deleted automatically after a
					short period.
				</p>

				<h3>Hosting</h3>
				<p>
					This website is hosted by Vercel Inc., 340 Pine Street, Suite 603, San Francisco, CA
					94104, USA. See their privacy policy:
					<a
						href="https://vercel.com/legal/privacy-policy"
						target="_blank"
						rel="noopener noreferrer">vercel.com/legal/privacy-policy</a
					>.
				</p>

				<h3>Content via Sanity</h3>
				<p>
					Portfolio content is delivered via the API of Sanity Inc. (San Francisco, USA). No visitor
					data is transmitted to Sanity.
				</p>

				<h3>No cookies, no tracking</h3>
				<p>
					This website sets no tracking cookies and uses no analytics services. User preferences
					(language, theme, window state) are stored in the browser's localStorage and never leave
					your device.
				</p>

				<h3>Your rights</h3>
				<p>
					You have the right to access, rectify, delete, and restrict processing of your data.
					Contact: office@mirkoschubert.de
				</p>

				<p class="legal-note">
					The authoritative version of this privacy policy is available in German on mirkoschubert.de.
				</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	.legal-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--bg-1);
		overflow: hidden;
	}

	.legal-tabs {
		display: flex;
		border-bottom: 1px solid var(--border);
		padding: 0 16px;
		gap: 2px;
		flex-shrink: 0;
	}

	.legal-tab {
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-2);
		font-family: var(--font-ui);
		font-size: 11.5px;
		padding: 8px 12px 7px;
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
		margin-bottom: -1px;
	}

	.legal-tab:hover {
		color: var(--text-0);
	}

	.legal-tab.is-active {
		color: var(--text-0);
		border-bottom-color: var(--accent);
	}

	.legal-body {
		flex: 1;
		overflow-y: auto;
		padding: 20px 28px 28px;
		font-size: 12.5px;
		line-height: 1.7;
		color: var(--text-1);
	}

	.legal-body h2 {
		font-family: var(--font-ui);
		font-size: 14px;
		font-weight: 600;
		color: var(--text-0);
		margin: 0 0 16px;
	}

	.legal-body h3 {
		font-family: var(--font-ui);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-2);
		margin: 20px 0 6px;
	}

	.legal-body p {
		margin: 0 0 8px;
	}

	.legal-body a {
		color: var(--accent);
		text-decoration: none;
	}

	.legal-body a:hover {
		text-decoration: underline;
	}

	.legal-note {
		margin-top: 16px;
		padding: 10px 14px;
		border-left: 2px solid var(--border);
		color: var(--text-2);
		font-size: 11.5px;
	}
</style>
