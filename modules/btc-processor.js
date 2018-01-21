const bitcoin = require('bitcoinjs-lib');
var request = require('request');

var tx_fee = 10000;
var private_wif = "";

//amount value should be in satoshis.
//to_address should be receiving public address
module.exports = function(to_address, amount) 
{
	var satoshiToBTC = function(value)
	{
		return value * 0.00000001;
	};

	var broadcast_tx = function(tx) {

		console.log("tx in hex = ", tx.toHex());

		var push_url = "https://api.blockcypher.com/v1/bcy/test/txs/push";

		var options = {
			uri: push_url,
			method: 'POST',
			json: {
				"tx": tx.toHex()
			}
		};

		request(options, function(err, httpResponse, body)
		{
			if(err)
			{
				console.error('Request failed:', err);
			}
			else
			{
				console.log('Broadcast results:', body);
				console.log("Transaction send with hash:", tx.getId());
			}
		});
	};

	return function(req, res, next)
	{
		//bcy address wif: BwkjHbUKpn7NWdrXbYodLouj8h5Tjp6Q9s1BCTLdVMhPR5VBMzpB
		//btc testnet3 wif: cS63ZzChtb3WKXgXW8pF53FgvJ2UQH5C3oqpxoJKJqTkpTTFBYpz
		
		// Get the source Testnet3 Bitcoin address from the private key
		var network = bitcoin.networks.bcy.test;
		var keyPair = bitcoin.ECPair.fromWIF(private_wif, network);
		var source_address = keyPair.getAddress()
		//var source_address = "C5bPWnR9KQJ4JnvUk3uxgEfkUALisjz394";

		// Query blockcypher.com for the unspent outputs from the source address
		var url = "https://api.blockcypher.com/v1/bcy/test/addrs/"+source_address+"?unspentOnly=true";

		request(url, function (error, response, body)
		{
			if (!error && response.statusCode == 200)
			{
				// Parse the response and get the first unspent output
				var json = JSON.parse(body);
				if(typeof json != 'undefined' && typeof json["txrefs"] != 'undefined')
				{
					var unspent = json["txrefs"][0];

					console.log("JSON unspent", unspent);

					// Prompt for the destination address
					console.log("Found an unspent transaction output with ", satoshiToBTC(unspent.value), " BTC.");

					// Calculate the withdraw amount minus the tx fee
					var withdraw_amount = amount + tx_fee;

					if(unspent.value >= withdraw_amount)
					{

						console.log("Unspent value (BTC)= ", satoshiToBTC(unspent.value));
						console.log("Tx fee (BTC)= ", satoshiToBTC(tx_fee));
						console.log("Withdraw amount (BTC)= ", satoshiToBTC(withdraw_amount));

						// Build a transaction
						console.log("TransactionBuilder input tx_hash = ", unspent.tx_hash);
						console.log("TransactionBuilder input tx_output_n = ", unspent.tx_output_n);

						var txb = new bitcoin.TransactionBuilder(network);
						txb.addInput(unspent.tx_hash, unspent.tx_output_n);
						txb.addOutput(dest_address, withdraw_amount);

						txb.sign(0, keyPair);
						var tx = txb.build();

						console.log("tx = ", tx);

						// Prompt to confirm sending the transaction
						var confirm = "Send " + satoshiToBTC(withdraw_amount) + " plus miner fee? (y/N):";
						
						prompt(confirm, function(result)
						{
							if (result.toUpperCase() == "Y")
							{
								broadcast_tx(tx);
							};
						});
					}
					else
					{
						console.log("Insufficient balance to complete transaction.");
					}
				}
				else
				{
					console.log("No unspent transaction found for address.");
				}
			}
			else
			{
				console.log("Unable to find any unspent transaction outputs.");
				if (error) console.log("ERROR:", error);
			}
		});

	}
}