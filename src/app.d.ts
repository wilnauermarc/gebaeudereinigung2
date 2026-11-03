import type { SessionUser } from '$lib/server/store';
declare global {
	namespace App {
		interface Locals { user: SessionUser | null }
	}
}
export {};
