import { describe, expect, it } from 'vitest';
import {
	completeness,
	fromScore,
	orderedPositions,
	positionLabel,
	resolveLine,
	roundOf,
	suggestResult,
	suggestWinner,
	totals,
	type Line
} from './format';

const line = (over: Partial<Line> = {}): Line => ({
	id: 'l1',
	position: '1S',
	names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
	playerIds: { home1: null, home2: null, away1: null, away2: null },
	homeGames: 6,
	awayGames: 2,
	result: 'completed',
	winner: 'home',
	...over
});

describe('the two formats share eight lines and differ in rounds', () => {
	it('plays the 2-court card in four rounds and the 3-court card in three', () => {
		expect(orderedPositions('two_court')).toEqual(['1S', '4D', '2S', '3D', '3S', '2D', '4S', '1D']);
		expect(orderedPositions('three_court')).toEqual([
			'1S',
			'2S',
			'4D',
			'3S',
			'4S',
			'1D',
			'2D',
			'3D'
		]);
		expect(roundOf('two_court', '1D')).toBe(4);
		expect(roundOf('three_court', '1D')).toBe(2);
	});
	it('labels positions the way the automation reads them', () => {
		expect(positionLabel('1S')).toBe('#1 Singles');
		expect(positionLabel('4D')).toBe('#4 Doubles');
	});
});

describe('result and winner from the score', () => {
	it('completed when one side reaches the set, timed when neither has', () => {
		expect(suggestResult({ home: 4, away: 2 }, 4)).toBe('completed');
		expect(suggestResult({ home: 3, away: 4 }, 4)).toBe('completed');
		expect(suggestResult({ home: 3, away: 3 }, 4)).toBe('timed');
		expect(suggestResult({ home: 2, away: 1 }, 4)).toBe('timed');
		expect(suggestResult({ home: 6, away: 4 }, 6)).toBe('completed');
		expect(suggestResult({ home: 6, away: 5 }, 6)).toBe('completed');
		expect(suggestResult({ home: 5, away: 4 }, 6)).toBe('timed');
	});
	it('suggests nothing for a score outside the set, or no score', () => {
		expect(suggestResult({ home: 5, away: 3 }, 4)).toBeNull();
		expect(suggestResult({ home: 7, away: 5 }, 6)).toBeNull();
		expect(suggestResult({ home: null, away: null }, 6)).toBeNull();
	});
	it('the side with more games wins; equal games decide nothing', () => {
		expect(suggestWinner({ home: 6, away: 2 })).toBe('home');
		expect(suggestWinner({ home: 2, away: 6 })).toBe('away');
		expect(suggestWinner({ home: 3, away: 3 })).toBeNull();
		expect(suggestWinner({ home: null, away: null })).toBeNull();
	});
});

describe('resolveLine — what a submission stores', () => {
	const input = (over = {}) => ({
		names: { home1: 'A', home2: '', away1: 'B', away2: '' },
		homeGames: 6 as number | null,
		awayGames: 2 as number | null,
		result: '' as const,
		winner: '' as const,
		...over
	});
	it('derives a completed line from the score', () => {
		expect(resolveLine(input(), 6)).toEqual({
			result: 'completed',
			winner: 'home',
			homeGames: 6,
			awayGames: 2
		});
	});
	it('keeps a chosen result and winner', () => {
		expect(
			resolveLine(input({ homeGames: 3, awayGames: 2, result: 'retired', winner: 'away' }), 6)
		).toEqual({ result: 'retired', winner: 'away', homeGames: 3, awayGames: 2 });
	});
	it('a played result without a winner is not a result yet', () => {
		expect(resolveLine(input({ homeGames: 3, awayGames: 3 }), 6)).toEqual({
			result: null,
			winner: null,
			homeGames: 3,
			awayGames: 3
		});
		expect(resolveLine(input({ homeGames: 3, awayGames: 3, winner: 'home' }), 6).result).toBe(
			'timed'
		);
	});
	it('a double default drops games and winner; a default needs a winner', () => {
		expect(resolveLine(input({ result: 'double_default', winner: 'home' }), 6)).toEqual({
			result: 'double_default',
			winner: null,
			homeGames: null,
			awayGames: null
		});
		expect(
			resolveLine(input({ homeGames: null, awayGames: null, result: 'default' }), 6).result
		).toBeNull();
		expect(
			resolveLine(input({ homeGames: null, awayGames: null, result: 'default', winner: 'away' }), 6)
		).toEqual({ result: 'default', winner: 'away', homeGames: null, awayGames: null });
	});
});

describe('fromScore — what the selects show', () => {
	it('shows FROM SCORE when the stored value is the derived one', () => {
		expect(fromScore(line(), 6)).toEqual({ result: '', winner: '' });
	});
	it('shows the chosen value when it differs from the score', () => {
		expect(fromScore(line({ homeGames: 7, awayGames: 5, result: 'completed' }), 6)).toEqual({
			result: 'completed',
			winner: ''
		});
		expect(fromScore(line({ result: 'retired' }), 6).result).toBe('retired');
	});
});

describe('totals and completeness', () => {
	it('sums games, treating no score as nothing', () => {
		expect(
			totals([
				line(),
				line({ homeGames: null, awayGames: null }),
				line({ homeGames: 2, awayGames: 6 })
			])
		).toEqual({ home: 8, away: 8 });
	});
	it('lists what finalize would refuse, in play order', () => {
		const lines: Line[] = [
			line({ position: '1S', result: null, homeGames: null, awayGames: null, winner: null }),
			line({ position: '4D', names: { home1: 'A', home2: '', away1: 'B', away2: 'C' } }),
			line({ position: '2S', result: null, homeGames: 3, awayGames: 3, winner: null }),
			line({ position: '3D', result: null, homeGames: 7, awayGames: 5 }),
			line({
				position: '3S',
				result: 'default',
				winner: 'away',
				names: { home1: 'A', home2: '', away1: '', away2: '' }
			}),
			line({
				position: '2D',
				result: 'double_default',
				homeGames: null,
				awayGames: null,
				winner: null,
				names: { home1: '', home2: '', away1: '', away2: '' }
			})
		];
		expect(completeness({ matchId: null, format: 'two_court' }, lines)).toEqual([
			'MATCH ID MISSING',
			'#1 SINGLES · NO SCORE',
			'#4 DOUBLES · MISSING A PLAYER NAME',
			'#2 SINGLES · NAME THE WINNER',
			'#3 DOUBLES · CHOOSE A RESULT',
			'#3 SINGLES · NAMES NOBODY ON THE WINNING SIDE'
		]);
	});
	it('is empty when the card is ready', () => {
		expect(completeness({ matchId: '2743999', format: 'two_court' }, [line()])).toEqual([]);
	});
});
