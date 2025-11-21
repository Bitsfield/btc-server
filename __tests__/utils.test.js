const utils = require('../modules/utils');
const crypter = require('../modules/crypt');

describe('Utils Module', () => {
  
  describe('returnSuccessfulResponse', () => {
    test('should return a successful response object', () => {
      const result = utils.returnSuccessfulResponse('Test success', { data: 'test' });
      expect(result).toEqual({
        code: 0,
        status: 'success',
        description: 'Test success',
        data: { data: 'test' }
      });
    });

    test('should handle null data', () => {
      const result = utils.returnSuccessfulResponse('Test success', null);
      expect(result.status).toBe('success');
      expect(result.data).toBeNull();
    });
  });

  describe('returnFailedResponse', () => {
    test('should return a failed response object', () => {
      const result = utils.returnFailedResponse('Test failure', { error: 'test' });
      expect(result).toEqual({
        code: 2,
        status: 'failed',
        description: 'Test failure',
        data: { error: 'test' }
      });
    });
  });

  describe('validateRequest', () => {
    test('should return true for valid request data', () => {
      const validData = {
        value: 100,
        addy: 'test-address',
        userId: '123',
        email: 'test@test.com'
      };
      expect(utils.validateRequest(validData)).toBe(true);
    });

    test('should return false when value is missing', () => {
      const invalidData = {
        addy: 'test-address',
        userId: '123',
        email: 'test@test.com'
      };
      expect(utils.validateRequest(invalidData)).toBe(false);
    });

    test('should return false when addy is missing', () => {
      const invalidData = {
        value: 100,
        userId: '123',
        email: 'test@test.com'
      };
      expect(utils.validateRequest(invalidData)).toBe(false);
    });

    test('should return false when userId is missing', () => {
      const invalidData = {
        value: 100,
        addy: 'test-address',
        email: 'test@test.com'
      };
      expect(utils.validateRequest(invalidData)).toBe(false);
    });

    test('should return false when email is missing', () => {
      const invalidData = {
        value: 100,
        addy: 'test-address',
        userId: '123'
      };
      expect(utils.validateRequest(invalidData)).toBe(false);
    });
  });

  describe('getToken', () => {
    test('should generate a token from valid data', () => {
      const data = {
        value: 100,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: '123',
        email: 'test@test.com'
      };
      const token = utils.getToken(data);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    test('should generate different tokens for different data', () => {
      const data1 = {
        value: 100,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: '123',
        email: 'test@test.com'
      };
      const data2 = {
        value: 200,
        addy: 'test-address-with-at-least-32-chars-long',
        userId: '456',
        email: 'test2@test.com'
      };
      const token1 = utils.getToken(data1);
      const token2 = utils.getToken(data2);
      expect(token1).not.toEqual(token2);
    });
  });

  describe('twoDigits', () => {
    test('should format single digit with leading zero', () => {
      expect(utils.twoDigits(5)).toBe('05');
    });

    test('should not modify double digits', () => {
      expect(utils.twoDigits(15)).toBe('15');
    });

    test('should handle zero', () => {
      expect(utils.twoDigits(0)).toBe('00');
    });

    test('should handle negative single digits', () => {
      expect(utils.twoDigits(-5)).toBe('-05');
    });

    test('should handle negative double digits', () => {
      expect(utils.twoDigits(-15)).toBe('-15');
    });
  });

  describe('doTestCrypt', () => {
    test('should execute without throwing errors', () => {
      expect(() => utils.doTestCrypt()).not.toThrow();
    });
  });

  describe('PENDING constant', () => {
    test('should be defined', () => {
      expect(utils.PENDING).toBe('PENDING');
    });
  });
});

