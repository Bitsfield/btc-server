const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const utils = require('../../modules/utils.js');
const crypter = require('../../modules/crypt.js');

describe('Utils Module', () => {
  describe('returnSuccessfulResponse', () => {
    it('should return success object with code 0', () => {
      const result = utils.returnSuccessfulResponse('test desc', {key: 'value'});
      expect(result).to.have.property('code', 0);
      expect(result.status).to.equal('success');
      expect(result.description).to.equal('test desc');
      expect(result.data).to.deep.equal({key: 'value'});
    });
  });

  describe('returnFailedResponse', () => {
    it('should return failed object with code 2', () => {
      const result = utils.returnFailedResponse('test error', null);
      expect(result.code).to.equal(2);
      expect(result.status).to.equal('failed');
      expect(result.description).to.equal('test error');
      expect(result.data).to.equal(null);
    });
  });

  describe('validateRequest', () => {
    it('should return true for valid data', () => {
      const data = {value: 1, addy: 'test', userId: 123, email: 'test@email.com'};
      expect(utils.validateRequest(data)).to.be.true;
    });

    it('should return false for missing value', () => {
      const data = {addy: 'test', userId: 123, email: 'test@email.com'};
      expect(utils.validateRequest(data)).to.be.false;
    });

    it('should return false for missing addy', () => {
      const data = {value: 1, userId: 123, email: 'test@email.com'};
      expect(utils.validateRequest(data)).to.be.false;
    });

    it('should return false for missing userId', () => {
      const data = {value: 1, addy: 'test', email: 'test@email.com'};
      expect(utils.validateRequest(data)).to.be.false;
    });

    it('should return false for missing email', () => {
      const data = {value: 1, addy: 'test', userId: 123};
      expect(utils.validateRequest(data)).to.be.false;
    });
  });

  describe('getToken', () => {
    it('should generate token that can be decrypted back to original string', () => {
      const data = {
        value: '123',
        addy: 'testaddy1234567890123456789012345678901234567890', // longer for key
        userId: 'user1',
        email: 'e@test.com'
      };
      const original = data.value + data.addy + data.userId + data.email;
      const key = data.addy.substr(0, 32);
      const token = utils.getToken(data);
      const decrypted = crypter.decrypt(token, key);
      expect(decrypted).to.equal(original);
    });
  });

  describe('twoDigits', () => {
    it('should pad positive single digit with zero', () => {
      expect(utils.twoDigits(5)).to.equal('05');
    });

    it('should pad negative single digit with -0', () => {
      expect(utils.twoDigits(-5)).to.equal('-05');
    });

    it('should not pad two digits', () => {
      expect(utils.twoDigits(10)).to.equal('10');
    });

    it('should handle zero', () => {
      expect(utils.twoDigits(0)).to.equal('00');
    });
  });

  // doTestCrypt performs console logs, can be tested by spying console but skipped for now
});
