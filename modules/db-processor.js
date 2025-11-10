const mysql = require('mysql2/promise');
var db = require('../configs/database.js').mysql;

const pool = mysql.createPool({
  host: db.host,
  database: db.dbase,
  user: db.user,
  password: db.pass
});
const pending_status = "PENDING";

module.exports = {
	
        fetch: async function(limit) {
                let connection;
                try {
                        connection = await pool.getConnection();
                        log('Database connected successfully...', 'info');
                        var sql = "SELECT * FROM `"+db.table+"` WHERE status = '"+pending_status+"' ORDER BY req_datetime asc LIMIT "+limit;            
                        log(sql, 'info');
                        const [rows] = await connection.query(sql);
                        return rows;
                } catch (err) {
                        log(err, 'info');
                        throw err;
                } finally {
                        if (connection) connection.release();
                }
        },

        getCurrentAddy: async function() {
                let connection;
                try {
                        connection = await pool.getConnection();
                        console.log('Database connected successfully...');
                        var sql = "SELECT * FROM `"+db.tbls.out_addys_tbl+"` WHERE spent = 0 ";                                                         
                        log(sql, 'info');
                        const [rows] = await connection.query(sql);
                        return rows;
                } catch (err) {
                        log(err, 'info');
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