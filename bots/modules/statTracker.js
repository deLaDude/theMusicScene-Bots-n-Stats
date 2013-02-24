(function () {
	/**
	 * Stat Tracker Module
	 *  Currently only tracking song stats.
	 * 
	 * @param {ttApi}  api    [Turntable Bot Api]
	 * @param {string} dbUri	[logging database location]
	 */
	function StatTracker (api, dbUri) {
		var self = this;

		self.api = api;
		self.db = require('mongojs').connect(dbUri, ["plays", "hearts"]);

		self.roomInfo = {
			id: null,
			name: "",
			listeners: 0
		};

		self.songInfo = {
			djId: null,
			djName: null,
			songId: null,
			songName: null,
			artistName: null,
			album: null,
			coverArt: null,
			genre: null,			
			starttime: null,
			endtime: null,
			likes: 0,
			lames: 0,
			score: 0.5,
			hearts: 0,
			hasVoted: false,
			hasFarted: false
		};

		self.statSubscribers = [];
	}

	// Init function to run the stat tracker as a stand alone bot
	StatTracker.prototype.init = function () {
		var self = this;

		// Stat Tracker Subscriptions
		self.api.on('roomChanged', function (data) { self.enterRoom.call(self, data); });
		self.api.on('endsong', function (data) {	self.logPlay.call(self, data); });
		self.api.on('newsong', function (data) { self.songChange.call(self, data); });
		self.api.on('update_votes', function (data) { self.updateSongInfo.call(self, data); });
		self.api.on('snagged', function (data) { self.logHeartFart.call(self, data); });
	};
	
	/**
	 * Updates room and song information when the bot enters a room
	 * @param  {object} data [tt event data]
	 */
	StatTracker.prototype.enterRoom = function (data) {
		var self = this;

		// room info
		self.roomInfo.name = data.room.name;
		self.roomInfo.id = data.room.roomid;
		self.roomInfo.listeners = data.room.metadata.listeners;

		// dj info
		self.songInfo.djId = data.room.metadata.current_song.djid;
		self.songInfo.djName = data.room.metadata.current_song.djname;

		// song info
		self.songInfo.songId = data.room.metadata.current_song.sourceid;
		self.songInfo.songId = data.room.metadata.current_song.sourceid,
		self.songInfo.songName = data.room.metadata.current_song.metadata.song,
		self.songInfo.artistName = data.room.metadata.current_song.metadata.artist,
		self.songInfo.album = data.room.metadata.current_song.metadata.album,
		self.songInfo.coverArt = data.room.metadata.current_song.metadata.coverart,
		self.songInfo.genre = data.room.metadata.current_song.metadata.genre,
		self.songInfo.starttime = data.room.metadata.current_song.starttime;

		// song stats
		self.songInfo.likes = data.room.metadata.upvotes;	
		self.songInfo.lames = data.room.metadata.downvotes;
		self.songInfo.score = self.calculateSongScore(data.room.metadata);

		// bot flags
		self.songInfo.hasVoted = false;
		self.songInfo.hasFarted = false;
	};

	/**
	 * 
	 * Song Stat Methods *
	 * 
	 */

	/**
	 * Calculates the song score. Taken directly from tt source code
	 * @param  {object} stats [song stats]
	 * @return {int}       [song score (%)]
	 */
	StatTracker.prototype.calculateSongScore = function (stats) {
		return (stats.upvotes - stats.downvotes + stats.listeners) / (2 * stats.listeners);
	};

	/**
	 * Updates song info on vote. Also updates room listeners incase ppl come or go midsong.
	 * @param  {object} data [tt event data]
	 */
	StatTracker.prototype.updateSongInfo = function (data) {
		var self = this,
				update = data.room.metadata;

		self.songInfo.likes = update.upvotes;
		self.songInfo.lames = update.downvotes;
		self.songInfo.score = self.calculateSongScore(update);
		self.roomInfo.listeners = update.listeners;
	};

	/**
	 * Updates song information when a new song starts
	 * @param  {object} data [tt event data]
	 */
	StatTracker.prototype.songChange = function (data) {
		var self = this;

		self.roomInfo.listeners = data.room.listeners;

		self.songInfo = {
			// dj info
			djId: data.room.metadata.current_song.djid,
			djName: data.room.metadata.current_song.djname,

			// song info
			songId: data.room.metadata.current_song.sourceid,
			songName: data.room.metadata.current_song.metadata.song,
			artistName: data.room.metadata.current_song.metadata.artist,
			album: data.room.metadata.current_song.metadata.album,
			coverArt: data.room.metadata.current_song.metadata.coverart,
			genre: data.room.metadata.current_song.metadata.genre,
			starttime: Date.now(),
			endtime: null,

			// stats (reset)
			likes: 0,
			lames: 0,
			score: 0.5,
			hearts: 0,

			// bot flags
			hasVoted: false,
			hasFarted: false
		};
	};

	/**
	 *
	 * Log Methods *
	 *
	 */
	
	function getTimeStamp () {
		var now = new Date();
		return now.toLocaleDateString() + " - "  + now.toLocaleTimeString();
	}
	
	/**
	 * Records endtime and logs play to datastore when song ends
	 * @param  {object} data [tt event data]
	 */
	StatTracker.prototype.logPlay = function (data) {
		var self = this,
				entry;

		self.songInfo.endtime = Date.now();
		
		entry = self.songInfo;
		delete entry.hasVoted;
		delete entry.hasFarted;

		entry.roomInfo = self.roomInfo;

		self.db.plays.save(entry, function (err, saved) {
			if (err || !saved) {
				console.log("Song save failed: " + err);
			} else {
				console.log("Saved song play - "  + getTimeStamp());
			}
		});
	};

	/**
	 * Updates heart count for song and logs heart fart.
	 * @param  {object} data [tt event data]
	 */
	StatTracker.prototype.logHeartFart = function (data) {
		var self = this,
				entry = {
					roomId: self.roomInfo.id,
					djId: self.songInfo.djId,
					songId: self.songInfo.songId,
					userId: data.userid,
					timestamp: Date.now()
				};
		
		self.songInfo.hearts = self.songInfo.hearts + 1;

		self.db.hearts.save(entry, function (err, saved) {
			if (err || !saved) {
				console.log("Fart save failed: " + err);
			} else {
				console.log("Saved fart - " + getTimeStamp());
			}
		});
	};

	exports.StatTracker = StatTracker;
})();