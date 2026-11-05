/**
 * Lizenz einer Installation (nur der Betreiber setzt sie, über Umgebungsvariablen; die App selbst kann sie nicht ändern):
 *   LICENSE_PLAN         einfach | standard | alles
 *   LICENSE_TRIAL_UNTIL  JJJJ-MM-TT: Ende der Testphase (30 Tage, alle Bausteine)
 *   LICENSE_PAID_UNTIL   JJJJ-MM-TT: bezahlt bis
 *   DEMO=1               öffentliche Demo: erfundene Daten, nur lesend, schmaler Funktionsumfang
 * Ohne jede dieser Angaben läuft die Installation als Eigenbetrieb ohne Begrenzung.
 */
import { MODULE_IDS, type ModuleId } from '../modules.ts';
import { planModules, type PlanId } from '../pricing.ts';
import { tenantScope } from './store.ts';

export type LicenseStatus = 'eigenbetrieb' | 'test' | 'aktiv' | 'abgelaufen' | 'demo';
/** Bausteine der Demo: Heute, Vorgänge, Einsatzplan, Leistungsnachweis, Leitstand, Mitarbeiter-Ansicht */
export const DEMO_MODULES: ModuleId[] = ['stamm', 'verkauf', 'einsatz', 'zeiten', 'mitarbeiter', 'nachweis', 'steuerung'];
export interface LicenseInfo { status: LicenseStatus; plan: PlanId; trialUntil: string | null; paidUntil: string | null; daysLeft: number | null; allowed: ModuleId[] }
type Env = Record<string, string | undefined>;

const day = (s: string | undefined) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400_000);

export function licenseInfo(today: string, env: Env = tenantScope.getStore()?.env ?? process.env): LicenseInfo {
	if (env.DEMO === '1') return { status: 'demo', plan: 'alles', trialUntil: null, paidUntil: null, daysLeft: null, allowed: [...DEMO_MODULES] };
	const plan = (['einfach', 'standard', 'alles'] as const).find((p) => p === env.LICENSE_PLAN?.trim().toLowerCase()) ?? null;
	const trialUntil = day(env.LICENSE_TRIAL_UNTIL), paidUntil = day(env.LICENSE_PAID_UNTIL);
	if (!plan && !trialUntil && !paidUntil) return { status: 'eigenbetrieb', plan: 'alles', trialUntil: null, paidUntil: null, daysLeft: null, allowed: [...MODULE_IDS] };
	const shown: PlanId = plan ?? 'standard';
	if (paidUntil && paidUntil >= today) return { status: 'aktiv', plan: shown, trialUntil, paidUntil, daysLeft: daysBetween(today, paidUntil), allowed: [...planModules(shown)] };
	if (trialUntil && trialUntil >= today) return { status: 'test', plan: shown, trialUntil, paidUntil, daysLeft: daysBetween(today, trialUntil), allowed: [...MODULE_IDS] };
	return { status: 'abgelaufen', plan: shown, trialUntil, paidUntil, daysLeft: null, allowed: [...planModules(shown)] };
}
