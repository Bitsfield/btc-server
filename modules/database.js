const models = require('../models/index.js');
const utils = require('./utils.js');

const LIMIT = 10;

async function saveRequest(data) {
	return models.Req.create(data);
}

async function getCurrAddy() {
	return models.Addy.findOne({ where: { active: true, spent: false } });
}

async function getRequestBatch() {
	return models.Req.findAll({ where: { status: utils.PENDING }, limit: LIMIT });
}

async function saveAddy(addy) {
	return models.Addy.create(addy);
}

async function incrementWalletAddyCount(walletId) {
	const wallet = await models.Wallet.findById(walletId);
	if (!wallet) {
		throw new Error(`Wallet with id ${walletId} not found`);
	}
	await wallet.increment('addresses', { by: 1 });
	return wallet;
}

async function updateAddy(data, where) {
	return models.Addy.update(data, { where });
}

async function setCurrAddy(newAddy, change, prevAddy) {
	const addy = await models.Addy.findOne({ where: { addy: newAddy } });
	if (!addy) {
		throw new Error(`Address ${newAddy} not found`);
	}
	addy.spent = false;
	addy.active = true;
	addy.balance = change;
	addy.prevAddy = prevAddy;
	return addy.save();
}

async function updateRequest(data, where) {
	return models.Req.update(data, { where });
}

async function getActiveAddys() {
	return models.Addy.findAll({ where: { active: true } });
}

async function saveTransaction(trans) {
	return models.Tran.create(trans);
}

module.exports = {
	saveRequest,
	getCurrAddy,
	getRequestBatch,
	saveAddy,
	incrementWalletAddyCount,
	updateAddy,
	setCurrAddy,
	updateRequest,
	getActiveAddys,
	saveTransaction
};