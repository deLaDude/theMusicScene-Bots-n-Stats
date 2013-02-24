/* 
	Easily run one or multiple bots with this short script.
	Just add bots models as needed to the array.
*/
(function () {
	var Maude = require("./maude.js").Maude;

	var rooms = {
		IWYW: "4dff1eac14169c565800892e",
		CoBC: "4e726c6467db461e659e5503",
		ACTH: "4df8319e9021683a2f000a55",
		MUfm: "4e0b631414169c68880143a3",
		EDM: "5048f63aeb35c1288c0002a8",
		HHtLA: "506e28d50f812c6b182175fb"
	};

	var festivalRooms = {
		FareohEDM: "50be6a6deb35c14d0a7ead75"
	};	

	var botModels = [
		{
			name: "<bot name>",
			auth: '<bot auth>',
			userId: '<bot user id>',
			roomId: rooms.CoBC, 
			admin: {
				id: '<bot admin id>',
				stalk: false
			},
			statDb: "stats",
			vote: false
		}
	];	

	var bots = [];

	for (var i in botModels) {
		bots.push(new Maude(botModels[i]));
	}
})();