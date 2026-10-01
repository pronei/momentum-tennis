<script lang="ts">
	import Button from '../core/Button.svelte';
	import Eyebrow from '../core/Eyebrow.svelte';
	import PhotoFrame from '../media/PhotoFrame.svelte';

	/* Program card — repeats across junior / camps / adult pages: eyebrow, title, level + location in
	   mono, schedule rows, one CTA. Optional washed photo header. */
	type Ratio = '3:2' | '4:3' | '16:9' | '1:1' | '3:4' | '2:3';
	let {
		eyebrow,
		title,
		level,
		location,
		schedule = [],
		note,
		photo,
		photoRatio = '3:2',
		photoFocal,
		photoTreatment = 'wash',
		photoAlt = '',
		ctaLabel = 'View schedule',
		ctaHref = '#',
		primaryCta = false
	}: {
		/** Kicker, e.g. "Juniors" */
		eyebrow: string;
		/** Program name */
		title: string;
		/** Ball-level or age range, e.g. "Orange → Yellow ball" */
		level?: string;
		/** e.g. "De Anza College" */
		location?: string;
		schedule?: { days: string; time: string; detail?: string }[];
		/** One short supporting sentence */
		note?: string;
		/** Photo header (path); washed by default */
		photo?: string;
		photoRatio?: Ratio;
		photoFocal?: string;
		photoTreatment?: 'plain' | 'wash' | 'slice';
		photoAlt?: string;
		ctaLabel?: string;
		ctaHref?: string;
		/** Amber CTA — only when this card carries the view's single main action */
		primaryCta?: boolean;
	} = $props();
</script>

<article class="mt-pc">
	{#if photo}
		<div class="mt-pc__photo">
			<PhotoFrame
				src={photo}
				alt={photoAlt}
				ratio={photoRatio}
				focal={photoFocal}
				treatment={photoTreatment}
				frame={false}
			/>
		</div>
	{/if}
	<div class="mt-pc__body">
		<Eyebrow ticks>{eyebrow}</Eyebrow>
		<h3 class="mt-pc__title">{title}</h3>
		{#if level || location}
			<div class="mt-pc__facts">
				{#if level}<span>LEVEL — {level}</span>{/if}
				{#if location}<span>AT — {location}</span>{/if}
			</div>
		{/if}
		{#if schedule.length > 0}
			<div class="mt-pc__schedule">
				{#each schedule as row, i (i)}
					<div class="mt-pc__row">
						<span class="mt-pc__days">{row.days}</span>
						<span class="mt-pc__time">{row.time}</span>
						{#if row.detail}<span class="mt-pc__detail">{row.detail}</span>{/if}
					</div>
				{/each}
			</div>
		{/if}
		{#if note}<p class="mt-pc__note">{note}</p>{/if}
		<div class="mt-pc__cta">
			<Button variant={primaryCta ? 'primary' : 'secondary'} size="sm" href={ctaHref}
				>{ctaLabel}</Button
			>
		</div>
	</div>
</article>

<style>
	.mt-pc {
		background: var(--surface-card);
		border: 1px solid var(--border-hairline);
		display: flex;
		flex-direction: column;
	}
	.mt-pc__photo {
		border-bottom: 1px solid var(--border-hairline);
	}
	.mt-pc__body {
		padding: 24px 24px 28px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex: 1;
	}
	.mt-pc__title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: var(--size-h3);
		line-height: 1.05;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.mt-pc__facts {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.mt-pc__schedule {
		border-top: 1px solid var(--border-hairline);
	}
	.mt-pc__row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 16px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border-hairline);
	}
	.mt-pc__days {
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		font-weight: 600;
		color: var(--ink);
	}
	.mt-pc__time {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--court-500);
		white-space: nowrap;
	}
	.mt-pc__detail {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		color: var(--text-secondary);
		margin-left: auto;
	}
	.mt-pc__note {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		line-height: 1.55;
		color: var(--text-secondary);
	}
	.mt-pc__cta {
		margin-top: auto;
		padding-top: 8px;
	}
</style>
