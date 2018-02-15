
const db = require('./database.js');
const btc = require('./btc-utils.js');
const dateFormat = require('dateformat');

function test(callback)
{
	dispatch(callback);
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

function dispatch(callback)
{
	console.log('Dispatcher has been dispatched!!!!!');
	getPendingTransactions( function(results)
	{
		// console.log(results);
		console.log("Retrieved pending transactions...");
		if(typeof results != 'undefined' && results.length > 0)
		{
			getCurrentAddress( function(currAddy)
			{
				console.log("Retrieved current address", currAddy);
				console.log("Available balance: " + currAddy.balance);

				let totalAmount = getTotalRetrievedTransAmount(results);
				console.log("Retrieved total transaction amount " + totalAmount);
				if(currAddy.balance > totalAmount)
				{
					console.log("About to process transaction...");
					processTransaction(currAddy, results, totalAmount, callback);
				}
				else
				{
					//perform some voodoo here to
					//build transaction up till available balance;
					//remember miners fee o!
					console.log("Transaction amount is more than the available wallet balance.");
					console.log("Transaction processing aborted!");
					callback("sorry we don't have enough funds to handle this transaction! *sad face*")
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

function processTransaction (currAddy, results, totalAmount, callback)
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

			let change = 0;
			if(currAddy.balance > (totalAmount + transFee))
			{
				change = currAddy.balance - totalAmount - transFee;
			}
			
			console.log("Calculated change amount...: " + change);

			btc.processTransaction(newAddy, currAddy, results, totalAmount, change, function(tx, response)
			{
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

				callback(response);
			});
		});
	});
}

function getPendingTransactions(callback)
{
	db.getRequestBatch(callback);
}

function getCurrentAddress(callback)
{
	db.getCurrAddy(callback);
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
	// callback();
	// db.incrementWalletAddyCount(oldAddy.walletId);
	db.saveAddy(addy, callback);
}

function getAddys(result)
{
	let addy = [];
	for (var i = result.length - 1; i >= 0; i--) {
		addy[i] += result[i].addy;
	}
	return addy.toString();
}

function saveNewTransaction(tx, resp, addys, value)
{
	let trans = {
		addys : 	addys,
		value : 	value,
		hash  : 	tx.getId(),
		hex	  : 	tx.toHex(),
		status 	: 	'PUSHED'
	};

	db.saveTransaction(trans, function()
	{
		console.log("Transaction has been saved successfully. Transaction hash is: " + tx.getId());
	},
	function(error)
	{
	 console.error("Error while saving transaction to database!", error);
	});

}


module.exports = {
	dispatch: dispatch, 
	test: test
};