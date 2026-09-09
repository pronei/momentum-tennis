<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		Checkbox,
		Eyebrow,
		FormSection,
		Select,
		TextArea,
		TextField,
		Toast
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		resetForm: false
	});
	let toast = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});

	const KINDS = [
		{ value: 'class_pack', label: 'Class pack' },
		{ value: 'lesson_pack', label: 'Lesson pack' },
		{ value: 'camp', label: 'Camp' },
		{ value: 'team_fee', label: 'Team fee' }
	];
	const CREDIT_KINDS = [
		{ value: 'class_weekday', label: 'Weekday classes' },
		{ value: 'class_weekend', label: 'Weekend classes' },
		{ value: 'private_lesson', label: 'Private lessons' }
	];
</script>

<svelte:head><title>{data.name} · Products</title></svelte:head>

<div class="pd">
	<div>
		<Eyebrow ticks>{data.isNew ? 'New product' : 'Product'}</Eyebrow>
		<h2 class="pd__title">{data.name}</h2>
		<a class="pd__back" href={resolve('/admin/products')}>All products</a>
	</div>

	<form method="POST" action="?/save" use:enhance class="pd__form">
		{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
		{#if $form.id}<input type="hidden" name="id" value={$form.id} />{/if}

		<FormSection eyebrow="The product">
			<TextField label="Name" name="name" bind:value={$form.name} error={$errors.name?.[0]} />
			<Select
				label="Kind"
				name="kind"
				options={KINDS}
				bind:value={$form.kind as unknown as string}
				error={$errors.kind?.[0]}
			/>
			<TextArea
				label="Description"
				name="description"
				bind:value={$form.description as unknown as string}
				error={$errors.description?.[0]}
			/>
		</FormSection>

		<FormSection eyebrow="Price" description="Dollars. Blank member price means the public one.">
			<TextField
				label="Public price"
				name="priceDollars"
				type="number"
				step="0.01"
				bind:value={$form.priceDollars as unknown as string}
				error={$errors.priceDollars?.[0]}
			/>
			<TextField
				label="Member price"
				name="memberPriceDollars"
				type="number"
				step="0.01"
				bind:value={$form.memberPriceDollars as unknown as string}
				error={$errors.memberPriceDollars?.[0]}
			/>
		</FormSection>

		<FormSection eyebrow="Credits" description="Packs only. A camp or a team fee carries none.">
			<Select
				label="Credit kind"
				name="creditKind"
				options={CREDIT_KINDS}
				placeholder="None"
				bind:value={$form.creditKind as unknown as string}
				error={$errors.creditKind?.[0]}
			/>
			<TextField
				label="Quantity"
				name="creditQuantity"
				type="number"
				bind:value={$form.creditQuantity as unknown as string}
				error={$errors.creditQuantity?.[0]}
			/>
			<TextField
				label="Validity days"
				name="validityDays"
				type="number"
				help="blank = academy default"
				bind:value={$form.validityDays as unknown as string}
				error={$errors.validityDays?.[0]}
			/>
			<TextField
				label="Forgiven skips"
				name="forgivenSkips"
				type="number"
				help="blank = academy default"
				bind:value={$form.forgivenSkips as unknown as string}
				error={$errors.forgivenSkips?.[0]}
			/>
		</FormSection>

		<FormSection eyebrow="Stripe">
			<TextField
				label="Public price id"
				name="stripePricePublic"
				help="price_… from the Stripe dashboard; blank = the amount is sent inline"
				bind:value={$form.stripePricePublic as unknown as string}
				error={$errors.stripePricePublic?.[0]}
			/>
			<TextField
				label="Member price id"
				name="stripePriceMember"
				help="price_… from the Stripe dashboard; blank = the amount is sent inline"
				bind:value={$form.stripePriceMember as unknown as string}
				error={$errors.stripePriceMember?.[0]}
			/>
		</FormSection>

		<Checkbox
			label="Active"
			name="active"
			bind:checked={$form.active}
			error={$errors.active?.[0]}
		/>

		<div>
			<Button type="submit" disabled={$submitting}>Save product</Button>
		</div>
	</form>
</div>

<Toast bind:open={toast}>{$message}</Toast>

<style>
	.pd {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.pd__title {
		margin: var(--space-2) 0 var(--space-1);
		font-family: var(--font-sans);
		font-size: var(--size-h3);
		font-weight: var(--weight-bold);
		color: var(--ink);
	}
	.pd__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.pd__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: var(--measure);
	}
</style>
