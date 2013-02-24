/**
 * Stats is a RESTful api for retrieving statistics from the data store.
 */
function Stats (http, db) {
	var self = this;

	http.get('/allplays', function(req, res){
		db.plays.find(function(err, plays) {
			var body;

			if (err || !plays) {
				body = err;
			} else {
				body = {
					count: plays.length,
					plays: plays
				};

				body = JSON.stringify(body);
			}

			res.setHeader('Content-Type', 'text/json');
			// res.setHeader('Content-Length', body.length + 5);
			res.send(body);
		});
	});

	http.get('/room/:id/plays', function (req, res) {
		console.log(req.params.id);
		db.plays.find({ "roomInfo.id": req.params.id }, function(err, plays) {
			var body;
			if (err || !plays) {
				body = err;
			} else {
				body = {
					count: plays.length,
					plays: plays
				};

				body = JSON.stringify(body);
			}

			res.setHeader('Content-Type', 'text/json');
			// res.setHeader('Content-Length', body.length + 5);
			res.send(body);
		});	
	});

	http.get('/dj/:id/plays', function(req, res) {
		db.plays.find({ djId: req.params.id }, function(err, plays) {
			var body;

			function getTotal (property)  {
				var count = 0;

				for (var i in plays) {
					count += plays[i][property];
				}

				return count;
			}

			function getAverage (property) {
				var total = getTotal(property);

				return (total / plays.length);
			}

			function findHighest (property) {
				var high = 0;

				for (var i in plays) {
					if (plays[i].roomInfo.listeners > high) {
						high = plays[i].roomInfo.listeners;
					}
				}

				return high;
			}

			if (err || !plays) {
				body = err;
			} else {
				body = {
					summary: {
						totalPlays: plays.length,
						totalLikes: getTotal("likes"),
						totalHearts: getTotal("hearts"),
						totalLames: getTotal("lames"),
						averagePointsPerSong: getAverage("likes"),
						averageHeartsPerSong: getAverage("hearts"),
						averageLamesPerSong: getAverage("lames"),
						averageScore: Math.round(getAverage("score") * 100),
						peekListeners: findHighest()
					},
					plays: plays
				};

				body = JSON.stringify(body);
			}

			res.setHeader('Content-Type', 'text/json');
			res.send(body);
		});
	});

	http.get('/hearts', function(req, res){
		db.hearts.find(function(err, hearts) {
			var body;

			if (err || !hearts) {
				body = err;
			} else {
				body = {
					count: hearts.length,
					plays: hearts
				};

				body = JSON.stringify(body);
			}

			res.setHeader('Content-Type', 'text/json');
			res.send(body);
		});
	});

}

module.exports = Stats;