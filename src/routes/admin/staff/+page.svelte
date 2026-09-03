<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import Card from '$lib/components/Card.svelte';
	import {
		Banner,
		Button,
		EmptyState,
		FormSection,
		SegmentedControl,
		StatusChip,
		TextField,
		Toast
	} from '$lib/ds';

	let { data, form: actionData } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form);
	let toast = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});
</script>

<svelte:head><title>Staff · Momentum Tennis</title></svelte:head>

{#if data.staffError}<Banner tone="error">{data.staffError}</Banner>{/if}
{#if actionData?.revokeError}<Banner tone="error">{actionData.revokeError}</Banner>{/if}

{#if data.staff.length === 0}
	<EmptyState ticks>No roles granted yet</EmptyState>
{:else}
	<Card>
		<ul class="staff">
			{#each data.staff as member (member.accountId)}
				<li class="staff__row">
					<div class="staff__who">
						<span class="staff__name">{member.fullName || member.email}</span>
						<span class="mt-mono staff__meta">{member.email}</span>
					</div>
					<div class="staff__roles">
						{#each member.roles as role (role)}
							<span class="staff__role">
								<StatusChip status={role} />
								<form method="POST" action="?/revoke">
									<input type="hidden" name="accountId" value={member.accountId} />
									<input type="hidden" name="role" value={role} />
									<Button type="submit" variant="ghost" size="sm">Revoke</Button>
								</form>
							</span>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{/if}

<form method="POST" action="?/grant" use:enhance class="grant">
	<FormSection
		eyebrow="Grant a role"
		description="Coaches mark attendance and rate players. Administrators also manage the schedule, purchases and staff. The person signs up first — a role attaches to their account."
	>
		{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
		<TextField
			label="Email"
			name="email"
			type="email"
			autocomplete="off"
			bind:value={$form.email}
			error={$errors.email?.[0]}
		/>
		<SegmentedControl
			label="Role"
			name="role"
			options={[
				{ value: 'coach', label: 'Coach' },
				{ value: 'admin', label: 'Administrator' }
			]}
			bind:value={$form.role}
			error={$errors.role?.[0]}
		/>
		<div>
			<Button type="submit" variant="secondary" size="sm" disabled={$submitting}>Grant role</Button>
		</div>
	</FormSection>
</form>

<Toast bind:open={toast}>{$message}</Toast>

<style>
	.staff {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.staff__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-4) 0;
		border-bottom: var(--hairline);
		flex-wrap: wrap;
	}
	.staff__row:first-child {
		padding-top: 0;
	}
	.staff__row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.staff__who {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.staff__name {
		font-size: var(--size-body);
		font-weight: 600;
		color: var(--ink);
	}
	.staff__meta {
		color: var(--text-secondary);
	}
	.staff__roles {
		display: flex;
		gap: var(--space-5);
		align-items: center;
		flex-wrap: wrap;
	}
	.staff__role {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.grant {
		max-width: 52ch;
	}
</style>
