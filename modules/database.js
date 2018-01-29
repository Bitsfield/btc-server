const models = require('../models/index.js');
const utils = require('./utils.js');

const LIMIT = 10;
const Op = require('sequelize').Op;

module.exports = {

	saveTrans : function(data, callback) { 
		models.Trans.create(data).then(callback).catch((err)=>{console.log("farts! " + err)}); 
	},

	getCurrAddy : function(callback, error) { 
		models.Addy.findOne({where: {'active': true, 'spent': false}}).then(callback).catch(error);
	},

	getTransBatch : function(callback, error) {
		models.Trans.findAll( { where: {'status': utils.PENDING }, limit : LIMIT } ).then(callback).catch(error);
	},

	saveAddy : function(addy) {
		models.Addy.create(addy).then(callback).catch((err) => { console.log("Farts! Something just happen right now! ", err) });
	},

	incrementWalletAddyCount : function(walletId) {
		models.Wallet.findById(walletId).then(wallet => {
			wallet.increment('addresses', {by: 1});
		}),
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

	updateTrans : function(data, where) {
		models.Trans.update(data, {where: where});
	},
}

////update new current address (balance = change, active = true, spent = false, previous_addy)