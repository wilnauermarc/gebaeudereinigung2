<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as L from 'leaflet';

	export interface MapMarker {
		id: string;
		lat: number;
		lon: number;
		/** Zahl im Marker (z. B. Reihenfolge der Tour) oder leer für einen Punkt */
		label?: string;
		color: string;
		/** Rahmen in Warnfarbe, z. B. für unbesetzte Einsätze */
		alert?: boolean;
		shape?: 'dot' | 'diamond';
		title: string;
		/** HTML für das Popup (nur eigene, bereits maskierte Inhalte) */
		popup?: string;
	}

	let {
		markers,
		route = null,
		tiles = false,
		selectedId = null,
		pickMode = false,
		circles = [],
		onselect,
		onpick
	}: {
		markers: MapMarker[];
		route?: [number, number][] | null;
		tiles?: boolean;
		selectedId?: string | null;
		pickMode?: boolean;
		/** Kreise um Punkte, z. B. der Radius des Standort-Abgleichs beim Stempeln */
		circles?: { lat: number; lon: number; radiusM: number; color: string; label?: string }[];
		onselect?: (id: string) => void;
		onpick?: (lat: number, lon: number) => void;
	} = $props();

	let el: HTMLDivElement;
	let leaflet: typeof L | undefined;
	let map: L.Map | undefined;
	let tileLayer: L.TileLayer | undefined;
	let markerLayer: L.LayerGroup | undefined;
	let routeLayer: L.LayerGroup | undefined;
	let circleLayer: L.LayerGroup | undefined;
	const byId = new Map<string, L.Marker>();
	let ready = $state(false);
	let fitKey = '';

	onMount(() => {
		let cancelled = false;
		(async () => {
			const mod = await import('leaflet');
			if (cancelled) return;
			leaflet = (mod as any).default ?? mod;
			map = leaflet!.map(el, { zoomControl: true, attributionControl: true }).setView([49.45, 11.08], 11);
			markerLayer = leaflet!.layerGroup().addTo(map);
			routeLayer = leaflet!.layerGroup().addTo(map);
			circleLayer = leaflet!.layerGroup().addTo(map);
			map.on('click', (e: L.LeafletMouseEvent) => { if (pickRef) onpick?.(e.latlng.lat, e.latlng.lng); });
			ready = true;
		})();
		return () => { cancelled = true; map?.remove(); };
	});

	let pickRef = false;
	$effect(() => {
		pickRef = pickMode;
		if (el) el.style.cursor = pickMode ? 'crosshair' : '';
	});

	// Kartenhintergrund nur auf ausdrücklichen Wunsch laden (dabei erfährt der Kartendienst die IP-Adresse und den Ausschnitt)
	$effect(() => {
		if (!ready || !map || !leaflet) return;
		if (tiles && !tileLayer) {
			tileLayer = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap-Mitwirkende', referrerPolicy: 'strict-origin-when-cross-origin' }).addTo(map);
		} else if (!tiles && tileLayer) {
			tileLayer.remove();
			tileLayer = undefined;
		}
	});

	const icon = (m: MapMarker, selected: boolean) => {
		const size = m.label ? 30 : 18;
		const border = m.alert ? 'var(--danger)' : '#fff';
		const radius = m.shape === 'diamond' ? '4px' : '50%';
		const rot = m.shape === 'diamond' ? 'rotate(45deg)' : 'none';
		const inner = m.label ? `<span style="transform:${m.shape === 'diamond' ? 'rotate(-45deg)' : 'none'};display:block">${m.label}</span>` : '';
		return leaflet!.divIcon({
			className: '',
			iconSize: [size, size],
			iconAnchor: [size / 2, size / 2],
			html: `<div style="width:${size}px;height:${size}px;background:${m.color};border:${m.alert ? 3 : 2}px solid ${border};border-radius:${radius};transform:${rot};display:grid;place-items:center;color:#fff;font:700 12px Inter,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.45);${selected ? 'outline:3px solid var(--accent);outline-offset:2px;' : ''}">${inner}</div>`
		});
	};

	$effect(() => {
		if (!ready || !map || !leaflet || !markerLayer || !routeLayer) return;
		markerLayer.clearLayers();
		routeLayer.clearLayers();
		byId.clear();
		for (const m of markers) {
			const mk = leaflet.marker([m.lat, m.lon], { icon: icon(m, m.id === selectedId), title: m.title, keyboard: true });
			if (m.popup) mk.bindPopup(m.popup);
			mk.on('click', () => onselect?.(m.id));
			mk.addTo(markerLayer);
			byId.set(m.id, mk);
		}
		if (route && route.length > 1) {
			leaflet.polyline(route, { color: '#e6a100', weight: 5, opacity: 0.85, dashArray: '8 8' }).addTo(routeLayer);
		}
		// Ausschnitt nur anpassen, wenn sich die Menge der Punkte ändert (nicht bei jeder Auswahl)
		const key = markers.map((m) => m.id).join(',');
		if (key !== fitKey) {
			fitKey = key;
			if (markers.length) map.fitBounds(leaflet.latLngBounds(markers.map((m) => [m.lat, m.lon] as [number, number])), { padding: [50, 50], maxZoom: 15 });
		}
	});

	$effect(() => {
		if (!ready || !leaflet || !circleLayer) return;
		circleLayer.clearLayers();
		for (const c of circles) {
			const k = leaflet.circle([c.lat, c.lon], { radius: c.radiusM, color: c.color, weight: 2, fillOpacity: 0.12, interactive: false });
			if (c.label) k.bindTooltip(c.label, { permanent: false });
			k.addTo(circleLayer);
		}
	});

	$effect(() => {
		if (!ready || !map || !selectedId) return;
		const mk = byId.get(selectedId);
		if (mk) { map.flyTo(mk.getLatLng(), Math.max(map.getZoom(), 14), { duration: 0.5 }); mk.openPopup(); }
	});
</script>

<div bind:this={el} class="size-full min-h-[320px] rounded-xl bg-subtle" role="application" aria-label="Karte"></div>
