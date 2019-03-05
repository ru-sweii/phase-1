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

function insert_into_sql(timestamp, symbol, high, low, open, close, volume) {
	var sql = 'insert into stocks(s_timestamp, symbol, high, low, open, close, volume) values (from_unixtime({0}), "{1}", {2}, {3}, {4}, {5}, {6})';

	pool.query(sql.format(timestamp, symbol, high, low, open, close, volume), function(err, result){
		if (err) return;
		console.log('1 record updated');
	});
	
}

function stock_list() {
	pool.query('select * from stocks order by s_timestamp desc limit 100;', function(err, result){
		if(err) throw err;
		rows =  JSON.parse(JSON.stringify(result));
		for (var i = 0; i < rows.length; i++) {
			console.log(rows[i].s_timestamp, rows[i].symbol, rows[i].high, rows[i].low, rows[i].open , rows[i].close , rows[i].volume);
		}
	});
}

function update_stock() {

	console.log('Information update task pending...');
	request_symbols = ['GOOG', 'AABA', 'WFC', 'C', 'BAC', 
					   'GS', 'USB', 'JPM', 'PFE', 'INTC'];
	for (var i = 0; i < request_symbols.length; i++) {
		symbol = request_symbols[i];
		stockdata.stock_realtime_data(symbol, insert_into_sql);
		stockdata.stock_historical_data(symbol, insert_into_sql);
	}
	
	console.log('Task assigned');
}

console.log('Backend stock data sync service');
console.log('Update interval: {0} second(s)'.format(configuration.updateInterval));

update_stock();
setInterval(update_stock, configuration.updateInterval * 1000);