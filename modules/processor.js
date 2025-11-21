
const database = require('./database.js');

const utils = require('./utils.js');

const saveRequest = async function(token, data)
{
	try
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
			return await database.saveRequest(data);
		}
		else
		{
			throw new Error('Unauthorized - Token mismatch');
		}
	}
	catch(err)
	{
		console.error('Error saving request:', err);
		throw err;
	}
}

async function getActiveAddys()
{
	try
	{
		return await database.getActiveAddys();
	}
	catch(error)
	{
		console.error('Error getting active addresses:', error);
		throw error;
	}
}

module.exports = {
	saveRequest : saveRequest,
	getActiveAddys: getActiveAddys
}
