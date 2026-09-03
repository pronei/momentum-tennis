import { describe, expect, it } from 'vitest';
import { AppError, describeError, err, fromPostgres, isErr, ok } from './result';

describe('Result', () => {
	it('ok/err are discriminated and narrow correctly', () => {
		const a = ok(42);
		const b = err(new AppError('weekly_cap'));
		expect(isErr(a)).toBe(false);
		expect(isErr(b)).toBe(true);
		if (!isErr(a)) expect(a.value).toBe(42);
		if (isErr(b)) expect(b.error.code).toBe('weekly_cap');
	});
});

describe('fromPostgres — the database refuses; we translate, never retry around it', () => {
	it('maps RPC refusals by their leading token', () => {
		expect(fromPostgres({ message: 'weekly_cap: one weekday class per week' }).code).toBe(
			'weekly_cap'
		);
		expect(fromPostgres({ message: 'waiver_required' }).code).toBe('waiver_required');
		expect(fromPostgres({ message: 'insufficient_credits: class_weekday' }).code).toBe(
			'insufficient_credits'
		);
		expect(fromPostgres({ message: 'level_mismatch: this slot does not offer…' }).code).toBe(
			'level_mismatch'
		);
	});

	it('keeps the detail after the token for logging, not for display', () => {
		const e = fromPostgres({ message: 'insufficient_credits: class_weekday' });
		expect(e.detail).toBe('class_weekday');
	});

	it('maps the EXCLUDE constraints to slot_taken and the availability trigger to court_unavailable', () => {
		expect(
			fromPostgres({
				code: '23P01',
				message: 'conflicting key value violates exclusion constraint "no_court_overlap"'
			}).code
		).toBe('slot_taken');
		expect(fromPostgres({ message: 'court_unavailable: court x is not reserved' }).code).toBe(
			'court_unavailable'
		);
	});

	it('maps RLS and auth refusals to not_authorized', () => {
		expect(
			fromPostgres({ code: '42501', message: 'new row violates row-level security policy' }).code
		).toBe('not_authorized');
		expect(fromPostgres({ message: 'not_authenticated' }).code).toBe('not_authenticated');
	});

	it('falls back to unexpected for anything unrecognised, preserving the message as detail', () => {
		const e = fromPostgres({ message: 'connection reset' });
		expect(e.code).toBe('unexpected');
		expect(e.detail).toBe('connection reset');
	});
});

describe('describeError — plain, earned, no exclamation points', () => {
	it('has a sentence for every known code and never shouts', () => {
		for (const code of AppError.codes) {
			const text = describeError(code);
			expect(text.length).toBeGreaterThan(8);
			expect(text).not.toMatch(/!/);
		}
		expect(describeError('weekly_cap')).toMatch(/one .* class per week/i);
	});
});

describe('identity refusals map to codes, not to unexpected', () => {
	it('maps the tokens the identity RPCs raise', () => {
		expect(fromPostgres({ message: 'staff_only' }).code).toBe('staff_only');
		expect(fromPostgres({ message: 'admin_only' }).code).toBe('admin_only');
		expect(fromPostgres({ message: 'minor_self_link' }).code).toBe('minor_self_link');
		expect(fromPostgres({ message: 'unknown_skill_level: purple' }).code).toBe(
			'unknown_skill_level'
		);
		expect(fromPostgres({ message: 'player_has_history' }).code).toBe('player_has_history');
		expect(fromPostgres({ message: 'validation: name required' }).code).toBe('validation');
	});
});

describe('consent refusals map to codes, not to unexpected', () => {
	it('maps the tokens sign_waiver and the authoring RPCs raise', () => {
		expect(fromPostgres({ message: 'not_current_version' }).code).toBe('not_current_version');
		expect(fromPostgres({ message: 'name_required' }).code).toBe('name_required');
		expect(fromPostgres({ message: 'minor_cannot_self_sign' }).code).toBe('minor_cannot_self_sign');
		expect(fromPostgres({ message: 'already_published' }).code).toBe('already_published');
		expect(fromPostgres({ message: 'unknown_document' }).code).toBe('unknown_document');
	});
});
