import { publishedCoaches } from '$lib/content/coaches';
import type { PageServerLoad } from './$types';

// Only the published list reaches the page: a profile without consent is not in the payload at all.
export const load: PageServerLoad = () => ({ coaches: publishedCoaches() });
