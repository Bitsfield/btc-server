const crypter = require('../modules/crypt');

describe('Crypt Module', () => {
  const testSecret = 'My32charPasswordAndInitVectorStr'; // Must be 32 chars
  
  describe('encrypt', () => {
    test('should encrypt plain text', () => {
      const plainText = 'Hello World';
      const encrypted = crypter.encrypt(plainText, testSecret);
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plainText);
    });

    test('should produce different output for different inputs', () => {
      const text1 = 'Hello World';
      const text2 = 'Goodbye World';
      const encrypted1 = crypter.encrypt(text1, testSecret);
      const encrypted2 = crypter.encrypt(text2, testSecret);
      expect(encrypted1).not.toBe(encrypted2);
    });

    test('should handle empty strings', () => {
      const encrypted = crypter.encrypt('', testSecret);
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
    });

    test('should handle long strings', () => {
      const longText = 'a'.repeat(1000);
      const encrypted = crypter.encrypt(longText, testSecret);
      expect(encrypted).toBeTruthy();
    });
  });

  describe('decrypt', () => {
    test('should decrypt encrypted text correctly', () => {
      const plainText = 'Hello World';
      const encrypted = crypter.encrypt(plainText, testSecret);
      const decrypted = crypter.decrypt(encrypted, testSecret);
      expect(decrypted).toBe(plainText);
    });

    test('should handle empty string encryption/decryption', () => {
      const plainText = '';
      const encrypted = crypter.encrypt(plainText, testSecret);
      const decrypted = crypter.decrypt(encrypted, testSecret);
      expect(decrypted).toBe(plainText);
    });

    test('should handle special characters', () => {
      const plainText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = crypter.encrypt(plainText, testSecret);
      const decrypted = crypter.decrypt(encrypted, testSecret);
      expect(decrypted).toBe(plainText);
    });

    test('should handle unicode characters', () => {
      const plainText = '你好世界 🌍';
      const encrypted = crypter.encrypt(plainText, testSecret);
      const decrypted = crypter.decrypt(encrypted, testSecret);
      expect(decrypted).toBe(plainText);
    });
  });

  describe('encrypt/decrypt round trip', () => {
    test('should maintain data integrity through multiple encrypt/decrypt cycles', () => {
      let text = 'Original Message';
      for (let i = 0; i < 5; i++) {
        const encrypted = crypter.encrypt(text, testSecret);
        text = crypter.decrypt(encrypted, testSecret);
      }
      expect(text).toBe('Original Message');
    });

    test('should handle JSON data', () => {
      const jsonData = JSON.stringify({ user: 'test', id: 123, active: true });
      const encrypted = crypter.encrypt(jsonData, testSecret);
      const decrypted = crypter.decrypt(encrypted, testSecret);
      expect(decrypted).toBe(jsonData);
      expect(JSON.parse(decrypted)).toEqual({ user: 'test', id: 123, active: true });
    });
  });
});

