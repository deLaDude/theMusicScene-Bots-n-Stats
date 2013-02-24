/**
 * Maude Lebowski
 *  My first TT bot. Just playing around with things and getting to know the api.
 */
(function () {
	// dependencies
	var TurntableApi = require('./lib/Turntable-API-master/bot.js').Bot;
	var StatTracker = require("./modules/statTracker.js").StatTracker;
	
	function Maude (model) {
		var self = this;		

		/** Properties **/

		self.name = model.name;
		self.admin = model.admin;
		self.vote = model.vote; 
		self.defaultRoom = model.roomId;
		self.statSubscribers = [];

		// create modules
		self.api = new TurntableApi(model.auth, model.userId);
		self.tracker = new StatTracker(self.api, model.statDb);

		// Maude's subscriptions
		self.api.on('ready', function (data) { self.ready.call(self, data); });
		self.api.on('roomChanged', function (data) { self.enterRoom.call(self, data); });
		self.api.on('newsong', function (data) { self.songChange.call(self, data); });
		self.api.on('update_votes', function (data) { self.voteCheck.call(self, data); });
		self.api.on('pmmed', function (data) { self.pmRecieved.call(self, data); });
		self.api.on('deregister', function (data) { self.userLeft.call(self, data); });
		
		// init stat tracker subsciptions
		self.tracker.init.call(self.tracker);		
	}

	/**
	 * Event Handlers *
	 */

	Maude.prototype.ready = function (data) {
		var self = this; 

		if (self.admin.stalk) {
			self.locateAdmin();
		} else {
			self.api.roomRegister(self.defaultRoom);
		}
	};
	
	Maude.prototype.enterRoom = function (data) {
		var self = this;

		self.statSubscribers = [];

		console.log(self.name + " entered: " + data.room.name);
	};
	
	Maude.prototype.voteCheck = function (data) {
		var self = this;
		
		if (self.vote) {
			if (self.tracker.songInfo.score >= 0.6 && !self.hasVoted) {
				self.api.bop();
				self.api.hasVoted = true;
			}

			if (self.tracker.songInfo.score >= 0.75) {
				self.api.snag();
			}
		}
	};

	Maude.prototype.songChange = function (data) {
		var self = this;
		
		// dispatch stats to subscribers	
		if (self.statSubscribers.length > 0) {
			for (var i in self.statSubscribers) {
				self.api.pm(self.getSongStatsMessage(), self.statSubscribers[i]);
			}
		}

		if (self.admin.stalk) {
			self.locateAdmin();
		}
	};

	Maude.prototype.pmRecieved = function (data) {
		var self = this;

		if (data.text.match(/^\/stats$/)) {
			self.api.pm(self.getSongStatsMessage(), data.senderid);
		} else if (data.text.match(/^\/statpulse$/)) { 
			self.toggleSubscriber(data.senderid);
		} else if (data.senderid === self.admin.id) {
			self.adminCommands(data);			
		}
	};

	Maude.prototype.userLeft = function (data) {
		var self = this,
				uid = data.user[0].userid;

		for (var subscriber in self.statSubscribers) {
			if (self.statSubcriber[subscriber] === uid) {
				self.toggleSubscriber(uid);
				break;
			}
		}
	};

	/**
	 * Auxilary Methods
	 */
	
	Maude.prototype.getSongStatsMessage = function () {
		var self = this,
				message = 
					"Song: " + self.tracker.songInfo.songName +
					" | :thumbsup: " + self.tracker.songInfo.likes +
						" :thumbsdown: " + self.tracker.songInfo.lames +
						" :heart: " + self.tracker.songInfo.hearts +
					" | Score: " + Math.round(self.tracker.songInfo.score*100) + "%";

			return message;
	};

	Maude.prototype.toggleSubscriber = function (uid) {
		var self = this,
				subscribed = self.statSubscribers.indexOf(uid);

		if (subscribed === -1) {
			self.statSubscribers.push(uid);
			self.api.pm("Stat pulse turned on.", uid);
		} else {
			self.statSubscribers.splice(subscribed, 1);
			self.api.pm("Stat pulse turned off.", uid);
		}
	};

	/**
	 * Admin Methods *
	 */
	
	Maude.prototype.voteToggle = function () {
		var self = this; 

		if (self.vote) {
				self.vote = false;
				self.api.pm("Voting disabled.", self.admin.id);
			} else {
				self.vote = true;
				self.api.pm("Voting enabled.", self.admin.id);
			}
	};

	Maude.prototype.stalkToggle = function () {
		var self = this;
		
		if (self.admin.stalk) {
			self.admin.stalk = false;
			self.api.pm("Stalking turned off. Current room: " + self.tracker.roomInfo.name, self.admin.id);
		} else {
			self.admin.stalk = true;
			self.api.pm("Stalking turned on.", self.admin.id);
			self.locateAdmin();
		}
	};

	Maude.prototype.locateAdmin = function () {
		var self = this;

		self.api.stalk(self.admin.id, false, function (data) {
			if (data.success) {	
				if (data.roomId != self.tracker.roomInfo.id) {
					self.api.roomRegister(data.roomId);
				}				
			} else if (self.tracker.roomInfo.id === null){
				self.api.roomRegister(self.defaultRoom);
			}
		});		
	};

	Maude.prototype.adminCommands = function (data) {
		var self = this;

		if (data.text.match(/^\/fart$/)) {
			self.api.snag();
		} else if (data.text.match(/^\/up$/)) {
			self.api.bop();
			self.tracker.songInfo.hasVoted = true;
		} else if (data.text.match(/^\/down$/)) {
			self.api.vote('down');
			self.tracker.songInfo.hasVoted = true;
		}	else if (data.text.match(/^\/stalk$/)) {
			self.stalkToggle();
		} else if (data.text.match(/^\/vote$/))	{
			self.voteToggle();
		}		
	};

	exports.Maude = Maude;
})();