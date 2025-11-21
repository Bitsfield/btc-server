// Mock dependencies
jest.mock('../modules/database.js');
jest.mock('../modules/btc-utils.js');

const dispatcher = require('../modules/dispatcher');
const db = require('../modules/database.js');
const btc = require('../modules/btc-utils.js');

describe('Dispatcher Module', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dispatch', () => {
    test('should return message when no pending transactions', async () => {
      db.getRequestBatch.mockResolvedValue([]);

      const result = await dispatcher.dispatch();

      expect(result).toBe('no pending transactions!!!!!!!!!!!');
      expect(db.getRequestBatch).toHaveBeenCalled();
    });

    test('should return message when insufficient balance', async () => {
      const mockTransactions = [
        { id: 1, value: 1000, addy: 'dest-addr1' },
        { id: 2, value: 500, addy: 'dest-addr2' }
      ];

      const mockCurrentAddress = {
        id: 1,
        addy: 'current-addr',
        balance: 1000, // Less than 1500 needed
        indx: 0
      };

      db.getRequestBatch.mockResolvedValue(mockTransactions);
      db.getCurrAddy.mockResolvedValue(mockCurrentAddress);

      const result = await dispatcher.dispatch();

      expect(result).toContain("don't have enough funds");
      expect(db.getRequestBatch).toHaveBeenCalled();
      expect(db.getCurrAddy).toHaveBeenCalled();
    });

    test('should process transaction when sufficient balance', async () => {
      const mockTransactions = [
        { id: 1, value: 100, addy: 'dest-addr1' },
        { id: 2, value: 200, addy: 'dest-addr2' }
      ];

      const mockCurrentAddress = {
        id: 1,
        addy: 'current-addr',
        balance: 1000,
        indx: 0,
        walletId: 1
      };

      const mockResponse = {
        tx: { hash: 'tx-hash-123' },
        status: 'success'
      };

      db.getRequestBatch.mockResolvedValue(mockTransactions);
      db.getCurrAddy.mockResolvedValue(mockCurrentAddress);
      db.saveAddy.mockResolvedValue({ id: 2, addy: 'new-addr' });
      db.updateAddy.mockResolvedValue([1]);
      db.setCurrAddy.mockResolvedValue(true);
      db.updateRequest.mockResolvedValue([1]);
      db.saveTransaction.mockResolvedValue({ id: 1 });
      
      btc.generateNewAddress.mockReturnValue('new-addr');
      btc.getTxFee.mockResolvedValue(50);
      btc.processTransaction.mockResolvedValue({
        tx: { 
          getId: () => 'tx-hash-123',
          toHex: () => 'tx-hex-data'
        },
        response: { tx: { hash: 'tx-hash-123' } }
      });

      const result = await dispatcher.dispatch();

      expect(db.getRequestBatch).toHaveBeenCalled();
      expect(db.getCurrAddy).toHaveBeenCalled();
      expect(btc.generateNewAddress).toHaveBeenCalledWith(mockCurrentAddress);
      expect(db.saveAddy).toHaveBeenCalled();
      expect(btc.getTxFee).toHaveBeenCalledWith(1, 3, 'low');
      expect(btc.processTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test('should handle errors gracefully', async () => {
      db.getRequestBatch.mockRejectedValue(new Error('Database error'));

      await expect(dispatcher.dispatch()).rejects.toThrow('Database error');
    });
  });

  describe('test', () => {
    test('should call dispatch', async () => {
      db.getRequestBatch.mockResolvedValue([]);

      const result = await dispatcher.test();

      expect(result).toBe('no pending transactions!!!!!!!!!!!');
      expect(db.getRequestBatch).toHaveBeenCalled();
    });
  });
});

