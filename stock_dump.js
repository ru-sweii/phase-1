var fs = require('fs');
var mysql = require('mysql');
var stockdata = require('./yahoo/stockdata');

var SQL_CONNECTION_CONFIG = 'configuration.json';

if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

if(!fs.existsSync(SQL_CONNECTION_CONFIG)) {
	console.log('fatal error: no configuration');
	return;
}
var configuration = JSON.parse(fs.readFileSync(SQL_CONNECTION_CONFIG));
pool = mysql.createPool(configuration.pool)

function query_to_json(query_string, filename) {
	pool.query(query_string, function(err, result){
		if(err) throw err;
		fs.writeFile(filename, JSON.stringify(result, null, 4), function(err){
			if(err) throw err;
			console.log('[DONE] saved to {0}'.format(filename));
		});
	});
}

function fetch_data(workFolder){
	var sql_prototype = 'select s_timestamp as time, high, low, open, close, volume from stocks where symbol = "{0}" and type = {1} order by time desc';
	for (var i = 0; i < configuration.request_symbols.length; i++) {
		symbol = configuration.request_symbols[i];
		query_to_json(sql_prototype.format(symbol, 0), workFolder + "H-{0}.json".format(symbol));
		query_to_json(sql_prototype.format(symbol, 1), workFolder + "R-{0}.json".format(symbol));
	}
}

console.log('retrieving data from database....');
fetch_data('captured_data/');
console.log('task deployed');