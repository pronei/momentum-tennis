/// <reference types="@cloudflare/workers-types" />
// Fires on the Cron Triggers in wrangler.toml and hands the schedule expression to the app,
// which decides which SQL jobs run (src/lib/server/domain/cron.ts). No business logic here.
interface Env {
	APP_URL: string;
	CRON_SHARED_SECRET: string;
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		const run = fetch(`${env.APP_URL}/internal/cron`, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${env.CRON_SHARED_SECRET}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({ cron: controller.cron, scheduledTime: controller.scheduledTime })
		}).then(async (res) => {
			if (!res.ok) throw new Error(`cron endpoint ${res.status}: ${await res.text()}`);
		});
		ctx.waitUntil(run);
		await run;
	}
} satisfies ExportedHandler<Env>;
