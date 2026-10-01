<script lang="ts">
	/* Every photograph in the system passes through this frame. Candid archive → analytical object:
	   contained (never full-bleed), square-cornered, hairline-framed, mono-annotated.
	   Treatments: 'plain' (documentation), 'wash' (court-blue duotone), 'slice' (one still cut into
	   staggered frames — trailing slices cool, the lead edge amber). */
	type Ratio = '3:2' | '4:3' | '1:1' | '16:9' | '3:4' | '2:3';
	let {
		src,
		alt = '',
		ratio = '3:2',
		focal = '50% 38%',
		treatment = 'plain',
		slices = 5,
		tag,
		caption,
		captionRight,
		frame = true
	}: {
		src: string;
		alt?: string;
		/** Crop box; the source aspect never breaks it */
		ratio?: Ratio;
		/** CSS object-position focal point (group shots: keep heads in the upper third) */
		focal?: string;
		treatment?: 'plain' | 'wash' | 'slice';
		/** Slice count for treatment="slice" (min 3) */
		slices?: number;
		/** Mono tag overlaid top-left, e.g. "DE ANZA · SAT 09:00" */
		tag?: string;
		/** Mono caption bar below the image */
		caption?: string;
		/** Right-aligned side of the caption bar */
		captionRight?: string;
		/** Hairline border */
		frame?: boolean;
	} = $props();

	const RATIOS: Record<Ratio, string> = {
		'3:2': '3 / 2',
		'4:3': '4 / 3',
		'1:1': '1 / 1',
		'16:9': '16 / 9',
		'3:4': '3 / 4',
		'2:3': '2 / 3'
	};
	const aspect = $derived(RATIOS[ratio] ?? ratio);
	const n = $derived(Math.max(3, slices));
	const strip = $derived(Array.from({ length: n }, (_, i) => i));
</script>

<figure class="mt-photo" class:mt-photo--framed={frame}>
	<div class="mt-photo__media">
		{#if treatment === 'slice'}
			<div
				class="mt-photo__stage mt-photo__stage--slice"
				style:aspect-ratio={aspect}
				role={alt ? 'img' : undefined}
				aria-label={alt || undefined}
				aria-hidden={alt ? undefined : 'true'}
			>
				{#each strip as i (i)}
					{@const back = n - 1 - i}
					{@const wash = back / (n - 1)}
					<div
						class="mt-photo__slice"
						class:mt-photo__slice--lead={back === 0}
						style:transform="translateY({(back * 2.6).toFixed(1)}%)"
					>
						<div
							class="mt-photo__slice-img"
							style:left="{-i * 100}%"
							style:width="{n * 100}%"
							style:background-image={`url("${src}")`}
							style:background-position={focal}
							style:filter={back === 0
								? 'none'
								: `grayscale(${Math.min(1, wash * 1.15)}) brightness(${1 - wash * 0.12})`}
						></div>
						{#if back > 0}
							<div class="mt-photo__slice-tint" style:opacity={0.14 + wash * 0.38}></div>
							<div class="mt-photo__slice-shade" style:opacity={wash * 0.22}></div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-photo__stage" style:aspect-ratio={aspect}>
				<img
					{src}
					{alt}
					loading="lazy"
					class="mt-photo__img"
					class:mt-photo__img--wash={treatment === 'wash'}
					style:object-position={focal}
				/>
				{#if treatment === 'wash'}
					<div class="mt-photo__wash"></div>
					<div class="mt-photo__wash-shade"></div>
				{/if}
			</div>
		{/if}
		{#if tag}<span class="mt-photo__tag">{tag}</span>{/if}
	</div>
	{#if caption || captionRight}
		<figcaption class="mt-photo__caption">
			<span>{caption}</span>
			{#if captionRight}<span class="mt-photo__caption-right">{captionRight}</span>{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.mt-photo {
		margin: 0;
		background: var(--surface-card);
	}
	.mt-photo--framed {
		border: 1px solid var(--border-hairline);
	}
	.mt-photo__media {
		position: relative;
	}
	.mt-photo__stage {
		position: relative;
		overflow: hidden;
		background: var(--court-050);
	}
	.mt-photo__stage--slice {
		display: flex;
	}
	.mt-photo__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.mt-photo__img--wash {
		filter: grayscale(1) contrast(1.06) brightness(0.94);
	}
	.mt-photo__wash {
		position: absolute;
		inset: 0;
		background: var(--court-500);
		mix-blend-mode: color;
	}
	/* the only gradient in the system: the multiply pass inside a photo wash */
	.mt-photo__wash-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(22, 51, 78, 0.06), rgba(22, 51, 78, 0.32));
		mix-blend-mode: multiply;
	}
	.mt-photo__slice {
		flex: 1;
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
	}
	.mt-photo__slice--lead {
		border-left: 2px solid var(--now);
	}
	.mt-photo__slice-img {
		position: absolute;
		top: 0;
		height: 100%;
		background-size: cover;
	}
	.mt-photo__slice-tint {
		position: absolute;
		inset: 0;
		background: var(--court-500);
		mix-blend-mode: color;
	}
	.mt-photo__slice-shade {
		position: absolute;
		inset: 0;
		background: var(--court-700);
		mix-blend-mode: multiply;
	}
	.mt-photo__tag {
		position: absolute;
		top: 10px;
		left: 10px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		background: var(--court-800);
		color: var(--line-white);
		padding: 4px 9px;
		line-height: 1.3;
	}
	.mt-photo__caption {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		border-top: 1px solid var(--border-hairline);
		padding: 9px 12px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}
	.mt-photo__caption-right {
		white-space: nowrap;
	}
</style>
