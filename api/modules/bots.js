/**
 * Bots is a RESTful api for managing the bot army
 */
function Bots (http, db) {
	var self = this;

	http.get('/bots', function(req, res){
		db.bots.find(function(err, bots) {
			var body;

			if (err || !bots) {
				body = err;
			} else {
				body = {
					bots: bots
				};

				body = JSON.stringify(body);
			}

			res.setHeader('Content-Type', 'text/json');
			res.send(body);
			res.end();
		});
	});

	/**
	 * Add a bot to the DB
	 */
	http.post('/bots/add', function (req, res) {
		var newbot = req.body,
				errors = [];		

		if (newbot) {
			// validate fields	
			if (!newbot.name) {
				errors.push("no name provided");
			}

			if (!newbot.auth) {
				console.log(newbot.auth.length);
				errors.push("invalid auth key");
			} 

			if (!newbot.roomId || !/^[0-9a-f]{24}$/.test(newbot.roomId)) {
				errors.push("invalid room id");
			}

			if (!newbot.userId && !/^[0-9a-f]{24}$/.test(newbot.userId)) {
				errors.push("invalid user id");
			}

			if (!newbot.adminId && !/^[0-9a-f]{24}$/.test(newbot.adminId)) {
				errors.push("invalid user id");
			}
		} else {
			errors.push("no data recieved");
		}

		if (errors.length > 0) {
			// bad request
			res.send(400, { errors: errors });
		} else {
			// add bot
			db.bots.save(newbot, function(err, saved) {
				if (err || !saved) {
					console.log(err);
					errors.push("could not save bot");
				} else {
					// send response upon success
					res.stats(201);	
				}
			});	
		}

		res.end();	
	});
}

module.exports = Bots;