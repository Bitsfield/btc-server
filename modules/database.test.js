jest.mock('../models/index.js');
const models = require('../models/index.js');
const utils = require('./utils.js');
const database = require('./database.js');

describe('database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    models.Req = { create: jest.fn().mockResolvedValue({}) };
    models.Addy = { 
      findOne: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue([1]),
      create: jest.fn().mockResolvedValue({}) 
    };
    models.Wallet = { 
      findById: jest.fn().mockResolvedValue({ 
        increment: jest.fn().mockResolvedValue({}) 
      }) 
    };
    models.Tran = { create: jest.fn().mockResolvedValue({}) };
    utils.PENDING = 'PENDING';
  });

  it('saveRequest', async () => {
    const data = {};
    const result = await database.saveRequest(data);
    expect(models.Req.create).toHaveBeenCalledWith(data);
  });

  it('getCurrAddy', async () => {
    models.Addy.findOne.mockResolvedValue({ addy: 'test' });
    const result = await database.getCurrAddy();
    expect(models.Addy.findOne).toHaveBeenCalledWith({where: {'active': true, 'spent': false}});
    expect(result.addy).toBe('test');
  });

  it('getRequestBatch', async () => {
    models.Req.findAll = jest.fn().mockResolvedValue([]);
    const result = await database.getRequestBatch();
    expect(models.Req.findAll).toHaveBeenCalledWith({ where: {'status': 'PENDING'}, limit : 10 });
  });

  it('saveAddy', async () => {
    const addy = {};
    const result = await database.saveAddy(addy);
    expect(models.Addy.create).toHaveBeenCalledWith(addy);
    expect(result).toBeDefined();
  });

  it('incrementWalletAddyCount', async () => {
    const walletId = 1;
    await database.incrementWalletAddyCount(walletId);
    expect(models.Wallet.findById).toHaveBeenCalledWith(walletId);
  });

  it('updateAddy', async () => {
    const data = {};
    const where = {};
    const result = await database.updateAddy(data, where);
    expect(models.Addy.update).toHaveBeenCalledWith(data, {where});
  });

  it('setCurrAddy', async () => {
    models.Addy.findOne.mockResolvedValue({ save: jest.fn().mockResolvedValue({}) });
    const newAddy = 'new';
    const change = 0;
    const prevAddy = 'prev';
    await database.setCurrAddy(newAddy, change, prevAddy);
    expect(models.Addy.findOne).toHaveBeenCalledWith({where: {'addy': newAddy}});
  });

  it('updateRequest', async () => {
    models.Req.update = jest.fn().mockResolvedValue([1]);
    const data = {};
    const where = {};
    const result = await database.updateRequest(data, where);
    expect(models.Req.update).toHaveBeenCalledWith(data, {where});
  });

  it('getActiveAddys', async () => {
    models.Addy.findAll = jest.fn().mockResolvedValue([]);
    const result = await database.getActiveAddys();
    expect(models.Addy.findAll).toHaveBeenCalledWith({where: {'active': true}});
  });

  it('saveTransaction', async () => {
    const trans = {};
    const result = await database.saveTransaction(trans);
    expect(models.Tran.create).toHaveBeenCalledWith(trans);
  });
});
