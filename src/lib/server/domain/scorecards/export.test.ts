import { describe, expect, it } from 'vitest';
import type { Line } from './format';
import { dateText, exportFilename, observedCard, timeText } from './export';

const header = {
	id: '0d6e2f3a-0000-4000-8000-000000000001',
	matchId: '2743978',
	playedOn: '2026-10-04',
	startTime: '14:00',
	division: '12U Green',
	homeTeam: 'Chippers',
	awayTeam: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	format: 'three_court' as const,
	setGames: 6 as const
};
const line = (position: Line['position'], over: Partial<Line> = {}): Line => ({
	id: `l-${position}`,
	position,
	names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
	playerIds: { home1: null, home2: null, away1: null, away2: null },
	homeGames: 4,
	awayGames: 6,
	result: 'completed',
	winner: 'away',
	...over
});

describe('the digital card text forms', () => {
	it('prints the date as MM/DD/YY and the time as h:mm AM', () => {
		expect(dateText('2026-10-04')).toBe('10/04/26');
		expect(timeText('14:00')).toBe('2:00 PM');
		expect(timeText('09:30:00')).toBe('9:30 AM');
		expect(timeText('00:15')).toBe('12:15 AM');
		expect(timeText(null)).toBe('');
	});
});

describe('observedCard', () => {
	it('is the automation shape plus result and winner, lines in play order, totals computed', () => {
		const doc = observedCard(
			header,
			[
				line('2D', {
					names: {
						home1: 'Ada Lovelace',
						home2: 'Edsger Dijkstra',
						away1: 'Grace Hopper',
						away2: 'Barbara Liskov'
					}
				}),
				line('1S', { homeGames: 6, awayGames: 2, winner: 'home' })
			],
			'2026-10-04T23:10:00.000Z'
		);
		expect(doc.source).toBe('momentum-tennis-platform');
		expect(doc.format).toBe('three_court');
		expect(doc.set_games).toBe(6);
		expect(doc.card.match_id).toBe('2743978');
		expect(doc.card.date_text).toBe('10/04/26');
		expect(doc.card.time_text).toBe('2:00 PM');
		expect(doc.card.lines.map((l) => l.position_text)).toEqual(['#1 Singles', '#2 Doubles']);
		expect(doc.card.lines[0]).toEqual({
			round: 1,
			position_text: '#1 Singles',
			home_names: ['Ada Lovelace'],
			away_names: ['Grace Hopper'],
			home_games: 6,
			away_games: 2,
			result: 'completed',
			winner: 'home'
		});
		expect(doc.card.lines[1].round).toBe(3);
		expect(doc.card.lines[1].home_names).toEqual(['Ada Lovelace', 'Edsger Dijkstra']);
		expect(doc.card.printed_home_total).toBe(10);
		expect(doc.card.printed_away_total).toBe(8);
	});
	it('exports a line without games as nulls and empty names, never invented zeros', () => {
		const doc = observedCard(
			header,
			[
				line('4D', {
					names: { home1: '', home2: '', away1: '', away2: '' },
					homeGames: null,
					awayGames: null,
					result: 'double_default',
					winner: null
				})
			],
			'2026-10-04T23:10:00.000Z'
		);
		expect(doc.card.lines[0]).toMatchObject({
			home_names: [],
			away_names: [],
			home_games: null,
			away_games: null,
			winner: null
		});
	});
	it('names the file after the match', () => {
		expect(exportFilename(header)).toBe('scorecard-2743978.json');
		expect(exportFilename({ ...header, matchId: null })).toBe('scorecard-0d6e2f3a.json');
	});
});
