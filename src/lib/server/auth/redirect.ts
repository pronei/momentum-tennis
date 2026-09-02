/** `next` may only point inside this site: an absolute path, never protocol-relative or a URL. */
export function safeRedirectPath(next: string | null | undefined, fallback = '/portal'): string {
	if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\'))
		return fallback;
	return next;
}
