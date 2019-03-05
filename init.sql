create database if not exists web568;

use web568;
create table if not exists stocks(
	s_timestamp timestamp, 
	symbol varchar(10), 
	high float, 
	low float, 
	open float, 
	close float, 
	volume float, 
	primary key (s_timestamp, symbol)
);

