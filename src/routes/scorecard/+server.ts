import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** The short address a coach types on a phone. The target is guarded; this is not. */
export const GET: RequestHandler = () => {
	redirect(303, '/coach/scorecards');
};
