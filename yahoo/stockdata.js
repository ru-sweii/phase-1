var request = require('request');

function fast_transfer(symbol, json_data, type, callback) {
	quote = json_data.chart.result[0].indicators.quote[0];
	timestamp = json_data.chart.result[0].timestamp;

	for (var i = 0; i < timestamp.length; i++) {
		callback(timestamp[i], symbol, quote.high[i], quote.low[i], quote.open[i], quote.close[i], quote.volume[i], type);
	}
}

function get_his_data(symbol, callback){
	var auth_url = 'https://finance.yahoo.com/quote/{0}/history?p={0}';
	var api_url = 'https://query1.finance.yahoo.com/v7/finance/chart/{0}?period1={1}&period2={2}&interval=1d&events=history&crumb={3}';

    request(auth_url.format(symbol), function (error, response, body) {
        if (!error && response.statusCode == 200) {
    		var next_url = api_url.format(symbol, parseInt(Date.now() / 1000) - 365 * 24 * 60 * 60, parseInt(Date.now() / 1000), body.match(/{"crumb"\:"([^"]+)"}/)[1]);
    		request(next_url, function(error, response, body) {
    			if(!error && response.statusCode == 200) {
    				fast_transfer(symbol, JSON.parse(body), 0, callback);
    				return
    			}
    		});
        }
    })
};

function get_live_data(symbol, callback){
	var api_url = 'https://query1.finance.yahoo.com/v8/finance/chart/{0}?region=US&lang=en-US&includePrePost=false&interval=1m&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance';
    request(api_url.format(symbol), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fast_transfer(symbol, JSON.parse(body), 1, callback);
            return
        }
    })
};

module.exports = {
	stock_realtime_data: get_live_data,
	stock_historical_data: get_his_data
};