var mysql = require('mysql')
var db = require('../cfg/db.js')

var pool = mysql.createPool(db.mysql);

module.exports = {
	
	fetch: function()
	{
		try
		{
			pool.getConnection(function(err, connection)
			{
				if(err) throw err;

				console.log('Database connected successfully...');

				var sql = "";

				connection.query(sql, function (err, results)
				{
					if(err) throw err
					console.log('Data retrieved : ', results);

					//do something with results

					connection.release();
				});
			});
		}
		catch(err)
		{
			console.log(err);
		}
	},

	update: function(data)
	{
		try
		{
			pool.getConnection(function(err, connection)
			{
				if(err) throw err;

				console.log('Database connected successfully...');

				var sql = "";

				connection.query(sql, function (err, results)
				{
					if(err) throw err
					console.log('Data updated! Response: ', result);
					connection.release();
				});
			});
		}
		catch(err)
		{
			console.log(err);
		}
	}
	
}