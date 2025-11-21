const models = require('../models/index.js');
const utils = require('./utils.js');

const LIMIT = 10;
const Op = require('sequelize').Op;

module.exports = {

	saveRequest : async function(data) { 
		return await models.Req.create(data);
	},

	getCurrAddy : async function() { 
		return await models.Addy.findOne({where: {'active': true, 'spent': false}});
	},

	getRequestBatch : async function() {
		return await models.Req.findAll( { where: {'status': utils.PENDING }, limit : LIMIT } );
	},

	saveAddy : async function(addy) {
		const created = await models.Addy.create(addy);
		return created;
	},

	incrementWalletAddyCount : async function(walletId) {
		const wallet = await models.Wallet.findById(walletId);
		if (wallet) {
			console.log("Retrieved wallet: " + wallet);
			await wallet.increment('addresses', {by: 1});
		}
	},

	updateAddy : async function(data, where) {
		return await models.Addy.update(data, {where: where});
	},

	setCurrAddy : async function(newAddy, change, prevAddy) {
		const addy = await models.Addy.findOne({where: {'addy': newAddy}});
		if (addy) {
			addy.spent = false;
			addy.active = true;
			addy.balance = change;
			// prevAddy not used in original, but perhaps set prevAddy field if exists
			await addy.save();
		}
	},

	updateRequest : async function(data, where) {
		return await models.Req.update(data, {where: where});
	},

	getActiveAddys : async function()
	{
		return await models.Addy.findAll({where: {'active': true}});
	},

	saveTransaction : async function(trans) {
		return await models.Tran.create(trans);
	}
}

////update new current address (balance = change, active = true, spent = false, previous_addy)