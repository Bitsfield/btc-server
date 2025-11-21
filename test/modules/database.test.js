const chai = require('chai');
const expect = chai.expect;
const database = require('../../modules/database.js');
const models = require('../../models/index.js');

describe('Database Module', () => {
  beforeEach(async function () {
    await models.sequelize.sync({ force: true });
  });

  after(async function () {
    await models.sequelize.close();
  });

  describe('saveRequest', () => {
    it('should create a new request record', async () => {
      const data = {
        addy: 'testaddy',
        value: 100.0,
        userId: 'user123',
        email: 'test@example.com',
        status: 'PENDING',
        ip: '127.0.0.1',
        ref: 'testref',
        remarks: 'test remark'
      };
      const result = await database.saveRequest(data);
      expect(result).to.have.property('id').that.is.a('number');
      expect(result.addy).to.equal(data.addy);
      expect(result.value).to.equal(data.value);
      // Verify persisted
      const saved = await models.Req.findOne({ where: { id: result.id } });
      expect(saved).to.exist;
      expect(saved.remarks).to.equal(data.remarks);
    });
  });

  describe('getActiveAddys', () => {
    it('should return only active addresses', async () => {
      await models.Addy.create({
        walletId: 1,
        indx: 0,
        path: 'm/0/0/0',
        addy: 'active1',
        hardened: false,
        spent: false,
        active: true,
        balance: 50.0
      });
      await models.Addy.create({
        walletId: 1,
        indx: 1,
        path: 'm/0/0/1',
        addy: 'inactive',
        hardened: false,
        active: false,
        balance: 0
      });
      const active = await database.getActiveAddys();
      expect(active).to.have.length(1);
      expect(active[0].addy).to.equal('active1');
      expect(active[0].active).to.be.true;
    });
  });

  describe('getCurrAddy', () => {
    it('should return active and unspent address', async () => {
      await models.Addy.create({
        walletId: 1,
        indx: 0,
        path: 'm/0/0/0',
        addy: 'current',
        hardened: false,
        spent: false,
        active: true,
        balance: 100.0
      });
      await models.Addy.create({
        walletId: 1,
        indx: 1,
        path: 'm/0/0/1',
        addy: 'spent-active',
        hardened: false,
        spent: true,
        active: true
      });
      const curr = await database.getCurrAddy();
      expect(curr).to.exist;
      expect(curr.addy).to.equal('current');
      expect(curr.spent).to.be.false;
      expect(curr.active).to.be.true;
    });

    it('should return null if no current addy', async () => {
      const curr = await database.getCurrAddy();
      expect(curr).to.be.null;
    });
  });

  describe('saveAddy', () => {
    it('should create new addy record', async () => {
      const addyData = {
        walletId: 1,
        indx: 0,
        path: 'm/0/0/0',
        addy: 'newaddy',
        hardened: false,
        spent: false,
        active: false,
        balance: 0,
        prevAddy: null
      };
      const result = await database.saveAddy(addyData);
      expect(result.id).to.be.a('number');
      expect(result.addy).to.equal('newaddy');
    });
  });

  // Add tests for updateAddy, setCurrAddy, etc. as needed
  describe('updateAddy', () => {
    let testAddy;
    beforeEach(async () => {
      testAddy = await models.Addy.create({
        walletId: 1,
        indx: 0,
        path: 'm/0/0/0',
        addy: 'updatable',
        hardened: false,
        spent: false,
        active: false,
        balance: 10
      });
    });

    it('should update addy fields', async () => {
      const updateData = { balance: 20, active: true };
      const [affectedCount] = await database.updateAddy(updateData, { id: testAddy.id });
      expect(affectedCount).to.equal(1);
      const updated = await models.Addy.findOne({ where: { id: testAddy.id } });
      expect(updated.balance).to.equal(20);
      expect(updated.active).to.be.true;
    });
  });

  // Similar for other functions...
});
