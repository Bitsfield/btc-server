
const database = require('./database.js');

const utils = require('./utils.js');

const saveRequest = async function(token, data)
{
        token = token.replace("EKOINX ", "");
        data.ref = new Buffer(token.substr(0, 10) + new Date().getTime()).toString("base64");                                                                   
        data.status = utils.PENDING;
        data.remarks = "TRANSACTION RECEIVED " + new Date();

        let cipher = utils.getToken(data);

        console.log("token: " + token);
        console.log('cipher: ' + cipher);

	if(token == cipher) {
		console.log(data);
		try {
			await database.saveRequest(data);
			return {success: true};
		} catch (e) {
			throw e;
		}
	} else {
		throw new Error('Invalid token');
	}
}

async function getActiveAddys() {
        return await database.getActiveAddys();
}

module.exports = {
	saveRequest : saveRequest,
	getActiveAddys: getActiveAddys
}
