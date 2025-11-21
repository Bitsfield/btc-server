const chai = require('chai');
const expect = chai.expect;
const crypter = require('../../modules/crypt.js');

describe('Crypt Module', () => {
  const text = 'My super secret information.';
  const key = 'My32charPasswordAndInitVectorStr'; // must be 32 chars

  it('should encrypt text and decrypt back to original', () => {
    const encrypted = crypter.encrypt(text, key);
    expect(encrypted).to.be.a('string').and.not.empty;
    const decrypted = crypter.decrypt(encrypted, key);
    expect(decrypted).to.equal(text);
  });

  it('should fail decryption with wrong key', () => {
    const key2 = 'WrongKeyLengthOrValue12345678'; // 32 chars but different
    const encrypted = crypter.encrypt(text, key);
    expect(() => crypter.decrypt(encrypted, key2)).to.throw();
  });

  it('should handle empty text', () => {
    const emptyText = '';
    const encrypted = crypter.encrypt(emptyText, key);
    const decrypted = crypter.decrypt(encrypted, key);
    expect(decrypted).to.equal(emptyText);
  });
});
