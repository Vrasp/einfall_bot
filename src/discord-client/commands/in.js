const Discord = require('discord.js');
const tdaClient = require('../../tda-client');
const RedisOMClient = require('../../redis-client');
const PLAYS_CHANNEL_ID = '940914216062320710';//'776580014476623893';

module.exports = {
	file_name: __filename,
	name: 'in',
	description: 'Assert that you\'ve entered an options play',
	usage: '<ticker> <strike><P/C> <expiration> <price> <contract count>',
	cooldown: 3,
	args: 1,
	async execute(message, args)
	{
		let date = new Date();
		let currentYear = date.getFullYear().toString();
		
		let ticker = args[0].toUpperCase();
		let strike = Number(args[1].slice(0, args[1].length - 1));
		let putOrCall = args[1].charAt(args[1].length - 1).toUpperCase();
		let expiration = args[2].replaceAll('/', '');
		let price = Number(args[3]);
		let contracts = Number(args[4]);

		if (expiration.length == 4) {
			expiration += currentYear.slice(-2);
		}

		let contract = `${ticker}_${expiration}${putOrCall}${strike}`;

		expiration = expiration.replace(/.{2}/g, '$&/').slice(0, -1);

		let info = await tdaClient.client.getQuotes({ "symbol": contract, apikey: "" });

		let tickerCount = Object.values(info).length;

		if (!tickerCount || info[contract].description == 'Symbol not found') {
			return message.reply(`Couldn't determine the correct contract.  Please try again.`);
		}

		let contractLastPrice = info[contract].lastPrice;

		let stockInfo = await tdaClient.client.getQuotes({ "symbol": ticker, apikey: '' });

		if (price < contractLastPrice * 0.8 || price > contractLastPrice * 1.2) {
			return message.reply(`Your stated price differs too much from the actual contract price.`);
		}

		let spot = stockInfo[ticker].lastPrice;

		let color = (contracts >= 0 ? 3066993 : 15158332);

		const embed = new Discord.MessageEmbed()
			.setTitle(`${contracts > 0 ? 'Buy' : 'Sell'} to Open`)
			.setColor(color)
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });

		embed.addField("Ticker", ticker, true)
			.addField("Strike", strike.toString(), true)
			.addField('P/C', (putOrCall == 'P' ? 'PUT' : 'CALL'), true)
			.addField('Premium', `${contracts}x @ ${price} [${contractLastPrice}]`, true)
			.addField('Expiry', expiration, true)
			.addField('Spot', spot.toString(), true);

		embed.setTimestamp();

		let playId = await RedisOMClient.client.execute([ 'INCR', `play_count:${message.author.id}` ]);

		let reply = await message.client.channels.cache.get(PLAYS_CHANNEL_ID).send({ embeds: [ embed ] });
		let messageLink = `https://discord.com/channels/${reply.guildId}/${reply.channelId}/${reply.id}`;

		let play = await RedisOMClient.playRepository.createAndSave({
			userId: message.author.id,
			username: message.author.username,
			playId,
			contract,
			ticker,
			strike,
			putOrCall,
			expiration,
			expirationDate: new Date(expiration + ' 16:00:00 GMT-0400'),
			price,
			contracts,
			spot,
			openOrClose: 'OPEN',
			messageLink
		});

		const replyEmbed = new Discord.MessageEmbed()
			.setTitle('Added your play!')
			.setURL(messageLink);

		return message.reply({ embeds: [ replyEmbed ] });
	},
};