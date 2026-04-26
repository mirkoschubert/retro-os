import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		VitePWA({
			registerType: 'autoUpdate',
			strategies: 'generateSW',
			injectRegister: 'auto',
			manifest: {
				name: 'RetroOS - Mirko Schubert',
				short_name: 'RetroOS',
				description: 'Personal portfolio of Mirko Schubert - a retro-inspired creative OS',
				theme_color: '#1a1c20',
				background_color: '#1a1c20',
				display: 'standalone',
				orientation: 'any',
				scope: '/',
				start_url: '/',
				icons: [
					{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{ src: 'pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
				],
				screenshots: [
					{ src: 'screenshot-wide.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'RetroOS Desktop' },
					{ src: 'screenshot-mobile.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'RetroOS Mobile' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,svg,png,woff,woff2}'],
				navigateFallback: null,
				runtimeCaching: [
					{
						// Sanity image CDN
						urlPattern: /^https:\/\/cdn\.sanity\.io\/images\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'sanity-images',
							expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					},
					{
						// Sanity file CDN (audio, PDFs, etc.)
						urlPattern: /^https:\/\/cdn\.sanity\.io\/files\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'sanity-audio',
							expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
							rangeRequests: true
						}
					},
					{
						// Sanity GROQ API
						urlPattern: /^https:\/\/[a-z0-9]+\.api\.sanity\.io\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'sanity-api',
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
							networkTimeoutSeconds: 10
						}
					}
				]
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
