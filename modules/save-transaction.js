var mysql = require('mysql')
var db = require('../cfg/db.js')

var pool = mysql.createPool(db.mysql);

const table = "trans_requests";

module.exports = function (req, res)
{
	try
	{
		var data = req.body;

		pool.getConnection(function(err, connection)
		{
			if(err) throw err;

			console.log('Database connected successfully...');

			var reqTime = new Date().toMysqlFormat();
			var sql = "INSERT INTO `"+db.table+"`(`addy`, `value`, `user_id`, `email`, `req_datetime`, `status`, `src_ip`, `updated`, `remarks`)" 
				+"VALUES (?,?,?,?,'"+reqTime+"','PENDING',?,'"+reqTime+"','Received')";

			connection.query(sql, [data.addy, data.value, data.userId, data.email, req.ip], function (err, result)
			{
				if(err) throw err
				console.log('Data inserted successfully!: ', result);
				connection.release();
				res.json({"code":"0","status":"success","description":"transaction posted!","data":{}});
			});
		});
	}
	catch(err)
	{
		console.log(err);
		res.json({"code":"0","status":"success","description":"transaction posted!","data":{}});
	}
	
}