// Mock sequelize models before requiring database module
jest.mock('../models/index.js');

const database = require('../modules/database.js');
const models = require('../models/index.js');

describe('Database Module', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveRequest', () => {
    test('should create a new request', async () => {
      const mockRequest = {
        value: 100,
        addy: 'test-address',
        userId: 'user123',
        email: 'test@test.com',
        status: 'PENDING'
      };

      models.Req = {
        create: jest.fn().mockResolvedValue({ id: 1, ...mockRequest })
      };

      const result = await database.saveRequest(mockRequest);

      expect(models.Req.create).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual({ id: 1, ...mockRequest });
    });

    test('should handle errors', async () => {
      models.Req = {
        create: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      await expect(database.saveRequest({}))
        .rejects.toThrow('Database error');
    });
  });

  describe('getCurrAddy', () => {
    test('should return current active address', async () => {
      const mockAddress = {
        id: 1,
        addy: 'test-address',
        active: true,
        spent: false,
        balance: 1000
      };

      models.Addy = {
        findOne: jest.fn().mockResolvedValue(mockAddress)
      };

      const result = await database.getCurrAddy();

      expect(models.Addy.findOne).toHaveBeenCalledWith({
        where: { active: true, spent: false }
      });
      expect(result).toEqual(mockAddress);
    });

    test('should return null when no active address', async () => {
      models.Addy = {
        findOne: jest.fn().mockResolvedValue(null)
      };

      const result = await database.getCurrAddy();

      expect(result).toBeNull();
    });
  });

  describe('getRequestBatch', () => {
    test('should return pending requests', async () => {
      const mockRequests = [
        { id: 1, status: 'PENDING', value: 100 },
        { id: 2, status: 'PENDING', value: 200 }
      ];

      models.Req = {
        findAll: jest.fn().mockResolvedValue(mockRequests)
      };

      const result = await database.getRequestBatch();

      expect(models.Req.findAll).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        limit: 10
      });
      expect(result).toEqual(mockRequests);
    });

    test('should limit results to 10', async () => {
      models.Req = {
        findAll: jest.fn().mockResolvedValue([])
      };

      await database.getRequestBatch();

      const callArgs = models.Req.findAll.mock.calls[0][0];
      expect(callArgs.limit).toBe(10);
    });
  });

  describe('saveAddy', () => {
    test('should create a new address', async () => {
      const mockAddy = {
        walletId: 1,
        addy: 'test-address',
        path: "m/0'/0/0",
        hardened: false,
        spent: false,
        active: false,
        balance: 0,
        prevAddy: null,
        indx: 0
      };

      models.Addy = {
        create: jest.fn().mockResolvedValue({ id: 1, ...mockAddy })
      };

      const result = await database.saveAddy(mockAddy);

      expect(models.Addy.create).toHaveBeenCalledWith(mockAddy);
      expect(result).toEqual(mockAddy);
    });
  });

  describe('updateAddy', () => {
    test('should update address with given data', async () => {
      const updateData = {
        balance: 0,
        active: false,
        spent: true
      };

      const where = { id: 1 };

      models.Addy = {
        update: jest.fn().mockResolvedValue([1])
      };

      const result = await database.updateAddy(updateData, where);

      expect(models.Addy.update).toHaveBeenCalledWith(updateData, { where });
      expect(result).toEqual([1]);
    });
  });

  describe('setCurrAddy', () => {
    test('should set new current address', async () => {
      const mockAddy = {
        id: 2,
        addy: 'new-address',
        spent: true,
        active: false,
        balance: 0,
        prevAddy: null,
        save: jest.fn().mockResolvedValue(true)
      };

      models.Addy = {
        findOne: jest.fn().mockResolvedValue(mockAddy)
      };

      await database.setCurrAddy('new-address', 500, 'old-address');

      expect(models.Addy.findOne).toHaveBeenCalledWith({
        where: { addy: 'new-address' }
      });
      expect(mockAddy.spent).toBe(false);
      expect(mockAddy.active).toBe(true);
      expect(mockAddy.balance).toBe(500);
      expect(mockAddy.prevAddy).toBe('old-address');
      expect(mockAddy.save).toHaveBeenCalled();
    });
  });

  describe('updateRequest', () => {
    test('should update request with given data', async () => {
      const updateData = {
        status: 'PUSHED',
        hash: 'transaction-hash'
      };

      const where = { id: 1 };

      models.Req = {
        update: jest.fn().mockResolvedValue([1])
      };

      const result = await database.updateRequest(updateData, where);

      expect(models.Req.update).toHaveBeenCalledWith(updateData, { where });
      expect(result).toEqual([1]);
    });
  });

  describe('getActiveAddys', () => {
    test('should return all active addresses', async () => {
      const mockAddresses = [
        { id: 1, addy: 'addr1', active: true },
        { id: 2, addy: 'addr2', active: true }
      ];

      models.Addy = {
        findAll: jest.fn().mockResolvedValue(mockAddresses)
      };

      const result = await database.getActiveAddys();

      expect(models.Addy.findAll).toHaveBeenCalledWith({
        where: { active: true }
      });
      expect(result).toEqual(mockAddresses);
    });
  });

  describe('saveTransaction', () => {
    test('should create a new transaction', async () => {
      const mockTrans = {
        addys: 'addr1,addr2',
        value: 1000,
        hash: 'tx-hash',
        hex: 'tx-hex',
        status: 'PUSHED'
      };

      models.Tran = {
        create: jest.fn().mockResolvedValue({ id: 1, ...mockTrans })
      };

      const result = await database.saveTransaction(mockTrans);

      expect(models.Tran.create).toHaveBeenCalledWith(mockTrans);
      expect(result).toEqual({ id: 1, ...mockTrans });
    });

    test('should handle errors', async () => {
      models.Tran = {
        create: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      await expect(database.saveTransaction({}))
        .rejects.toThrow('Database error');
    });
  });

  describe('incrementWalletAddyCount', () => {
    test('should increment wallet address count', async () => {
      const mockWallet = {
        id: 1,
        addresses: 5,
        increment: jest.fn().mockResolvedValue(true)
      };

      models.Wallet = {
        findById: jest.fn().mockResolvedValue(mockWallet)
      };

      await database.incrementWalletAddyCount(1);

      expect(models.Wallet.findById).toHaveBeenCalledWith(1);
      expect(mockWallet.increment).toHaveBeenCalledWith('addresses', { by: 1 });
    });
  });
});

