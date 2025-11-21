
const db = require('./database.js');
const btc = require('./btc-utils.js');
const dateFormat = require('dateformat');

async function test()
{
	await dispatch();
	// let newAddy = btc.generateRootAddress();
	// let index = 0;
	// let path = "m/0'/0/"+index;
	// addy = {
	// 	walletId 	: 	1,
	// 	addy 		: 	newAddy,
	// 	path 		: 	path,
	// 	hardened 	: 	false,
	// 	spent 		: 	false,
	// 	active 		: 	true,
	// 	balance 	: 	0,
	// 	prevAddy 	: 	null,
	// 	indx 		: 	index
	// };
	// db.saveAddy(addy, callback);
}

async function dispatch()
{
	console.log('Dispatcher has been dispatched!!!!!');
	const results = await getPendingTransactions();
	// console.log(results);
	console.log("Retrieved pending transactions...");
	if(typeof results != 'undefined' && results.length > 0)
	{
		const currAddy = await getCurrentAddress();
		console.log("Retrieved current address", currAddy);
		console.log("Available balance: " + currAddy.balance);

		let totalAmount = getTotalRetrievedTransAmount(results);
		console.log("Retrieved total transaction amount " + totalAmount);
		if(currAddy.balance > totalAmount)
		{
			console.log("About to process transaction...");
			return await processTransaction(currAddy, results, totalAmount);
		}
		else
		{
			//perform some voodoo here to
			//build transaction up till available balance;
			//remember miners fee o!
			console.log("Transaction amount is more than the available wallet balance.");
			console.log("Transaction processing aborted!");
			return "sorry we don't have enough funds to handle this transaction! *sad face*";
		}
	}
	else
	{
		console.log("No pending transactions to process. -_- ");
		return "no pending transactions!!!!!!!!!!!";
	}
}

async function processTransaction (currAddy, results, totalAmount)
{
	let newAddy = btc.generateNewAddress(currAddy);
	console.log("Generated new address: " + newAddy);
	const addy = await saveNewAddy(newAddy, currAddy);
	console.log("Saved new address to database....");
	let len = results.length + 1;
	console.log("Transactions output lenght = " + len);

	const transFee = await btc.getTxFee(1, len, 'low');
	console.log("Calculated transaction fee..: " + transFee);

	let change = 0;
	if(currAddy.balance > (totalAmount + transFee))
	{
		change = currAddy.balance - totalAmount - transFee;
	}
	
	console.log("Calculated change amount...: " + change);

	const {tx, response} = await btc.processTransaction(newAddy, currAddy, results, totalAmount, change);
	
	console.log("Finished processing bitcoin transaction...");
	//do something when transaction is processed

	//saveTransactionObject in db;
	let addys = getAddys(results) + "," + newAddy;
	saveNewTransaction(tx, response, addys, totalAmount);

	db.updateAddy({
		balance: 0, 
		active: false, 
		spent: true, 
		nextAddy: newAddy, 
		spentOn: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
	}, {id: currAddy.id});

	db.setCurrAddy(newAddy, change, currAddy.addy);

	for (var i = results.length - 1; i >= 0; i--)
	{
		db.updateRequest({
			status: 'PUSHED', 
			hash: response.tx.hash
		}, { id: results[i].id });
	}

	return response;
}

async function getPendingTransactions()
{
	await db.getRequestBatch();
}

async function getCurrentAddress()
{
	await db.getCurrAddy();
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
	addy = {
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
	// callback();
	// db.incrementWalletAddyCount(oldAddy.walletId);
	await db.saveAddy(addy);
}

function getAddys(result)
{
	let addy = [];
	for (var i = result.length - 1; i >= 0; i--) {
		addy[i] += result[i].addy;
	}
	return addy.toString();
}

async function saveNewTransaction(tx, resp, addys, value) {
    let trans = {
        addys: addys,
        value: value,
        hash: tx.getId(),
        hex: tx.toHex(),
        status: 'PUSHED'
    };
    try {
        const savedTx = await db.saveTransaction(trans);
        console.log("Transaction has been saved successfully. Transaction hash is: " + savedTx.getId());
    } catch (error) {
        console.error("Error while saving transaction to database!", error);
    }
}


module.exports = {
	dispatch: dispatch, 
	test: test
};