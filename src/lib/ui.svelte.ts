/** Rolle und Basismodus: bestimmen nur, welche Bereiche in der Navigation stehen. KEIN Zugriffsschutz (ohne Backend gibt es keine Anmeldung). */
export type Role = 'inhaber' | 'buero' | 'objektleitung';
export const roleLabels: Record<Role, string> = { inhaber: 'Inhaberin', buero: 'Büro', objektleitung: 'Objektleitung' };

const OFFICE = ['/', '/aufgaben', '/fristen', '/vorgaenge', '/kunden', '/angebote', '/kalkulator', '/vertraege', '/ausschreibung', '/projektzeitliste', '/rechnungen', '/e-rechnung', '/einsatzplan', '/karte', '/zeiten', '/maengel', '/team', '/schluessel', '/material', '/nachweise', '/leistungsnachweis', '/zusatzleistungen'];
const FIELD = ['/', '/aufgaben', '/einsatzplan', '/karte', '/zeiten', '/leistungsnachweis', '/begehungen', '/maengel', '/schluessel', '/material', '/team'];
/** Basismodus: nur das, was im Alltag täglich gebraucht wird */
const BASIC = ['/', '/aufgaben', '/kunden', '/angebote', '/rechnungen', '/einsatzplan', '/zeiten', '/maengel'];

export type Palette = 'orange' | 'gelb' | 'blau' | 'gruen' | 'eigen';
export const palettes: { id: Palette; label: string; hint: string; swatch: [string, string] }[] = [
	{ id: 'gelb', label: 'Sonnengelb', hint: 'Standard', swatch: ['#ffc41a', '#15171a'] },
	{ id: 'orange', label: 'Signalorange', hint: 'Kräftig', swatch: ['#d95a14', '#2a2d32'] },
	{ id: 'blau', label: 'Stahlblau', hint: 'Ruhig und sachlich', swatch: ['#1f63d6', '#1d2530'] },
	{ id: 'gruen', label: 'Petrolgrün', hint: 'Frisch', swatch: ['#178a6a', '#1f2a27'] },
	{ id: 'eigen', label: 'Eigene Farbe', hint: 'Akzent frei wählen', swatch: ['#8a4fff', '#2a2d32'] }
];
const KEY = 'resch-ui-mode';
const hex = /^#[0-9a-f]{6}$/i;
/** Weiß oder Dunkel als Schrift auf einer Akzentfarbe, je nach Helligkeit (WCAG-Luminanz) */
export function inkFor(color: string): string {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#1a1c1f' : '#ffffff';
}
const VARS = ['--accent-text', '--accent', '--accent-hover', '--accent-soft', '--accent-ink', '--hero-glow', '--side-active'];
/** Setzt die Farbwelt am <html>-Element. Eine eigene Farbe wird über Inline-Variablen abgeleitet. */
export function applyPalette(p: Palette, custom: string) {
	const root = document.documentElement;
	VARS.forEach((v) => root.style.removeProperty(v));
	if (p === 'gelb') root.removeAttribute('data-palette'); else root.setAttribute('data-palette', p);
	if (p === 'eigen' && hex.test(custom)) {
		const rgb = [1, 3, 5].map((i) => parseInt(custom.slice(i, i + 2), 16)).join(' ');
		root.style.setProperty('--accent', custom);
		root.style.setProperty('--accent-text', inkFor(custom) === '#ffffff' ? custom : `color-mix(in srgb, ${custom} 45%, black)`);
		root.style.setProperty('--accent-hover', `color-mix(in srgb, ${custom} 82%, black)`);
		root.style.setProperty('--accent-soft', `color-mix(in srgb, ${custom} 14%, ${root.dataset.theme === 'dark' ? '#181b1e' : 'white'})`);
		root.style.setProperty('--accent-ink', inkFor(custom));
		root.style.setProperty('--hero-glow', rgb);
		root.style.setProperty('--side-active', `rgb(${rgb} / 0.26)`);
	}
}
class UiMode {
	role = $state<Role>('inhaber');
	basic = $state(false);
	palette = $state<Palette>('gelb');
	custom = $state('#8a4fff');
	constructor() {
		try {
			const p = JSON.parse(localStorage.getItem(KEY) ?? '{}');
			if (p.role in roleLabels) this.role = p.role;
			this.basic = !!p.basic;
			// Ältere Speicherstände (vor Version 2) hatten Orange als Voreinstellung: auf das neue Standard-Gelb umstellen
			if (palettes.some((x) => x.id === p.palette) && !(p.palette === 'orange' && p.v !== 2)) this.palette = p.palette;
			if (hex.test(p.custom ?? '')) this.custom = p.custom;
		} catch { /* Standard */ }
	}
	setPalette(p: Palette) { this.palette = p; applyPalette(p, this.custom); this.save(); }
	setCustom(c: string) { this.custom = c; if (this.palette === 'eigen') applyPalette('eigen', c); this.save(); }
	save() { try { localStorage.setItem(KEY, JSON.stringify({ v: 2, role: this.role, basic: this.basic, palette: this.palette, custom: this.custom })); } catch { /* ignorieren */ } }
	allows(href: string): boolean {
		if (this.basic && !BASIC.includes(href)) return false;
		if (this.role === 'inhaber') return true;
		return (this.role === 'buero' ? OFFICE : FIELD).includes(href);
	}
}
export const ui = new UiMode();
