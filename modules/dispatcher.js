
const db = require('./database.js');
const btc = require('./btc-utils.js');
const dateFormat = require('dateformat');

async function test()
{
	return dispatch();
}

async function dispatch()
{
	console.log('Dispatcher has been dispatched!!!!!');
	const results = await getPendingTransactions();
	console.log("Retrieved pending transactions...");

	if(!Array.isArray(results) || results.length === 0)
	{
		console.log("No pending transactions to process. -_- ");
		return "no pending transactions!!!!!!!!!!!";
	}

	const currAddy = await getCurrentAddress();
	console.log("Retrieved current address", currAddy);

	if(!currAddy)
	{
		throw new Error("No active address available to process transactions.");
	}

	console.log("Available balance: " + currAddy.balance);

	const totalAmount = getTotalRetrievedTransAmount(results);
	console.log("Retrieved total transaction amount " + totalAmount);

	if(currAddy.balance <= totalAmount)
	{
		console.log("Transaction amount is more than the available wallet balance.");
		console.log("Transaction processing aborted!");
		return "sorry we don't have enough funds to handle this transaction! *sad face*";
	}

	console.log("About to process transaction...");
	return processTransaction(currAddy, results, totalAmount);
}

async function processTransaction (currAddy, results, totalAmount)
{
	const newAddy = btc.generateNewAddress(currAddy);

	if(!newAddy)
	{
		throw new Error('Unable to generate a new address');
	}

	console.log("Generated new address: " + newAddy);
	await saveNewAddy(newAddy, currAddy);
	console.log("Saved new address to database....");

	const len = results.length + 1;
	console.log("Transactions output lenght = " + len);

	const transFee = await btc.getTxFee(1, len, 'low');
	console.log("Calculated transaction fee..: " + transFee);

	let change = 0;
	if(currAddy.balance > (totalAmount + transFee))
	{
		change = currAddy.balance - totalAmount - transFee;
	}

	console.log("Calculated change amount...: " + change);

	const { tx, response } = await btc.processTransaction(newAddy, currAddy, results, totalAmount, change);
	console.log("Finished processing bitcoin transaction...");

	const addys = [...getAddys(results), newAddy].join(',');
	await saveNewTransaction(tx, response, addys, totalAmount);

	await db.updateAddy({
		balance: 0,
		active: false,
		spent: true,
		nextAddy: newAddy,
		spentOn: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
	}, {id: currAddy.id});

	await db.setCurrAddy(newAddy, change, currAddy.addy);

	await Promise.all(results.map(result => db.updateRequest({
		status: 'PUSHED',
		hash: response && response.tx ? response.tx.hash : null
	}, { id: result.id })));

	return response;
}

async function getPendingTransactions()
{
	return db.getRequestBatch();
}

async function getCurrentAddress()
{
	return db.getCurrAddy();
}

function getTotalRetrievedTransAmount(results)
{
	console.log("Original transactions: ", results);
	let val = 0;
	for(let i = 0, len = results.length; i < len; i++)
	{
		val += results[i].value;
	}
	return val;
}

async function saveNewAddy(newAddy, oldAddy)
{
	let index = oldAddy.indx + 1;
	let path = "m/0'/0/"+index;
	const addy = {
		walletId 	: 	oldAddy.walletId,
		addy 		: 	newAddy,
		path 		: 	path,
		hardened 	: 	false,
		spent 		: 	false,
		active 		: 	false,
		balance 	: 	0,
		prevAddy 	: 	oldAddy.addy,
		indx 		: 	index
	};
	// db.incrementWalletAddyCount(oldAddy.walletId);
	return db.saveAddy(addy);
}

function getAddys(result = [])
{
	return result.map(r => r.addy).filter(Boolean);
}

async function saveNewTransaction(tx, resp, addys, value)
{
	const trans = {
		addys : 	addys,
		value : 	value,
		hash  : 	typeof tx !== 'undefined' && tx !== null ? tx.getId() : null,
		hex	  : 	typeof tx !== 'undefined' && tx !== null ? tx.toHex() : null,
		status 	: 	'PUSHED'
	};

	try
	{
		await db.saveTransaction(trans);
		if(tx) {
			console.log("Transaction has been saved successfully. Transaction hash is: " + tx.getId());
		}
	}
	catch(error)
	{
	 	console.error("Error while saving transaction to database!", error);
	}

}


module.exports = {
	dispatch,
	test,
	getTotalRetrievedTransAmount,
	getAddys
};