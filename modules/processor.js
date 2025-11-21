
const database = require('./database.js');

const utils = require('./utils.js');

async function saveRequest(token, data) {
	token = token.replace("EKOINX ", "");
	data.ref = Buffer.from(token.substr(0, 10) + new Date().getTime()).toString("base64");
	data.status = utils.PENDING;
	data.remarks = "TRANSACTION RECEIVED " + new Date();

	let cipher = utils.getToken(data);

	console.log("token: " + token);
	console.log('cipher: ' + cipher);

	if (token == cipher) {
		console.log(data);
		return await database.saveRequest(data);
	} else {
		throw new Error('Token mismatch');
	}
}

async function getActiveAddys() {
    return await database.getActiveAddys();
}

module.exports = {
	saveRequest,
	getActiveAddys
}
