
const db = require('./database.js');
const btc = require('./btc-utils.js');

function dome(callback)
{
	let newAddy = btc.generateRootAddress();
	let index = 0;
	let path = "m/0'/0/"+index;
	addy = {
		walletId 	: 	1,
		addy 		: 	newAddy,
		path 		: 	path,
		hardened 	: 	false,
		spent 		: 	false,
		active 		: 	true,
		balance 	: 	0,
		prevAddy 	: 	null,
		indx 		: 	index
	};
	db.saveAddy(addy, callback);
}

function dispatch(callback)
{
	console.log('Dispatcher has been dispatched!!!!!');
	getPendingTransactions( function(results)
	{
		// console.log(results);
		console.log("Retrieved pending transactions...");
		if(typeof results != 'undefined' && results.length > 0)
		{
			getCurrentAddress( function(currAddy, err)
			{
				console.log("Retrieved current address" + currAddy);
				console.error(err);

				let totalAmount = getTotalRetrievedTransAmount(results);
				console.log("Retrieved total transaction amount " + totalAmount);
				if(currAddy.balance > totalAmount)
				{
					console.log("About to process transaction...");
					processTransaction(currAddy, results, totalAmount);
					callback();
				}
				else
				{
					//perform some voodoo here to
					//build transaction up till available balance;
					//remember miners fee o!
					callback(err)
				}
			} );
		}
		else
		{
			console.log("No pending transactions to process. -_- ");
			callback("no pending transactions!!!!!!!!!!!");
		}
	} );
}

function processTransaction (currAddy, results, totalAmount)
{
	let newAddy = btc.generateNewAddress(currAddy);
	console.log("Generated new address: " + newAddy);
	saveNewAddy(newAddy, currAddy, function(addy)
	{
		console.log("Saved new address to database....");
		let len = results.length + 1;
		console.log("Transactions output lenght = " + len);

		btc.getTxFee(1, len, 'low', function(transFee)
		{
			console.log("Calculated transaction fee..: " + transFee);
			let change = currAddy.balance - totalAmount - transFee;
			console.log("Calculated change amount...: " + change);
			btc.processTransaction(newAddy, currAddy, results, totalAmount, change, function()
			{
				console.log("Finished processing bitcoin transaction...");
				//do something when transaction is processed

				db.updateAddy({balance: 0, active: false, spent: true, nextAddy: newAddy}, {id: currAddy.id});
				db.setCurrAddy(newAddy, change, currAddy.addy);

				for (var i = results.length - 1; i >= 0; i--)
				{
					db.updateTrans({status: 'PUSHED'}, {id: results[i].id});
				}
			});
		});
	});
}

function getPendingTransactions(callback)
{
	db.getTransBatch(callback);
}

function getCurrentAddress(callback)
{
	db.getCurrAddy(callback);
}

function getTotalRetrievedTransAmount(results)
{
	console.log("Original transactions: " + results);
	let val = 0;
	for(let i = 0, len = results.length; i < len; i++)
	{
		val += results[i].value;
	}
	return val;
}

function saveNewAddy(newAddy, oldAddy, callback)
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

module.exports = {dispatch: dispatch, dome: dome};