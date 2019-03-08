# Backend module

This module is used for yahoo stock data collection.

### Features

- Collect realtime and historical records for 10 different stocks
- Store using MySQL for further development

### Installation

To deploy the data collector, first install Node.JS and MySQL.
Whatever username/password/database is using, make sure to save and modify the following content to configuration.json.
```json
{
	"pool": {
				"host": "localhost", 
				"user": "admin", 
				"password": "web", 
				"database": "web", 
				"connectionLimit": 64 
			},
	"request_symbols": ["GOOG", "AABA", "WFC", "C", "BAC", 
					    "GS", "USB", "JPM", "PFE", "INTC"],
	"updateInterval": 3600
}
```
The mysql connection configuration is stored in pool, and updateInterval is the interval (in second) for collection. request_symbols store the stock symbols we are interested in.

After building the database, create a table using the following statements:
```sql
create table if not exists stocks(
	s_timestamp datetime, 
	symbol varchar(10), 
	high float, 
	low float, 
	open float, 
	close float, 
	volume float, 
	type int,
	primary key (s_timestamp, symbol)
);
```
Historical data is marked as type 0, realtime data is marked as type 1.

Now we can use the data collector by executing the following command (Note that there is no "complete" output since it is a backend module):

```bash
node ./index.js
```

To retrieve data from database, execute the following command:

```bash
node ./stock_dump.js
```

It will keep running and updating information.