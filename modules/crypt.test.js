const crypt = require('./crypt.js');

describe('crypt', () => {
  const text = 'secret message';
  const key = 'My32charPasswordAndInitVectorStr'; // 32 chars

  it('encrypts text', () => {
    const encrypted = crypt.encrypt(text, key);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(text);
    expect(encrypted.length).toBeGreaterThan(text.length);
  });

  it('decrypts to original text', () => {
    const encrypted = crypt.encrypt(text, key);
    const decrypted = crypt.decrypt(encrypted, key);
    expect(decrypted).toBe(text);
  });

  it('throws on decrypt with wrong key', () => {
    const encrypted = crypt.encrypt(text, key);
    const wrongKey = 'wrong key';
    expect(() => crypt.decrypt(encrypted, wrongKey)).toThrow();
  });
});
