/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
/**
 * Offline-Fähigkeit: App-Hülle und Programmdateien werden beim ersten Besuch zwischengespeichert.
 * Die Daten selbst liegen ohnehin im Browser (localStorage), die App startet also auch ohne Netz.
 * Nicht zwischengespeichert: Kartenkacheln (OpenStreetMap) und alles von anderen Hosts.
 */
import { immutable, assets } from '$app/manifest';
import { dev, version } from '$app/environment';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `resch-${version}`;
const abs = (p: string) => (p.startsWith('/') ? p : '/' + p);
const ASSETS = [...immutable.map((x) => abs(x.path)), ...assets.map((x) => abs(x.path)), '/'];

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => sw.skipWaiting()));
});
sw.addEventListener('activate', (event) => {
	event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => sw.clients.claim()));
});
sw.addEventListener('fetch', (event) => {
	const req = event.request;
	const url = new URL(req.url);
	// In der Entwicklung nichts abfangen, sonst liefert der Zwischenspeicher veraltete Module
	if (dev || req.method !== 'GET' || url.origin !== sw.location.origin) return;
	// Seitenaufrufe: erst Netz, ohne Netz die zwischengespeicherte App-Hülle
	if (req.mode === 'navigate') {
		event.respondWith(fetch(req).catch(async () => (await caches.match('/')) ?? Response.error()));
		return;
	}
	// Programmdateien und Bilder: erst Zwischenspeicher
	event.respondWith(caches.match(req).then((hit) => hit ?? fetch(req).then((res) => { if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone())); return res; })));
});
