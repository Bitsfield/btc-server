jest.mock('../modules/database.js', () =>
{
	return {
		getRequestBatch: jest.fn(),
		getCurrAddy: jest.fn(),
		saveAddy: jest.fn(() => Promise.resolve()),
		updateAddy: jest.fn(() => Promise.resolve()),
		setCurrAddy: jest.fn(() => Promise.resolve()),
		updateRequest: jest.fn(() => Promise.resolve()),
		saveTransaction: jest.fn(() => Promise.resolve())
	};
});

jest.mock('../modules/btc-utils.js', () =>
{
	return {
		generateNewAddress: jest.fn(),
		getTxFee: jest.fn(),
		processTransaction: jest.fn()
	};
});

const dispatcher = require('../modules/dispatcher.js');
const db = require('../modules/database.js');
const btc = require('../modules/btc-utils.js');

describe('dispatcher helpers', () =>
{
	afterEach(() =>
	{
		jest.clearAllMocks();
	});

	test('getTotalRetrievedTransAmount sums values', () =>
	{
		const amount = dispatcher.getTotalRetrievedTransAmount([{ value: 10 }, { value: 20 }]);
		expect(amount).toBe(30);
	});

	test('getAddys returns a flat list of addresses', () =>
	{
		const addys = dispatcher.getAddys([{ addy: 'a' }, { addy: 'b' }]);
		expect(addys).toEqual(['a', 'b']);
	});
});

describe('dispatcher.dispatch', () =>
{
	beforeEach(() =>
	{
		jest.clearAllMocks();
	});

	test('returns a friendly message when there are no pending requests', async () =>
	{
		db.getRequestBatch.mockResolvedValue([]);
		const message = await dispatcher.dispatch();
		expect(message).toBe("no pending transactions!!!!!!!!!!!");
		expect(db.getCurrAddy).not.toHaveBeenCalled();
	});

	test('processes transactions when funds are available', async () =>
	{
		db.getRequestBatch.mockResolvedValue([{ id: 1, value: 10, addy: 'addr-1' }]);
		db.getCurrAddy.mockResolvedValue({ id: 1, balance: 100, addy: 'addr-0', indx: 0, walletId: 1 });
		btc.generateNewAddress.mockReturnValue('addr-2');
		btc.getTxFee.mockResolvedValue(5);

		const fakeTx = {
			getId: () => 'hash-1',
			toHex: () => 'hex-1'
		};

		const fakeResponse = { tx: { hash: 'hash-1' } };

		btc.processTransaction.mockResolvedValue({ tx: fakeTx, response: fakeResponse });

		const response = await dispatcher.dispatch();

		expect(response).toEqual(fakeResponse);
		expect(btc.generateNewAddress).toHaveBeenCalled();
		expect(db.saveAddy).toHaveBeenCalled();
		expect(db.updateAddy).toHaveBeenCalled();
		expect(db.setCurrAddy).toHaveBeenCalledWith('addr-2', expect.any(Number), 'addr-0');
		expect(db.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ status: 'PUSHED' }), { id: 1 });
	});
});

