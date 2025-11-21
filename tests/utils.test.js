const utils = require('../modules/utils.js');

describe('utils helpers', () =>
{
	test('returnSuccessfulResponse produces the expected payload', () =>
	{
		const payload = utils.returnSuccessfulResponse('done', { value: 42 });
		expect(payload).toEqual({
			code: 0,
			status: 'success',
			description: 'done',
			data: { value: 42 }
		});
	});

	test('returnFailedResponse produces the expected payload', () =>
	{
		const payload = utils.returnFailedResponse('nope', null);
		expect(payload).toEqual({
			code: 2,
			status: 'failed',
			description: 'nope',
			data: null
		});
	});

	test('validateRequest validates required fields', () =>
	{
		const valid = {
			value: 1,
			addy: '12345678901234567890123456789012',
			userId: 'user',
			email: 'user@example.com'
		};
		expect(utils.validateRequest(valid)).toBe(true);
		expect(utils.validateRequest({})).toBe(false);
	});

	test('getToken returns deterministic encrypted string', () =>
	{
		const data = {
			value: '10',
			addy: '12345678901234567890123456789012',
			userId: 'user-id',
			email: 'email@example.com'
		};
		const token = utils.getToken(data);
		expect(typeof token).toBe('string');
		expect(token.length).toBeGreaterThan(10);
	});

	test('twoDigits pads correctly', () =>
	{
		expect(utils.twoDigits(5)).toBe('05');
		expect(utils.twoDigits(15)).toBe('15');
		expect(utils.twoDigits(-5)).toBe('-05');
	});
});

