/**
 * First API for TT stats. 
 *  Just messing around and getting a feel for things.
 */

// dependencies
var express = require('express');
var StatService = require("./modules/stats.js");
var BotService = require("./modules/bots.js");


/** App Code **/
function App (httpService, db) {
	var self = this;

	httpService.use(express.bodyParser());

	self.statService = new StatService(httpService, db);
	self.botService = new BotService(httpService, db);

	// begin service
	httpService.listen(3000);
}


var http = express();
var db = require('mongojs').connect("stats", ["plays", "hearts"]);

var app = new App(http, db);