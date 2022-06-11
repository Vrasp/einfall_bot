const Discord = require('discord.js');
const tdaClient = require('../../tda-client');
const RedisOMClient = require('../../redis-client');
const PLAYS_CHANNEL_ID = '776580014476623893';
//const r

module.exports = {
	file_name: __filename,
	name: 'who',
	description: 'View all users who have options on a specific ticker',
	usage: '<ticker>',
	cooldown: 3,
	args: 1,
	async execute(message, args)
	{		
		let ticker = args[0].toUpperCase();

		let plays = await RedisOMClient.playRepository.search().where('ticker').equals(ticker).return.all();

		const embed = new Discord.MessageEmbed()
			.setTitle(`${ticker} Plays`);

			// todo better msg but ye
		plays.forEach((play) => {
			embed.addField(play.username || 'Oops', `${play.strike}${play.putOrCall}\n${play.expiration}`, true);
		});

		return message.reply({ embeds: [ embed ] });
	},
};