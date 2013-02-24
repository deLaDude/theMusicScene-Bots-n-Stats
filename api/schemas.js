// song info
var s = {
	roomId: "string",
	roomName: "",
	listeners: 0,
	
	djId: null,
	djName: null,
	
	songId: null,
	songName: null,
	artistName: null,
	album: null,
	coverArt: null,
	genre: null,			
	
	likes: 0,
	lames: 0,
	score: 0.5,
	hearts: 0,

	starttime: null,
	endtime: null
};

// heart
var h = {
	roomId: self.roomInfo.id,
	djId: self.songInfo.djId,
	songId: self.songInfo.songId,
	userId: data.userid,
	timestamp: Date.now()
};

// bot

var b = {
	name: "MaudeLebowski",
	auth: 'QkMGeGplCAhOKcWCoqtDDolC',
	userId: '50b6bb34aaa5cd3c76128989',
	roomId: 'dfcdd564fe7d0250302b5a5', 
	adminId: '4dfcdd564fe7d0250302b5a5'
};