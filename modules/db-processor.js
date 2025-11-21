var mysql = require('mysql');
var db = require('../configs/database.js').mysql;

var pool = mysql.createPool(db.conn);
const pending_status = "PENDING";

module.exports = {
	fetch: async function(limit) {
		let connection;
		try {
			connection = await new Promise((resolve, reject) => {
				pool.getConnection((err, conn) => {
					if (err) reject(err);
					else resolve(conn);
				});
			});
			log('Database connected successfully...', 'info');
			var sql = "SELECT * FROM `" + db.table + "` WHERE status = '" + pending_status + "' ORDER BY req_datetime asc LIMIT " + limit;
			log(sql, 'info');
			const results = await new Promise((resolve, reject) => {
				connection.query(sql, (err, res) => {
					if (err) reject(err);
					else resolve(res);
				});
			});
			return results;
		} catch (err) {
			log(err, 'error');
			throw err;
		} finally {
			if (connection) connection.release();
		}
	},

	getCurrentAddy: async function() {
		let connection;
		try {
			connection = await new Promise((resolve, reject) => {
				pool.getConnection((err, conn) => {
					if (err) reject(err);
					else resolve(conn);
				});
			});
			console.log('Database connected successfully...');
			var sql = "SELECT * FROM `" + db.tbls.out_addys_tbl + "` WHERE spent = 0 ";
			log(sql, 'info');
			const results = await new Promise((resolve, reject) => {
				connection.query(sql, (err, res) => {
					if (err) reject(err);
					else resolve(res);
				});
			});
			return results;
		} catch (err) {
			log(err, 'error');
			throw err;
		} finally {
			if (connection) connection.release();
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