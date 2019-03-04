function build_helper(){
	if (!String.prototype.format) {
	  String.prototype.format = function() {
	    var args = arguments;
	    return this.replace(/{(\d+)}/g, function(match, number) { 
	      return typeof args[number] != 'undefined' ? args[number] : match;
	    });
	  };
	}
}

function save_to_json_file(filename, json_data) {
	quote = json_data.chart.result[0].indicators.quote[0];
	timestamp = json_data.chart.result[0].timestamp;
	var fs = require('fs');
	var rows = [['Timestamp', 'High', 'Low', 'Open', 'Close', 'Volume']];
	var save_folder = 'CSV/';

	for (var i = 0; i < timestamp.length; i++) {
		rows.push([timestamp[i], quote.high[i], quote.low[i], quote.open[i], quote.close[i], quote.volume[i]].join(','));
	}
	fs.writeFile(save_folder + filename, rows.join('\n'), function(err){
		if(!err) {
			console.log('[STORED] ' + save_folder + filename);
		}
	});
}

function get_his_data(symbol){
	var request = require('request');
	var fs = require('fs');

	var auth_url = 'https://finance.yahoo.com/quote/{0}/history?p={0}';
	var api_url = 'https://query1.finance.yahoo.com/v7/finance/chart/{0}?period1={1}&period2={2}&interval=1d&events=history&crumb={3}';

    request(auth_url.format(symbol), function (error, response, body) {
        if (!error && response.statusCode == 200) {
    		var next_url = api_url.format(symbol, parseInt(Date.now() / 1000) - 365 * 24 * 60 * 60, parseInt(Date.now() / 1000), body.match(/{"crumb"\:"(?<key>[^\"]+)"}/)[1]);
    		request(next_url, function(error, response, body) {
    			if(!error && response.statusCode == 200) {
    				save_to_json_file('his-' + symbol + ".csv", JSON.parse(body));
    			}
    		});
        }
    })
};

function get_live_data(symbol){
	var request = require('request');
	var fs = require('fs');
	var api_url = 'https://query1.finance.yahoo.com/v8/finance/chart/{0}?region=US&lang=en-US&includePrePost=false&interval=1m&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance';
    request(api_url.format(symbol), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            save_to_json_file('liv-' + symbol + ".csv", JSON.parse(body));
        }
    })
};

console.log('===============================================');
console.log('= Stock information collector [Yahoo finance] =');
console.log('= Workable in May, 2019                       =');
console.log('= Author: PX                                  =');
console.log('===============================================');

build_helper();

request_symbols = ['GOOG', 'AABA', 'WFC', 'C', 'BAC', 
				   'GS', 'USB', 'JPM', 'PFE', 'INTC'];

console.log('deploying ' + request_symbols.length + ' task(s)...');

for (var i = 0; i < request_symbols.length; i++) {
	symbol = request_symbols[i];
	console.log('retriving ' + symbol);
	get_live_data(symbol);
	get_his_data(symbol);
}

console.log('task deployed');

