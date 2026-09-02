import { error, json } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config.runtime';
import { createAdminSupabase } from '$lib/server/db/admin';
import { authorizeCron, jobsFor, runJobs } from '$lib/server/domain/cron';
import type { RequestHandler } from './$types';

/**
 * Called by workers/cron on each Cron Trigger. The shared secret is the only authentication —
 * there is no user here, so the service-role client is correct. Which jobs run is decided by
 * domain/cron.ts from the cron expression; every job is an idempotent SQL function.
 */
export const POST: RequestHandler = async ({ request }) => {
	if (!authorizeCron(request.headers.get('authorization'), getConfig().cronSharedSecret)) {
		error(401, 'Unauthorized');
	}
	const body = (await request.json().catch(() => ({}))) as { cron?: string };
	const jobs = jobsFor(String(body.cron ?? ''));
	const results = await runJobs(createAdminSupabase(), jobs);
	return json({ cron: body.cron ?? null, results });
};
