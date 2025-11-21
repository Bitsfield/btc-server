jest.mock('../modules/database.js', () =>
{
	return {
		saveRequest: jest.fn(() => Promise.resolve({ id: 1 })),
		getActiveAddys: jest.fn(() => Promise.resolve([{ addy: 'abc' }]))
	};
});

const database = require('../modules/database.js');
const processor = require('../modules/processor.js');
const utils = require('../modules/utils.js');

describe('processor.saveRequest', () =>
{
	beforeEach(() =>
	{
		jest.clearAllMocks();
	});

	test('persists a validated request', async () =>
	{
		const payload = {
			value: 100,
			addy: '12345678901234567890123456789012',
			userId: 'user',
			email: 'user@example.com'
		};
		const token = `EKOINX ${utils.getToken(payload)}`;

		await processor.saveRequest(token, { ...payload });

		expect(database.saveRequest).toHaveBeenCalledTimes(1);
		const savedPayload = database.saveRequest.mock.calls[0][0];
		expect(savedPayload.status).toBe('PENDING');
		expect(savedPayload.remarks).toMatch(/TRANSACTION RECEIVED/);
		expect(savedPayload.ref).toBeDefined();
	});

	test('throws when token validation fails', async () =>
	{
		const payload = {
			value: 100,
			addy: '12345678901234567890123456789012',
			userId: 'user',
			email: 'user@example.com'
		};

		await expect(processor.saveRequest('EKOINX invalid', { ...payload })).rejects.toThrow('Unauthorized');
		expect(database.saveRequest).not.toHaveBeenCalled();
	});
});

describe('processor.getActiveAddys', () =>
{
	test('returns active addresses from database', async () =>
	{
		const result = await processor.getActiveAddys();
		expect(result).toEqual([{ addy: 'abc' }]);
		expect(database.getActiveAddys).toHaveBeenCalledTimes(1);
	});
});

