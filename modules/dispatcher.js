
const db = require('./database.js');
const btc = require('./btc-utils.js');

function dispatch()
{
	console.log('Dispatcher has been dispatched!!!!!');
	getPendingTransactions( function(results)
	{
		console.log(results);
		if(typeof results != 'undefined' && results.length > 0)
		{
			getCurrentAddress( function(currAddy)
			{
				let totalAmount = getTotalRetrievedTransAmount(results);
				if(currAddy.balance > totalAmount)
				{
					processTransaction(currAddy, results, totalAmount);
				}
				else
				{
					//perform some voodoo here to
					//build transaction up till available balance;
					//remember miners fee o!
				}
			} );
		}
		else
		{
			console.log("No pending transactions to process. -_- ");
		}
	} );
}

function processTransaction (currAddy, results, totalAmount)
{
	let newAddy = btc.generateNewAddress(currAddy);
	saveNewAddy(newAddy, currAddy, function(addy)
	{
		let transFee = btc.getTxFee(1, results.length + 1, 'low');
		let change = currAddy.balance - totalAmount - transFee;
		btc.processTransaction(newAddy, currAddy, results, totalAmount, change, function()
		{
			//do something when transaction is processed

			db.updateAddy({balance: 0, active: false, spent: true, nextAddy: newAddy}, {id: currAddy.id});
			db.setCurrAddy(newAddy, change, currAddy.addy);

			for (var i = results.length - 1; i >= 0; i--)
			{
				db.updateTrans({status: 'PUSHED'}, {id: results[i].id});
			}
		});
	});
}

function getPendingTransactions(callback)
{
	db.getTransBatch(callback, (err) => { console.log("Farts! Something went wrong. We are not able to retrieve pending transactions!", err)});
}

function getCurrentAddress(callback)
{
	db.getCurrAddy(callback, (err) => { console.log("Farts! Something went wrong. We are not able to retrieve current addy!", err)});
}

function getTotalRetrievedTransAmount(results)
{
	let val = 0;
	for(let i = 0, let len = results.length; i < len; i++)
	{
		val += results[i].value;
	}
	return val;
}

function saveNewAddress(newAddy, oldAddy, callback)
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
	db.incrementWalletAddyCount(oldAddy.walletId);
	db.saveAddy(addy, callback);
}

module.exports = {dispatch: dispatch};