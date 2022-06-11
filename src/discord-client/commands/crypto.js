const Discord = require('discord.js');
const coinGeckoClient = require('../../coingecko-client');

module.exports = {
	name: 'crypto',
	file_name: __filename,
	aliases: [ 'cr' ],
	description: 'Displays information on the specified cryptocurrency.',
	usage: '<ticker>',
	cooldown: 3,
	args: 1,
	async execute(message, args)
	{
		const tickers = args;

		if (tickers.length < 2)
		{
			const embed = new Discord.MessageEmbed();
			await coinGeckoClient.displayCoinGeckoPrice(message, tickers[0], embed);
		}
		else
		{
			const embed = new Discord.MessageEmbed().setTitle("Crypto Prices");

			await coinGeckoClient.displayCoinGeckoPrices(message, tickers, embed);
		}
	},
};