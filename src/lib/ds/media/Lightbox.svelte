<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type PhotoSwipeLightbox from 'photoswipe/lightbox';
	import './lightbox.css';

	/* Intentional addition (design-system/readme.md; docs/decisions/2026-09-05-lightbox-library.md):
	   wraps a gallery of PhotoFrame anchors — <a href data-pswp-width data-pswp-height> — and opens
	   them in PhotoSwipe. Nothing of PhotoSwipe renders on the server; the lightbox module loads on
	   mount and the core only when a photo is first opened. Without JavaScript each anchor opens the
	   photo itself. The default controls are icons, so all of them are switched off and three text
	   buttons registered in their place; PhotoSwipe's dialog gets the aria-modal and name it lacks. */
	let { children, label = 'Photo viewer' }: { children: Snippet; label?: string } = $props();
	let gallery: HTMLElement | undefined = $state();

	onMount(() => {
		let lightbox: PhotoSwipeLightbox | undefined;
		let unmounted = false;
		void import('photoswipe/lightbox').then(({ default: Lightbox }) => {
			if (unmounted || !gallery) return;
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const lb = new Lightbox({
				gallery,
				children: 'a[data-pswp-width]',
				pswpModule: () => import('photoswipe'),
				showHideAnimationType: reduce ? 'none' : 'zoom',
				bgOpacity: 0.94,
				close: false,
				zoom: false,
				arrowPrev: false,
				arrowNext: false,
				counter: true,
				errorMsg: 'THIS PHOTO COULD NOT BE LOADED'
			});
			lb.on('uiRegister', () => {
				const pswp = lb.pswp;
				if (!pswp?.ui) return;
				pswp.element?.setAttribute('aria-modal', 'true');
				pswp.element?.setAttribute('aria-label', label);
				// the visible text is the accessible name: no aria-label to drift from it
				pswp.ui.registerElement({
					name: 'mt-prev',
					order: 7,
					isButton: true,
					html: 'PREV',
					onClick: 'prev'
				});
				pswp.ui.registerElement({
					name: 'mt-next',
					order: 8,
					isButton: true,
					html: 'NEXT',
					onClick: 'next'
				});
				pswp.ui.registerElement({
					name: 'mt-close',
					order: 20,
					isButton: true,
					html: 'CLOSE',
					onClick: 'close'
				});
			});
			lb.init();
			lightbox = lb;
		});
		return () => {
			unmounted = true;
			lightbox?.destroy();
		};
	});
</script>

<div class="mt-lightbox" bind:this={gallery}>{@render children()}</div>
