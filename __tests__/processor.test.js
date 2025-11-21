const processor = require('../modules/processor');

// Mock the database module
jest.mock('../modules/database.js');
const database = require('../modules/database.js');

describe('Processor Module', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveRequest', () => {
    test('should save valid request with matching token', async () => {
      // Generate valid token for the test data
      const mockData = {
        value: 100,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: 'user123',
        email: 'test@test.com'
      };

      // Get actual token
      const utils = require('../modules/utils.js');
      const validToken = 'EKOINX ' + utils.getToken(mockData);

      database.saveRequest.mockResolvedValue({ id: 1, ...mockData });

      const result = await processor.saveRequest(validToken, mockData);

      expect(database.saveRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test('should throw error for mismatched token', async () => {
      const mockData = {
        value: 100,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: 'user123',
        email: 'test@test.com'
      };

      await expect(processor.saveRequest('EKOINX wrong-token', mockData))
        .rejects.toThrow('Unauthorized - Token mismatch');

      expect(database.saveRequest).not.toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      const mockData = {
        value: 100,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: 'user123',
        email: 'test@test.com'
      };

      database.saveRequest.mockRejectedValue(new Error('Database error'));

      await expect(processor.saveRequest('EKOINX test-token', mockData))
        .rejects.toThrow();
    });

    test('should add reference and status to data', async () => {
      const mockData = {
        value: 100,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: 'user123',
        email: 'test@test.com'
      };

      // Generate valid token for the test data
      const utils = require('../modules/utils.js');
      const validToken = 'EKOINX ' + utils.getToken(mockData);

      database.saveRequest.mockResolvedValue({ id: 1 });

      await processor.saveRequest(validToken, mockData);

      expect(mockData.ref).toBeDefined();
      expect(mockData.status).toBe('PENDING');
      expect(mockData.remarks).toContain('TRANSACTION RECEIVED');
    });
  });

  describe('getActiveAddys', () => {
    test('should return active addresses', async () => {
      const mockAddresses = [
        { id: 1, addy: 'addr1', active: true, spent: false },
        { id: 2, addy: 'addr2', active: true, spent: false }
      ];

      database.getActiveAddys.mockResolvedValue(mockAddresses);

      const result = await processor.getActiveAddys();

      expect(result).toEqual(mockAddresses);
      expect(database.getActiveAddys).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when no active addresses', async () => {
      database.getActiveAddys.mockResolvedValue([]);

      const result = await processor.getActiveAddys();

      expect(result).toEqual([]);
      expect(database.getActiveAddys).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors', async () => {
      database.getActiveAddys.mockRejectedValue(new Error('Database error'));

      await expect(processor.getActiveAddys())
        .rejects.toThrow('Database error');
    });
  });
});

