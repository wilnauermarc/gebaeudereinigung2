/** Svelte-Action: hängt das Element direkt an <body>, damit Druckansichten unabhängig vom App-Layout sind. */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return { destroy() { node.remove(); } };
}
