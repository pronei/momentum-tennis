<script lang="ts">
	import {
		Banner,
		Button,
		Checkbox,
		DateField,
		Dialog,
		EmptyState,
		Eyebrow,
		FormSection,
		FrameTicks,
		Pagination,
		SegmentedControl,
		Select,
		StatusChip,
		Tabs,
		TextArea,
		TextField,
		TimeField,
		Toast
	} from '$lib/ds';

	let dialogOpen = $state(false);
	let toastOpen = $state(false);
	let page = $state(1);
	let visibility = $state('guardian');
	let level = $state('');
	let date = $state('2026-09-12');
	let time = $state('16:00');
	let agreed = $state(false);
	let tab = $state('stats');
	const levels = [
		{ value: 'orange', label: 'Orange ball' },
		{ value: 'green_beginner', label: 'Green ball · beginner' },
		{ value: 'green_intermediate', label: 'Green ball · intermediate' },
		{ value: 'green_advanced', label: 'Green ball · advanced' },
		{ value: 'yellow_intermediate', label: 'Yellow ball · intermediate' },
		{ value: 'yellow_advanced', label: 'Yellow ball · advanced' }
	];
</script>

<svelte:head><title>Styleguide · Momentum Tennis</title></svelte:head>

<main class="sg">
	<header class="sg__head">
		<Eyebrow ticks>Design system · ported components</Eyebrow>
		<h1 class="mt-display sg__title">Styleguide</h1>
		<p class="mt-mono sg__note">
			REFERENCE: DESIGN-SYSTEM/COMPONENTS · PORTED VERBATIM FROM THE .D.TS CONTRACTS
		</p>
	</header>

	<section class="sg__block">
		<Eyebrow>Actions</Eyebrow>
		<div class="sg__row">
			<Button>Book a free trial class</Button>
			<Button variant="secondary">View schedule</Button>
			<Button variant="ghost">All programs</Button>
			<Button size="sm" variant="secondary">Small</Button>
			<Button disabled>Disabled</Button>
		</div>
		<div class="sg__row sg__row--field">
			<Button onField variant="secondary">On field</Button>
			<Button onField variant="ghost">Ghost on field</Button>
			<FrameTicks tone="field" />
			<FrameTicks tone="field" loading />
		</div>
	</section>

	<section class="sg__block">
		<Eyebrow>Forms</Eyebrow>
		<div class="sg__grid">
			<FormSection
				eyebrow="Parent — account owner"
				description="The shared anatomy: label, help, dual-channel error."
			>
				<TextField label="Name" value="Priya R." help="As it appears on receipts" />
				<TextField
					label="Email"
					type="email"
					value="priya@example"
					error="enter a full email address"
				/>
				<TextField label="Phone" type="tel" placeholder="669-264-0000" />
				<Select
					label="Ball level"
					placeholder="Choose a level"
					options={levels}
					bind:value={level}
				/>
				<SegmentedControl
					label="Visibility"
					options={[
						{ value: 'guardian', label: 'Visible to family' },
						{ value: 'internal', label: 'Internal' }
					]}
					bind:value={visibility}
					name="visibility"
				/>
				<TextArea
					label="Notes"
					help="Coaches see this"
					placeholder="Left-handed, prefers Tuesdays"
				/>
			</FormSection>
			<FormSection eyebrow="Scheduling" ticks>
				<DateField label="Date" bind:value={date} />
				<TimeField label="Start" bind:value={time} help="Arrow keys step 15 minutes" />
				<Checkbox label="Present" checked />
				<Checkbox label="Absent" />
				<Checkbox
					consent
					bind:checked={agreed}
					label="I have read the participation waiver (v1) and sign it for Maya R. as parent."
				/>
				<Checkbox label="Required" error="tick the box to continue" />
			</FormSection>
		</div>
	</section>

	<section class="sg__block">
		<Eyebrow>Feedback</Eyebrow>
		<div class="sg__stack">
			<Banner>Saved · 16:04</Banner>
			<Banner tone="error">A current waiver must be signed for this player before booking.</Banner>
			<div class="sg__row">
				{#each ['active', 'upcoming', 'waitlisted', 'cancelled', 'paid', 'refunded', 'signed', 'needs re-consent', 'published', 'draft', 'expired', 'custom'] as s (s)}
					<StatusChip status={s} />
				{/each}
			</div>
			<Tabs
				items={[
					{ id: 'stats', label: 'Stats' },
					{ id: 'calendar', label: 'Calendar' },
					{ id: 'bookings', label: 'Bookings' }
				]}
				active={tab}
				onchange={(id) => (tab = id)}
				mobileMode="scroll"
			/>
			<EmptyState ticks>No sessions — courts rest on Wed &amp; Fri</EmptyState>
			<div class="sg__row">
				<Pagination {page} pages={4} onchange={(p) => (page = p)} />
				<Button variant="secondary" size="sm" onclick={() => (dialogOpen = true)}
					>Open dialog</Button
				>
				<Button variant="secondary" size="sm" onclick={() => (toastOpen = true)}>Show toast</Button>
			</div>
		</div>
	</section>
</main>

<Dialog
	bind:open={dialogOpen}
	title="Cancel booking"
	consequence="Inside 24 hours the credit is forfeited"
>
	<p class="sg__body">Green Tue · 16:00–17:30 · Murdock Park. Cancel this booking for Maya R.?</p>
	{#snippet actions()}
		<Button variant="ghost" onclick={() => (dialogOpen = false)}>Keep booking</Button>
		<Button variant="secondary" onclick={() => (dialogOpen = false)}>Cancel booking</Button>
	{/snippet}
</Dialog>
<Toast bind:open={toastOpen}>Saved · 16:04</Toast>

<style>
	.sg {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-7) var(--space-6) var(--space-10);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
	.sg__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.sg__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.sg__note {
		color: var(--text-secondary);
		margin: 0;
	}
	.sg__block {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.sg__row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: center;
	}
	.sg__row--field {
		background: var(--surface-field);
		padding: var(--space-5);
	}
	.sg__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
		align-items: start;
	}
	.sg__stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 760px;
	}
	.sg__body {
		margin: 0;
		font-size: var(--size-body-sm);
	}
	@media (max-width: 760px) {
		.sg {
			padding: var(--space-6) var(--space-4) var(--space-9);
		}
		.sg__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
