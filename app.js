const express = require('express');
const app = express();

app.get('/', function(req, res){res.send('Hello World!');});

app.post('/', function(req, res){
	console.log("post request received!");
	res.send("This is a post endpoint!");
});

app.listen(process.env.PORT, () => console.log('EKOINX BTC SERVER RUNNING. LISTENING ON PORT: ' + process.env.PORT));

