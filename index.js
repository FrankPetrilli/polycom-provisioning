/* Requires */
var express = require('express');
var bodyParser = require('body-parser');

/* Grab dependencies */
var common = require('./app/common.js');
var router = require('./app/router.js');

/* Initialization */
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* Statics */
app.set('port', process.env.PORT || 1234);

/* Global Vars */

/* Begin application definition */

app.use('/', router);

// Begin our application once our dependencies are up.
function init(callback) {
	app.listen(app.get('port'), function() {
		console.log('[server] Listening on ' + app.get('port'));
		if (typeof callback === 'function') {
			callback(app);
		}
	});
}
module.exports.init = init;
