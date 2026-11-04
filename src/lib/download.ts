/** Startet den Download einer Datei aus dem Speicher (kein Server nötig). */
export function downloadBytes(bytes: Uint8Array | string, filename: string, type: string) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export function toCsv(rows: string[][]) {
	return '﻿' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
}

/** Kalenderdatei (.ics) für einen Termin, damit er in Outlook, Apple Kalender oder Google übernommen werden kann. */
export function downloadIcs(o: { title: string; startIso: string; minutes?: number; description?: string; filename: string }) {
	const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
	const start = new Date(o.startIso);
	const end = new Date(start.getTime() + (o.minutes ?? 60) * 60000);
	const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
	const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Putzbetrieb//DE', 'BEGIN:VEVENT', `UID:${crypto.randomUUID()}@putzbetrieb`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${esc(o.title)}`, ...(o.description ? [`DESCRIPTION:${esc(o.description)}`] : []), 'END:VEVENT', 'END:VCALENDAR'];
	downloadBytes(lines.join('\r\n'), o.filename, 'text/calendar;charset=utf-8');
}
