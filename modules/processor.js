
const database = require('./database.js');
const bitcoin = require('bitcoinjs-lib');
const network = bitcoin.networks.bcy.test;
const BigInteger = require('bigi');

const utils = require('./utils.js');

const saveTransactionRequest = function(token, data, success, failure)
{
	token = token.replace("EKOINX ", "");
	data.ref = new Buffer(token.substr(0, 10) + new Date().getTime()).toString("base64");
	data.status = utils.PENDING;
	data.remarks = "TRANSACTION RECEIVED " + new Date();

	let cipher = utils.getToken(data);

	console.log("token: " + token);
	console.log('cipher: ' + cipher);

	if(token == cipher)
	{
		console.log(data);
		database.saveTrans(data, success);
   	}
    else
    {
    	failure();
    }
}

const getCurrentAddress = function(callback)
{
	

}
 
const newWallet = function(){};

module.exports = {

	saveTransactionRequest : saveTransactionRequest,
	test : newWallet
}
