const tdaClient = require('../../tda-client');

module.exports = {
	file_name: __filename,
	name: 'fundamentals',
	aliases: [ 'fun' ],
	description: 'Displays fundamentals for the specified stock.',
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
			return message.reply('An error occurred while attempting that request.  Perhaps no stock with that ticker exists?');
		}
		else if (Object.values(info).length == 1)
		{
			const fundamentals = await tdaClient.client.searchInstruments({ "symbol": ticker, "apikey": "", "projection": "fundamental" });

			info[ticker]['fundamentals'] = fundamentals[ticker]['fundamental'];

			tdaClient.displayTDAFundamentals(message, ticker, info);
		}
		else
		{
			tdaClient.displayTDAPrices(message, info);
		}
	},
};