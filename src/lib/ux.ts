/** Gemeinsame Typen für Seitenkopf, Instrumentenleiste und „Nächster Schritt“. */
export type Instrument =
	| { kind: 'gauge'; label: string; value: number; shown?: number; sub?: string; good?: number; warn?: number; href?: string }
	| { kind: 'stat'; label: string; value: string; sub?: string; tone?: 'danger' | 'warn' | 'success' | ''; href?: string };

export interface NextStep {
	/** danger = dringend, warn = wichtig, info = Hinweis, ok = alles im Griff */
	tone: 'danger' | 'warn' | 'info' | 'ok';
	text: string;
	cta?: { label: string; href?: string; onclick?: () => void };
}
