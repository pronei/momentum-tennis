import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '$lib/server/db/database.types';
import type { Mailer, SendStore } from './send';

/** SendStore over notification_sends. Service role: sends run from cron and webhooks. */
export function supabaseSendStore(db: SupabaseClient<Database>): SendStore {
	return {
		async claim(send) {
			const { data, error } = await db
				.from('notification_sends')
				.upsert(
					{
						trigger_key: send.triggerKey,
						category: send.category,
						recipient_account_id: send.recipientAccountId,
						player_id: send.playerId ?? null,
						template: send.template
					},
					{ onConflict: 'trigger_key', ignoreDuplicates: true }
				)
				.select('id');
			if (error) throw new Error(`notification_sends claim failed: ${error.message}`);
			return data.length ? 'new' : 'duplicate';
		},
		async settle(triggerKey, status, providerMessageId) {
			const { error } = await db
				.from('notification_sends')
				.update({
					status,
					provider_message_id: providerMessageId ?? null,
					sent_at: status === 'sent' ? new Date().toISOString() : null
				})
				.eq('trigger_key', triggerKey);
			if (error) throw new Error(`notification_sends settle failed: ${error.message}`);
		}
	};
}

/** Mailer over Resend. Templates are rendered by the caller (design-system/templates/email). */
export function resendMailer(apiKey: string, from: string): Mailer {
	const resend = new Resend(apiKey);
	return {
		async send(mail) {
			const { data, error } = await resend.emails.send({ from, ...mail });
			if (error || !data) throw new Error(`resend: ${error?.message ?? 'no id returned'}`);
			return { id: data.id };
		}
	};
}
