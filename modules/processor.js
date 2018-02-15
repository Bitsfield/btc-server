
const database = require('./database.js');

const utils = require('./utils.js');

const saveRequest = function(token, data, success, failure)
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
		database.saveRequest(data, success);
   	}
    else
    {
    	failure();
    }
}

function getActiveAddys(callback, error)
{
	return database.getActiveAddys(callback, error);
}

module.exports = {
	saveRequest : saveRequest,
	getActiveAddys: getActiveAddys
}
