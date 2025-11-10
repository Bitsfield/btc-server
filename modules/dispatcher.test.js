const dispatcher = require('./dispatcher');
const db = require('./database');
const btc = require('./btc-utils');
const dateFormat = require('dateformat');

jest.mock('./database');
jest.mock('./btc-utils');
jest.mock('dateformat');

describe('Dispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test', () => {
    it('should call dispatch', async () => {
      const result = await dispatcher.test();
      expect(result).toBeDefined();
      expect(db.getRequestBatch).toHaveBeenCalled();
    });
  });

  describe('dispatch', () => {
    it('should return no pending if no requests', async () => {
      db.getRequestBatch.mockResolvedValue([]);
      const result = await dispatcher.dispatch();
      expect(result).toEqual('no pending transactions!!!!!!!!!!!');
    });

    it('should abort if insufficient balance', async () => {
      db.getRequestBatch.mockResolvedValue([{value: 100}]);
      db.getCurrAddy.mockResolvedValue({balance: 50});
      const result = await dispatcher.dispatch();
      expect(result).toContain("don't have enough funds");
    });

    it('should process transaction if sufficient balance', async () => {
      db.getRequestBatch.mockResolvedValue([{value: 10, addy: 'a1', id: 1}]);
      db.getCurrAddy.mockResolvedValue({balance: 100, addy: 'old', indx: 0, id: 1, walletId: 1});
      btc.generateNewAddress.mockReturnValue('newAddy');
      db.saveAddy.mockResolvedValue({id: 2});
      btc.getTxFee.mockResolvedValue(5);
      btc.processTransaction.mockResolvedValue({tx: {getId: () => 'hash', toHex: () => 'hex'}, response: {tx: {hash: 'hash'}}});
      db.updateAddy.mockResolvedValue([1]);
      db.setCurrAddy.mockResolvedValue({});
      db.updateRequest.mockResolvedValue([1]);
      dateFormat.mockReturnValue('2025-11-10 00:00:00');
      const result = await dispatcher.dispatch();
      expect(btc.processTransaction).toHaveBeenCalledWith('newAddy', expect.any(Object), expect.any(Array), 10, 85);
      expect(db.updateRequest).toHaveBeenCalledWith({status: 'PUSHED', hash: 'hash'}, { id: 1 });
      expect(result).toEqual({tx: {hash: 'hash'}});
    });
  });
});
