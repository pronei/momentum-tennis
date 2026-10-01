import { publishedPhotos } from '$lib/content/photos';
import type { PageServerLoad } from './$types';

// Only the published list reaches the page: a photo without consent is not in the payload at all.
export const load: PageServerLoad = () => ({ photos: publishedPhotos() });
