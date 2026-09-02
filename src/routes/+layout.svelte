<script lang="ts">
	// The design system's own stylesheet is the single styling truth — imported, never copied.
	import '$ds/styles.css';
	import favicon from '$lib/assets/logo-mark.svg';

	let { children } = $props();
	const themeColor = '#1C3655'; // ds-allow: <meta> cannot read a CSS variable; equals --court-800
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content={themeColor} />
</svelte:head>

{@render children()}
