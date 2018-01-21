
var crypto = require('crypto');
var encryptionMethod = 'AES-256-CBC';

module.exports = {

  encrypt: function(plain_text, key)
  {
      var iv = key.substr(0,16);
      var encryptor = crypto.createCipheriv(encryptionMethod, key, iv);
      return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');
  },

  decrypt: function (encryptedMessage, key)
  {
      var iv = key.substr(0,16);
      var decryptor = crypto.createDecipheriv(encryptionMethod, key, iv);
      return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
  }

}