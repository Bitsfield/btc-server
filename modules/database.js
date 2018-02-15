const models = require('../models/index.js');
const utils = require('./utils.js');

const LIMIT = 10;
const Op = require('sequelize').Op;

module.exports = {

	saveRequest : function(data, callback) { 
		models.Req.create(data).then(callback);
	},

	getCurrAddy : function(callback) { 
		models.Addy.findOne({where: {'active': true, 'spent': false}}).then(callback);
	},

	getRequestBatch : function(callback) {
		models.Req.findAll( { where: {'status': utils.PENDING }, limit : LIMIT } ).then(callback);
	},

	saveAddy : function(addy, callback) {
		models.Addy.create(addy).then(callback(addy));
	},

	incrementWalletAddyCount : function(walletId) {
		models.Wallet.findById(walletId).then(wallet => {
			console.log("Retrieved wallet: " + wallet);
			wallet.increment('addresses', {by: 1});
		});
	},

	updateAddy : function(data, where) {
		models.Addy.update(data, {where: where});
	},

	setCurrAddy : function(newAddy, change, prevAddy) {
		models.Addy.findOne({where: {'addy': newAddy}}).then(addy => {
			addy.spent = false;
			addy.active = true;
			addy.balance = change;
			prevAddy = prevAddy;
			addy.save();
		});
	},

	updateRequest : function(data, where) {
		models.Req.update(data, {where: where});
	},

	getActiveAddys : function(callback, error)
	{
		models.Addy.findAll({where: {'active': true}}).then(callback).catch(error);
	},

	saveTransaction : function(trans, cb, err) {
		models.Tran.create(trans).then(cb).catch(err);
	}
}

////update new current address (balance = change, active = true, spent = false, previous_addy)