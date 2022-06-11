const tdaClient = require('../../tda-client');

module.exports = {
	file_name: __filename,
	name: 'movers',
	description: 'Displays the biggest SPX movers of the day.',
	cooldown: 3,
	async execute(message, args)
	{
		let upMovers = await tdaClient.client.getMovers({ "index": "$SPX.X", "direction": "up", "change": "percent" });
		let downMovers = await tdaClient.client.getMovers({ "index": "$SPX.X", "direction": "down", "change": "percent" });

		let movers = upMovers.slice(0, 5);
		Array.prototype.push.apply(movers, downMovers.slice(0, 5));

		movers.sort((a, b) => {
			return Math.abs(b.change) - Math.abs(a.change);
		});

		movers = movers.slice(0, 20);

		let moverTickers = movers.map((el) => { return el.symbol; });

		let info = await tdaClient.client.getQuotes({ "symbol": moverTickers.join(',').toUpperCase(), apikey: "" });
		tdaClient.display_TDA_Prices(message, info);
	},
};