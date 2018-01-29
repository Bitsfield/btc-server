const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const request = require('request');

const network = bitcoin.networks.bcy.test;

const mnemonic = "walk patrol inch critic chat air dizzy toddler group taste receive simple";
const token = "0e7f39dde5b7442985566fa85f9ebb1c";
const base_url = "https://api.blockcypher.com/v1/bcy/test";


processTransaction(newAddy, oldAddy, results, totalAmount, change, callback)
{
	getUnspent(oldAddy.addy, function(unspent)
	{
		try
		{
			let tx = buildTransaction(results, newAddy, change, unspent);
			broadcastTx(tx, callback);
		}
		catch(err)
		{
			console.log("Farts! Something just happen right now...! ", err);
		}
	});
}

function buildTransaction(outs, changeAddy, changeAmnt, unspent)
{
	try
	{
		let seed = bip39.mnemonicToSeed(mnemonic);
		let hd = new bitcoin.HDNode.fromSeedBuffer(seed, network);
		let txb = new bitcoin.TransactionBuilder(network);

		txb.addInput(unspent.tx_hash, unspent.tx_output_n);

		if(typeof hd != 'undefined' &typeof outs != 'undefined' && outs.constructor === Array)
		{
			for(let i = 0, let len = outs.length; i < len; i++)
			{
				txb.addOutput(out[i].addy, out[i].value);
			}

			txb.addOutput(changeAddy, changeAmnt);

			txb.sign(hd.keypair);

			let tx = txb.build();
			console.log("built transaction object: " + tx);

			return tx;
		}
	}
	catch(err)
	{
		return throw;
	}
}

function broadcast_tx(tx, callback)
{
	console.log("tx in hex = ", tx.toHex());
	var push_url = base_url+"/txs/push?token="+token;
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
			callback();
		}
	});
}

function getUnspent(address, callback)
{
	var url = base_url+"/addrs/"+saddress+"?unspentOnly=true&token="+token;
	request(url, function (error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			var json = JSON.parse(body);
			if(typeof json != 'undefined' && typeof json["txrefs"] != 'undefined')
			{
				console.log("JSON unspent", json["txrefs"][0]);
				console.log("Found an unspent transaction output with ", satoshiToBTC(json["txrefs"][0].value), " BTC.");
				callback(json["txrefs"][0]);
			}
		}
	});
	return null;
}

function getTxFee(ins, outs, priority)
{
	var price_per_byte = getPricePerByte(priority);
	var bytes = getNoOfBytes(ins, outs);
	return price_per_byte * bytes;
}

function getNoOfBytes(ins, outs)
{
	//(in)(4e4 + 2e4) - (out)(1e4 + 3e4) = (fee)2e4
	var bytes = (ins*180) + (outs*34) + 10 + ins;
	return bytes;
}

function getPricePerByte(priority)
{
	//{"fastestFee":220,"halfHourFee":210,"hourFee":120}
	var def_ppb = 50;
	var url = "https://bitcoinfees.earn.com/api/v1/fees/recommended";
	try
	{
		request(url, function (error, response, body)
		{
			if (!error && response.statusCode == 200)
			{
				var res = JSON.parse(body);
				if(typeof res != 'undefined' && res != null)
				{
					var low = res.hourFee;
					var mid = res.halfHourFee;
					var high = res.fastestFee

					return mid;
				}
			}
			else throw(error);
		});
	}
	catch(err)
	{
		consol.log('Could not retrieve recommended price per tx byte. Will use set default instead.');
		return def_ppb;
	}
}

function satoshiToBTC(value)
{
	return value * 0.00000001;
}

function getBalance(address)
{
	var url = base_url+"/addrs/"+address+"/balance?token="+token;
	request(url, function (error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			var json = JSON.parse(body);
			if(typeof json != 'undefined')
			{
				console.log("Final balance for address " + address + " = ", json.final_balance);
				return json.final_balance;
			}
		}
	});
	return 0;
}

function generateNewAddress(oldAddy)
{
	if(typeof oldAddy != 'undefined')
	{
		try
		{
			let seed = bip39.mnemonicToSeed(mnemonic);
		    let hd = new bitcoin.HDNode.fromSeedBuffer(seed, network);
		    let newAddy = hd.deriveHardened(0).derive(0).derive(oldAddy.index + 1);
		    return newAddy;
		}
		catch(err)
		{
			console.log("Farts! Something just happen right now!", err);
		}
	}
	return null;
}

module.exports = {
	processTransaction : processTransaction,
	generateNewAddress : generateNewAddress,
}