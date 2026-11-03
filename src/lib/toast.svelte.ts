export interface Toast {
	id: number;
	text: string;
	tone: 'default' | 'success' | 'error';
	action?: { label: string; run: () => void };
}
class Toasts {
	list = $state<Toast[]>([]);
	#n = 0;
	push(text: string, opts: { tone?: Toast['tone']; action?: Toast['action']; ms?: number } = {}) {
		const t: Toast = { id: ++this.#n, text, tone: opts.tone ?? 'default', action: opts.action };
		this.list.push(t);
		setTimeout(() => this.dismiss(t.id), opts.ms ?? 6000);
	}
	dismiss(id: number) {
		this.list = this.list.filter((t) => t.id !== id);
	}
}
export const toasts = new Toasts();
