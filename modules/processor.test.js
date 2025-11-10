const processor = require('./processor.js');

jest.mock('./database.js');
const database = require('./database.js');

jest.mock('./utils.js');
const utils = require('./utils.js');

describe('processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    utils.PENDING = 'PENDING';
    utils.getToken = jest.fn().mockReturnValue('cipher');
    database.saveRequest = jest.fn().mockResolvedValue({});
    database.getActiveAddys = jest.fn().mockResolvedValue([]);
  });

  it('saveRequest succeeds', async () => {
    const token = 'EKOINX cipher';
    const data = { value: 1, addy: 'a', userId: 'u', email: 'e' };
    await processor.saveRequest(token, data);
    expect(utils.getToken).toHaveBeenCalledWith(data);
    expect(database.saveRequest).toHaveBeenCalledWith(data);
  });

  it('saveRequest throws Unauthorized on mismatch', async () => {
    const token = 'EKOINX wrong';
    const data = { value: 1, addy: 'a', userId: 'u', email: 'e' };
    utils.getToken.mockReturnValue('different');
    await expect(processor.saveRequest(token, data)).rejects.toThrow('Unauthorized');
  });

  it('getActiveAddys returns from database', async () => {
    database.getActiveAddys.mockResolvedValue(['addy']);
    const result = await processor.getActiveAddys();
    expect(result).toEqual(['addy']);
  });
});
