const utils = require('./utils.js');

describe('utils', () => {
  it('PENDING is defined', () => {
    expect(utils.PENDING).toBe('PENDING');
  });

  it('returnSuccessfulResponse returns correct structure', () => {
    const desc = 'test success';
    const data = { test: 'data' };
    const result = utils.returnSuccessfulResponse(desc, data);
    expect(result).toEqual({
      code: 0,
      status: 'success',
      description: desc,
      data: data
    });
  });

  it('returnFailedResponse returns correct structure', () => {
    const desc = 'test failed';
    const data = { test: 'data' };
    const result = utils.returnFailedResponse(desc, data);
    expect(result).toEqual({
      code: 2,
      status: 'failed',
      description: desc,
      data: data
    });
  });

  it('validateRequest returns true for valid data', () => {
    const valid = { value: 1, addy: 'addr', userId: 'user', email: 'email@test.com' };
    expect(utils.validateRequest(valid)).toBe(true);
  });

  it('validateRequest returns false for invalid data', () => {
    const invalid = { value: 1 };
    expect(utils.validateRequest(invalid)).toBe(false);
  });

  it('getToken returns a string', () => {
    const data = { value: '1', addy: 'a'.padEnd(32, '0'), userId: 'u', email: 'e' };
    const token = utils.getToken(data);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('twoDigits pads single digit with zero', () => {
    expect(utils.twoDigits(5)).toBe('05');
    expect(utils.twoDigits(0)).toBe('00');
    expect(utils.twoDigits(10)).toBe('10');
  });

  it('doTestCrypt does not throw', () => {
    expect(() => utils.doTestCrypt()).not.toThrow();
  });
});
