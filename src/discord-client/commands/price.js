const tdaClient = require('../../tda-client');

module.exports = {
	file_name: __filename,
	name: 'price',
	aliases: [ 'p' ],
	description: 'Displays information about the specified stock(s).',
	usage: '<ticker list>',
	cooldown: 3,
	args: 1,
	async execute(message, args)
	{
		let ticker = args;

		if (ticker) { ticker = ticker.join(',').toUpperCase(); }

		let info = await tdaClient.client.getQuotes({ "symbol": ticker, apikey: "" });

		let tickerCount = Object.values(info).length;

		if (!tickerCount)
		{
			info = await tdaClient.client.searchInstruments({ "symbol": ticker, "projection": 'desc-search', apikey: "" });

			if (info)
			{
				let reg = new RegExp(`${ticker}.*(Common|Depositary Share)`, 'i');

				if (info[ticker])
				{
					ticker = info[tick].symbol;

					info = await tdaClient.client.getQuotes({ "symbol": ticker, apikey: "" });
				}
				else
				{
					for (let tick in info)
					{
						if (info[tick].assetType == 'EQUITY' && reg.test(info[tick].description))
						{
							ticker = info[tick].symbol;

							info = await tdaClient.client.getQuotes({ "symbol": ticker, apikey: "" });
							break;
						}
					}
				}
				tickerCount = Object.values(info).length;
			}
		}

		if (!tickerCount)
		{
			return message.reply('an error occurred while attempting that request.  Perhaps no stock with that ticker exists?');
		}
		else if (Object.values(info).length == 1)
		{
			const fundamentals = await tdaClient.client.searchInstruments({ "symbol": ticker, "apikey": "", "projection": "fundamental" });

			if (fundamentals && fundamentals[ticker])
			{
				info[ticker]['fundamentals'] = fundamentals[ticker]['fundamental'];
			}

			tdaClient.displayTDAPrice(message, ticker, info);
		}
		else
		{
			tdaClient.displayTDAPrices(message, info);
		}
	},
};