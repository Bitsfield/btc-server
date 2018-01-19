const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/', function(req, res){
	console.log("post request received!");
	res.send("This is a post endpoint!");
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))