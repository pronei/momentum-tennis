import { describe, expect, it, vi } from 'vitest';
import { consoleMailer } from './adapters';

describe('consoleMailer — the dev adapter', () => {
	it('prints the mail and returns an id that cannot pass for a provider receipt', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { id } = await consoleMailer().send({
			to: 'guardian@example.test',
			subject: 'Booking confirmed',
			html: '<p>ignored</p>',
			text: 'Booking confirmed.'
		});
		expect(id.startsWith('console:')).toBe(true);
		expect(warn).toHaveBeenCalledOnce();
		expect(String(warn.mock.calls[0][0])).toContain('guardian@example.test');
		// the text version is what gets printed; nobody reads HTML in a terminal
		expect(String(warn.mock.calls[0][0])).toContain('Booking confirmed.');
		warn.mockRestore();
	});
});
