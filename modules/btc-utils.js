const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const request = require('request');

const network = bitcoin.networks.bcy.test;

const mnemonic = "walk patrol inch critic chat air dizzy toddler group taste receive simple";
const token = "0e7f39dde5b7442985566fa85f9ebb1c";
const base_url = "https://api.blockcypher.com/v1/bcy/test";


function processTransaction(newAddy, oldAddy, results, totalAmount, change, callback)
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
			for(let i = 0, len = outs.length; i < len; i++)
			{
				txb.addOutput(outs[i].addy, outs[i].value);
			}

			console.log("Transaction builder", txb);
			console.log("Keypair", hd.keyPair);

			txb.addOutput(changeAddy, changeAmnt);

			txb.sign(0, hd.keyPair);

			let tx = txb.build();
			console.log("built transaction object: " + tx);

			return tx;
		}
	}
	catch(err)
	{
		console.error(err);
	}
}

function broadcastTx(tx, callback)
{
	console.log("tx in hex = ", tx.toHex());
	let push_url = base_url+"/txs/push?token="+token;
	let options = {
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
			throw err;
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
	let url = base_url+"/addrs/"+address+"?unspentOnly=true&token="+token;
	request(url, function (error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			let json = JSON.parse(body);
			if(typeof json != 'undefined' && typeof json["txrefs"] != 'undefined')
			{
				console.log("JSON unspent", json["txrefs"][0]);
				console.log("Found an unspent transaction output with ", satoshiToBTC(json["txrefs"][0].value), " BTC.");
				callback(json["txrefs"][0]);
			}
		}
		else throw error;
	});
}

function getTxFee(ins, outs, priority, callback)
{
	getPricePerByte(priority, function(pricePerByte)
	{
		let noOfBytes = getNoOfBytes(ins, outs);
		callback(pricePerByte * noOfBytes);
	});
}

function getNoOfBytes(ins, outs)
{
	//(in)(4e4 + 2e4) - (out)(1e4 + 3e4) = (fee)2e4
	let bytes = (ins*180) + (outs*34) + 10 + ins;
	return bytes;
}

function getPricePerByte(priority, callback)
{
	//{"fastestFee":220,"halfHourFee":210,"hourFee":120}
	let def_ppb = 50;
	let url = "https://bitcoinfees.earn.com/api/v1/fees/recommended";
	try
	{
		request(url, function (error, response, body)
		{
			if (!error && response.statusCode == 200)
			{
				let res = JSON.parse(body);
				if(typeof res != 'undefined' && res != null)
				{
					let low = res.hourFee;
					let mid = res.halfHourFee;
					let high = res.fastestFee

					callback(mid);
				}
			}
			else throw error;
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

function getBalance(address, callback)
{
	let url = base_url+"/addrs/"+address+"/balance?token="+token;
	request(url, function (error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			let json = JSON.parse(body);
			if(typeof json != 'undefined')
			{
				console.log("Final balance for address " + address + " = ", json.final_balance);
				callback(json.final_balance);
			}
		}
		else throw error;
	});
}

function generateNewAddress(oldAddy)
{
	console.log("About to generate new address...");
	console.log("Old address: " +oldAddy);
	let indx = oldAddy.indx;
	indx++;
	console.log("New Address index: " + indx);

	if(typeof oldAddy != 'undefined')
	{
		try
		{
			let seed = bip39.mnemonicToSeed(mnemonic);
			console.log("Seed generated: " + seed);
		    let hd = new bitcoin.HDNode.fromSeedBuffer(seed, network);
		    let newAddy = hd.deriveHardened(0).derive(0).derive(indx).getAddress();
		    return newAddy;
		}
		catch(err)
		{
			console.log("Farts! Something just happen right now!", err);
		}
	}
	return null;
}

function generateRootAddress()
{
	try
	{
		let seed = bip39.mnemonicToSeed(mnemonic);
	    let hd = new bitcoin.HDNode.fromSeedBuffer(seed, network);
	    let newAddy = hd.deriveHardened(0).derive(0).derive(0).getAddress();
	    return newAddy;
	}
	catch(err)
	{
		console.log("Farts! Something just happen right now!", err);
		return null;
	}
}

module.exports = {
	processTransaction : processTransaction,
	generateNewAddress : generateNewAddress,
	getTxFee : getTxFee,
	generateRootAddress: generateRootAddress
}