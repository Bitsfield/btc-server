const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const axios = require('axios');

const network = bitcoin.networks.bcy.test;

const mnemonic = "walk patrol inch critic chat air dizzy toddler group taste receive simple";
const token = "0e7f39dde5b7442985566fa85f9ebb1c";
const base_url = "https://api.blockcypher.com/v1/bcy/test";


async function processTransaction(newAddy, oldAddy, results, totalAmount, change) {
    try {
        const unspent = await getUnspent(oldAddy.addy);
        let key = deriveNode(oldAddy.indx).keyPair;
        let tx = buildTransaction(results, newAddy, change, unspent, key);
        const broadcastResult = await broadcastTx(tx);
        return broadcastResult;
    } catch (err) {
        console.log("Farts! Something just happen right now...! ", err);
        throw err;
    }
}

function buildTransaction(outs, changeAddy, changeAmnt, unspent, key)
{
	try
	{
		let txb = new bitcoin.TransactionBuilder(network);

		for (var i = unspent.length - 1; i >= 0; i--)
		{
			txb.addInput(unspent[i].tx_hash, unspent[i].tx_output_n);
		}

		if(typeof outs != 'undefined' && outs.constructor === Array)
		{
			for(let i = 0, len = outs.length; i < len; i++)
			{
				txb.addOutput(outs[i].addy, outs[i].value);
			}

			console.log("Transaction builder", txb);
			console.log("Keypair", key);

			if(changeAmnt > 0)
			{
				txb.addOutput(changeAddy, changeAmnt);
			}

			txb.sign(0, key);

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

async function broadcastTx(tx) {
    console.log("tx in hex = ", tx.toHex());
    let push_url = base_url + "/txs/push?token=" + token;
    try {
        const response = await axios.post(push_url, { tx: tx.toHex() });
        console.log('Broadcast results:', response.data);
        console.log("Transaction sent with hash:", tx.getId());
        return { tx, body: response.data };
    } catch (err) {
        console.error('Request failed:', err);
        throw err;
    }
}

async function getUnspent(address) {
    let url = base_url + "/addrs/" + address + "?unspentOnly=true&token=" + token;
    console.log("About to query url " + url + " for unspent outputs of address " + address);
    try {
        const response = await axios.get(url);
        const json = response.data;
        if (typeof json !== 'undefined' && typeof json["txrefs"] !== 'undefined') {
            console.log("JSON unspent", json["txrefs"]);
            console.log("Found an unspent transaction output with ", satoshiToBTC(json["txrefs"][0].value), " BTC.");
            return json["txrefs"];
        } else {
            throw new Error("No unspent Transaction outputs Found!");
        }
    } catch (err) {
        console.error(err);
        throw new Error("Could not retrieve unspent outputs!");
    }
}

async function getTxFee(ins, outs, priority) {
    const pricePerByte = await getPricePerByte(priority);
    let noOfBytes = getNoOfBytes(ins, outs);
    return pricePerByte * noOfBytes;
}

function getNoOfBytes(ins, outs)
{
	//(in)(4e4 + 2e4) - (out)(1e4 + 3e4) = (fee)2e4
	let bytes = (ins*180) + (outs*34) + 10 + ins;
	console.log("Calculated message size: " + bytes + " bytes.")
	// 180 + 204 +10 + 1 = (361)
	return bytes;
}

async function getPricePerByte(priority) {
    //{"fastestFee":220,"halfHourFee":210,"hourFee":120}
    let def_ppb = 50;
    let url = "https://bitcoinfees.earn.com/api/v1/fees/recommended";
    try {
        const response = await axios.get(url);
        const res = response.data;
        if (typeof res !== 'undefined' && res != null) {
            let low = res.hourFee;
            let mid = res.halfHourFee;
            let high = res.fastestFee;
            return low;
        } else {
            return def_ppb;
        }
    } catch (err) {
        console.log('Could not retrieve recommended price per tx byte. Will use set default instead.');
        return def_ppb;
    }
}

function satoshiToBTC(value)
{
	return value * 0.00000001;
}

async function getBalance(address) {
    let url = base_url + "/addrs/" + address + "/balance?token=" + token;
    try {
        const response = await axios.get(url);
        const json = response.data;
        if (typeof json !== 'undefined') {
            console.log("Final balance for address " + address + " = ", json.final_balance);
            return json.final_balance;
        } else {
            throw new Error('No balance found for address');
        }
    } catch (err) {
        throw err;
    }
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
		    let newAddy = deriveNode(indx).getAddress();
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
	    let newAddy = deriveNode(0).getAddress();
	    return newAddy;
	}
	catch(err)
	{
		console.log("Farts! Something just happen right now!", err);
		return null;
	}
}

function deriveNode(index)
{
	console.log("About to derive new node at index: " + index );
	let seed = bip39.mnemonicToSeed(mnemonic);
	console.log("Created seed: ", seed);
	let hd = new bitcoin.HDNode.fromSeedBuffer(seed, network);
	let node = hd.deriveHardened(0).derive(0).derive(index);
	console.log("Created node. ", node);
	return node;
}

module.exports = {
	processTransaction : processTransaction,
	generateNewAddress : generateNewAddress,
	getTxFee : getTxFee,
	generateRootAddress: generateRootAddress
}