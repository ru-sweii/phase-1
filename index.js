var fs = require('fs');
var mongoclient = require('mongodb').MongoClient;
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

function insert_into_his_sql(result) {
	mongoclient.connect(configuration.mongodb_location, {useNewUrlParser: true}, function(err, db){
		if(err) throw err;
		var dbo = db.db('web568');
		dbo.collection('his_stocks').insertMany(result, function(err, res){
			if(err) return;
			console.log('{0} records updated.'.format(res.insertedCount));
			db.close();
		});
	});
	
}

function insert_into_liv_sql(result) {
	mongoclient.connect(configuration.mongodb_location, {useNewUrlParser: true}, function(err, db){
		if(err) throw err;
		var dbo = db.db('web568');
		dbo.collection('liv_stocks').insertMany(result, function(err, res){
			if(err) return;
			console.log('{0} records updated.'.format(res.insertedCount));
			db.close();
		});
	});
	
}

function update_stock() {
	console.log('Information update task pending...');
	for (var i = 0; i < configuration.request_symbols.length; i++) {
		symbol = configuration.request_symbols[i];
		stockdata.stock_realtime_data(symbol, insert_into_liv_sql);
		stockdata.stock_historical_data(symbol, insert_into_his_sql);
	}
	console.log('Task assigned');
}

console.log('Backend stock data sync service');
console.log('Update interval: {0} second(s)'.format(configuration.updateInterval));

update_stock();
setInterval(update_stock, configuration.updateInterval * 1000);