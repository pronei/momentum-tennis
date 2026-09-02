<script lang="ts">
	/* The mono-caps status convention codified: leading 8px square swatch + mono text.
	   The TEXT carries the meaning (always ink / secondary — AA everywhere); the swatch carries the
	   color. Amber appears only in the ACTIVE swatch, never as status text. */
	let { status = '', tone = 'light' }: { status: string; tone?: 'light' | 'field' } = $props();

	const MAP: Record<string, { sw: string; frame?: boolean; dim?: boolean }> = {
		ACTIVE: { sw: 'var(--now)' },
		UPCOMING: { sw: 'var(--court-300)' },
		WAITLISTED: { sw: 'var(--court-200)' },
		CANCELLED: { sw: 'transparent', frame: true, dim: true },
		PAID: { sw: 'var(--court-500)' },
		REFUNDED: { sw: 'var(--court-100)', frame: true },
		SIGNED: { sw: 'var(--court-800)' },
		'NEEDS RE-CONSENT': { sw: 'var(--state-error)' },
		PUBLISHED: { sw: 'var(--court-800)' },
		DRAFT: { sw: 'transparent', frame: true, dim: true },
		EXPIRED: { sw: 'transparent', frame: true, dim: true }
	};
	const k = $derived(String(status).toUpperCase());
	const c = $derived(MAP[k] ?? { sw: 'transparent', frame: true });
</script>

<span class="mt-chip" class:mt-chip--field={tone === 'field'} class:mt-chip--dim={c.dim}>
	<span
		class="mt-chip__swatch"
		class:mt-chip__swatch--frame={c.frame}
		style:background={c.sw}
		aria-hidden="true"
	></span>{k}
</span>

<style>
	.mt-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		line-height: 1;
		color: var(--ink);
	}
	.mt-chip--field {
		color: var(--line-white);
	}
	.mt-chip--dim {
		color: var(--text-secondary);
	}
	.mt-chip--field.mt-chip--dim {
		color: var(--court-300);
	}
	.mt-chip__swatch {
		width: 8px;
		height: 8px;
		flex: none;
		box-sizing: border-box;
	}
	.mt-chip__swatch--frame {
		border: 1px solid rgba(27, 27, 27, 0.4);
	}
	.mt-chip--field .mt-chip__swatch--frame {
		border-color: var(--border-on-field);
	}
</style>
