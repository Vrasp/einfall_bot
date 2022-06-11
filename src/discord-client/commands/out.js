const Discord = require('discord.js');
const tdaClient = require('../../tda-client');
const RedisOMClient = require('../../redis-client');

module.exports = {
	file_name: __filename,
	name: 'out',
	description: 'Exit one of your open positions',
	usage: '<play#> | last',
	cooldown: 3,
	async execute(message, args)
	{
		let play;
		let pnl;

		if (args[0] && args[0].toLowerCase() == 'last') {
			play = await RedisOMClient.playRepository.search().where('userId').equals(message.author.id).sortDescending('playId').return.first();
		} else {
			play = await RedisOMClient.playRepository.search().where('userId').equals(message.author.id).and('playId').equals(args[0]).return.first();
		}

		if (!play) {
			return message.reply(`You don't have any open positions.`);
		}

		let info = await tdaClient.client.getQuotes({ "symbol": play.contract, apikey: "" });
		let contractLastPrice = info[play.contract].lastPrice;

		let stockInfo = await tdaClient.client.getQuotes({ "symbol": play.ticker, apikey: '' });

		let spot = stockInfo[play.ticker].lastPrice;

		if (play.contracts > 0) {
			pnl = (contractLastPrice - play.price) * play.contracts;
		} else {
			pnl = (play.price - contractLastPrice) * play.contracts;
		}

		let savedpnl = await RedisOMClient.client.execute([ 'get', `profit_loss:${message.author.id}` ]) || 0;
		await RedisOMClient.client.execute([ 'set', `profit_loss:${message.author.id}`, Number(savedpnl) + pnl ]);
		await RedisOMClient.playRepository.remove(play.entityId);

		const embed = new Discord.MessageEmbed()
			.setTitle((play.contracts > 0 ? `Sell to Close` : `Buy to Close`))
			.setURL(play.messageLink)
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });

		embed.addField('Ticker', play.ticker, true)
			.addField('Strike', play.strike.toFixed(2), true)
			.addField('P/C', (play.putOrCall == 'P' ? 'PUT' : 'CALL'), true)
			.addField('Premium', `${play.contracts} @ ${play.price.toFixed(2)} -> ${contractLastPrice.toFixed(2)}`, true)
			.addField('Expiry', play.expiration, true)
			.addField('Spot', spot.toFixed(2), true)
			.addField('P&L', pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));

		embed.setTimestamp();

		return message.reply({ embeds: [ embed ] });
	},
};