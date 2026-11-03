/** Datenschutz-Schalter, nur lokal gespeichert. Touren sind personenbezogen und standardmäßig aus. */
const KEY = 'resch-tour-enabled';
class Privacy {
	tours = $state(false);
	constructor() {
		try { this.tours = localStorage.getItem(KEY) === '1'; } catch { /* aus */ }
	}
	setTours(v: boolean) {
		this.tours = v;
		try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* ignorieren */ }
	}
}
export const privacy = new Privacy();
