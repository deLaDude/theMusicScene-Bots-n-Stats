/** Testing Access to Room Data **/

// dependencies
var express = require('express');
var TurntableApi = require('../bots/lib/Turntable-API-master/bot.js').Bot;

// config
var AUTH   = 'QkMGeGplCAhOKcWCoqtDDolC';
var USERID = '50b6bb34aaa5cd3c76128989';
var ROOMID = '';

// init
var bot = new TurntableApi(AUTH, USERID, ROOMID);
var app = express();

bot.on('ready', function () {
	console.log("TT api ready");
});

bot.on('error', function (data) {
	console.log("error: " + data);
});

app.get('/rooms', function(req, res){
	bot.directoryRooms({ "sort": "listeners" }, function (data) {
		var body = JSON.stringify(data);

		res.setHeader('Content-Type', 'text/json');
		res.send(body);
	});
});

app.listen(3000);