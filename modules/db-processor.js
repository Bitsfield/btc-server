var mysql = require('mysql');
var db = require('../configs/database.js').mysql;

var pool = mysql.createPool(db.conn);
const pending_status = "PENDING";

module.exports = {
	
	fetch: function(limit, callback)
	{
		try
		{
			return pool.getConnection(function(err, connection)
			{
				if(err) handleConnErr(err);
				log('Database connected successfully...', 'info');
				var sql = "SELECT * FROM `"+db.table+"` WHERE status = '"+pending_status+"' ORDER BY req_datetime asc LIMIT "+limit;
				log(sql, 'info');
				connection.query(sql, callback);
				connection.release();
			});
		}
		catch(err)
		{
			log(err, 'info');
		}
	},

	getCurrentAddy: function(callback)
	{
		try
		{
			return pool.getConnection(function(err, connection)
			{
				if(err) handleConnErr(err);
				console.log('Database connected successfully...');
				var sql = "SELECT * FROM `"+db.tbls.out_addys_tbl+"` WHERE spent = 0 ";
				log(sql, 'info');
				connection.query(sql, callback);
				connection.release();
			});
		}
		catch(err)
		{
			log(err, 'info');
		}
	},
}

function log(msg, level)
{
	console.log(msg);
}

function handleConnErr(err)
{
	log(err, 'error');
	throw err;
}