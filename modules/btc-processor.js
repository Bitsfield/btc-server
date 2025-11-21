const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

const private_wif = "BwkjHbUKpn7NWdrXbYodLouj8h5Tjp6Q9s1BCTLdVMhPR5VBMzpB";
const token = "0e7f39dde5b7442985566fa85f9ebb1c";
const xpub = "";
const base_url = "https://api.blockcypher.com/v1/bcy/test";

const mnemonic = "walk patrol inch critic chat air dizzy toddler group taste receive simple";

const network = bitcoin.networks.bcy.test;


//xpub661MyMwAqRbcGNm5iLCFkVkeQ78c9swT5HTwqyKbL2QzwGGQkoGz3agBkYJbNQDftr5njSoskUqXePirMSGUuUTihTfHnhYc6tGoMKmBBT1
//xpub661MyMwAqRbcGMYi5xpZMzDfFTcDBxPnGQEwb1pc96PaQFmQxBZtYAoa1sghBfR2tb5SKd9W5Ub4eG6eosf49nH57xJBiMqfZg87LkRXksv

//bcy address wif: BwkjHbUKpn7NWdrXbYodLouj8h5Tjp6Q9s1BCTLdVMhPR5VBMzpB
//btc testnet3 wif: cS63ZzChtb3WKXgXW8pF53FgvJ2UQH5C3oqpxoJKJqTkpTTFBYpz

//amount value should be in satoshis.
//to_address should be receiving public address

function satoshiToBTC(value)
{
	return value * 0.00000001;
}

async function broadcast_tx(tx) {
    console.log("tx in hex = ", tx.toHex());
    var push_url = base_url + "/txs/push?token=" + token;
    try {
        const response = await axios.post(push_url, { tx: tx.toHex() });
        console.log('Broadcast results:', response.data);
        console.log("Transaction send with hash:", tx.getId());
        return response.data;
    } catch (err) {
        console.error('Request failed:', err);
        throw err;
    }
}

function getSourceAddy()
{
	var keyPair = bitcoin.ECPair.fromWIF(private_wif, network);
	var source_address = keyPair.getAddress()
	//var source_address = "C5bPWnR9KQJ4JnvUk3uxgEfkUALisjz394";
	return source_address;
}

function getChangeAddy()
{

}

async function getUnspent(address) {
    var url = base_url + "/addrs/" + address + "?unspentOnly=true&token=" + token;
    try {
        const response = await axios.get(url);
        const json = response.data;
        if (typeof json !== 'undefined' && typeof json["txrefs"] !== 'undefined') {
            console.log("JSON unspent", json["txrefs"][0]);
            console.log("Found an unspent transaction output with ", satoshiToBTC(json["txrefs"][0].value), " BTC.");
            return json["txrefs"][0];
        }
        return null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getBalance(address) {
    var url = base_url + "/addrs/" + address + "/balance?token=" + token;
    try {
        const response = await axios.get(url);
        const json = response.data;
        if (typeof json !== 'undefined') {
            console.log("Final balance for address " + address + " = ", json.final_balance);
            return json.final_balance;
        }
        return 0;
    } catch (err) {
        console.error(err);
        return 0;
    }
}

async function getPricePerByte(priority) {
    //{"fastestFee":220,"halfHourFee":210,"hourFee":120}
    var def_ppb = 50;
    var url = "https://bitcoinfees.earn.com/api/v1/fees/recommended";
    try {
        const response = await axios.get(url);
        const res = response.data;
        if (typeof res !== 'undefined' && res != null) {
            var low = res.hourFee;
            var mid = res.halfHourFee;
            var high = res.fastestFee;
            return mid;
        }
        return def_ppb;
    } catch (err) {
        console.log('Could not retrieve recommended price per tx byte. Will use set default instead.');
        return def_ppb;
    }
}

function getNoOfBytes(ins, outs)
{
	var bytes = (ins*180) + (outs*34) + 10 + ins;
	return bytes;
}

async function getTxFee(ins, outs, priority) {
    var price_per_byte = await getPricePerByte(priority);
    var bytes = getNoOfBytes(ins, outs);
    return price_per_byte * bytes;
}

async function proccess(amount, address) {
    var source_address = getSourceAddy();
    var tx_fee = await getTxFee(amount);
    var balance = await getBalance(source_address);
    var unspent = await getUnspent(source_address);

    if (balance >= (amount + tx_fee)) {
        console.log("Unspent value (BTC) = ", satoshiToBTC(balance));
        console.log("Tx fee (BTC) = ", satoshiToBTC(tx_fee));
        console.log("Withdraw amount (BTC) = ", satoshiToBTC(amount));
        console.log("TransactionBuilder input tx_hash = ", unspent.tx_hash);
        console.log("TransactionBuilder input tx_output_n = ", unspent.tx_output_n);

        var txb = new bitcoin.TransactionBuilder(network);

        txb.addInput(unspent.tx_hash, unspent.tx_output_n);
        txb.addOutput(dest_address, withdraw_amount);

        txb.sign(0, keyPair);
        var tx = txb.build();

        console.log("tx = ", tx);

        await broadcast_tx(tx);
    } else {
        console.log("Insufficient balance to complete transaction.");
    }
}

function newWallet()
{
	var bip39 = require('bip39');
	var crypto = require('crypto');
	var randomBytes = crypto.randomBytes(16);

	var mnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'));
	console.log("Mnemonic: " + mnemonic);
	var seed = bip39.mnemonicToSeed(mnemonic);

    var hd = new bitcoin.HDNode.fromSeedBuffer(seed, network)
    var string = hd.neutered().toBase58()

    console.log(string);
}

module.exports = {

	newAddress: function()
	{
		return "new address";
	},

	
}