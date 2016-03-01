var mysql = require('mysql');
var db = mysql.createPool({
    host: process.env['DB_HOST'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE'],
    connectionLimit: 10
});

module.exports = {
    getPhoneInfo: function(mac_address, callback) {
            var sql = 'SELECT * FROM phones WHERE mac_address = ?';
            getFirstRow(sql, mac_address, callback);
    },
    getExtensionInfo: function(extension, callback) {
            var sql = 'SELECT * FROM phones WHERE extension = ?';
            getFirstRow(sql, extension, callback);
    },
    getDirectory: function(callback) {
        var sql = 'SELECT name, extension FROM phones';
        db.query(sql, function(err, rows) {
            var result = [];
            rows.forEach(function(row) {
                result.push({
                    first_name: row.name.split(' ')[0],
                    last_name: row.name.split(' ')[1],
                    extension: row.extension
                });
            });
            if (typeof(callback) === 'function') { callback(result); }
        });
    }
}

function getFirstRow(sql, arg, callback) {
    db.query(sql, arg, function(err, rows) {
	if (!err) { if (rows.length === 0) { err = 'No such phone'; } }
        if (typeof(callback) === 'function') { callback(err, rows[0]); }
    });
}
