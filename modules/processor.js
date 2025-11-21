
const database = require('./database.js');
const utils = require('./utils.js');

async function saveRequest(token, data)
{
	if(typeof token === 'undefined' || token.indexOf('EKOINX') === -1) {
		throw new Error('Unauthorized');
	}

	token = token.replace("EKOINX ", "");
	data.ref = Buffer.from(token.substr(0, 10) + new Date().getTime().toString()).toString("base64");
	data.status = utils.PENDING;
	data.remarks = "TRANSACTION RECEIVED " + new Date();

	const cipher = utils.getToken(data);

	console.log("token: " + token);
	console.log('cipher: ' + cipher);

	if(token !== cipher)
	{
		throw new Error('Unauthorized');
	}

	console.log(data);
	return database.saveRequest(data);
}

async function getActiveAddys()
{
	return database.getActiveAddys();
}

module.exports = {
	saveRequest,
	getActiveAddys
};
