const crypter = require('./crypt.js');

module.exports = {

	PENDING : 'PENDING',
	
	returnSuccessfulResponse : function(description, data)
	{
		return {
			code: 0,
			status: 'success',
			description: description,
			data: data
		};
	},

	returnFailedResponse : function(description, data)
	{
		return {
			code: 2,
			status: 'failed',
			description: description,
			data: data
		};
	},

	validateRequest : function(data)
	{
		if(typeof data.value == 'undefined'
			|| typeof data.addy == 'undefined'
			|| typeof data.userId == 'undefined'
			|| typeof data.email == 'undefined')
		{
			return false;
		}
		else
		{
			return true;
		}
	},

	getToken : function(data)
	{
		console.log(data);
		let token = crypter.encrypt(data.value+data.addy+data.userId+data.email, data.addy.substr(0,32));
		return token;
	},

	doTestCrypt : function()
	{
		let textToEncrypt = 'My super secret information.';
		let secret = "My32charPasswordAndInitVectorStr"; //must be 32 char length

		let encryptedMessage = crypter.encrypt(textToEncrypt, secret);
		let decryptedMessage = crypter.decrypt(encryptedMessage, secret);

		console.log(encryptedMessage);
		console.log(decryptedMessage);
	},

	twoDigits : function(d)
	{
	    if(0 <= d && d < 10) return "0" + d.toString();
	    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	    return d.toString();
	}


}