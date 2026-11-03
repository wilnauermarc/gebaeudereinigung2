/** Porträtfotos (Unsplash, lokal in /static/people). Reihenfolge ist fest, damit dieselbe Person immer dasselbe Foto bekommt. */
export const PHOTO_IDS = ['anetta', 'maria', 'jana', 'aylin', 'fatma', 'olga', 'sven', 'tomasz', 'lukas', 'marek', 'piotr', 'robin', 'kim'] as const;
export type PhotoId = (typeof PHOTO_IDS)[number];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Foto für einen Namen: gewählte Zuordnung, sonst gleichnamiges Foto (Vorname), sonst stabil aus dem Namen. */
export function photoFor(name: string, override?: string): PhotoId {
	if (override && (PHOTO_IDS as readonly string[]).includes(override)) return override as PhotoId;
	const first = name.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
	if ((PHOTO_IDS as readonly string[]).includes(first)) return first as PhotoId;
	return PHOTO_IDS[hash(name.trim().toLowerCase()) % PHOTO_IDS.length];
}
