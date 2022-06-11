const Discord = require('discord.js');
const pad = require('pad');
const RedisOMClient = require('../../redis-client');

const PLAYS_PER_PAGE = 10;

module.exports = {
	file_name: __filename,
	name: 'positions',
	description: 'Display all of your active options positions',
	usage: '[page#]',
	cooldown: 3,
	async execute(message, args)
	{
		let page = Number(args[0] - 1) || 0;
		let offset = page * PLAYS_PER_PAGE;

		let plays = await RedisOMClient.playRepository.search().where('userId').equals(message.author.id).sortDescending('playId').return;
		let count = await plays.count();

		if (!count) {
			return message.reply(`You don't have any open positions.`);
		}
		
		plays = await plays.page(offset, PLAYS_PER_PAGE);

		let table = "\`\`\`\n";
		table += '+--------+--------+----------+--------+--------------+------------+----------+\n';
		table += `| ${pad('#', 6)} | ${pad('Ticker', 6)} | ${pad('Strike', 8)} | ${pad('P/C', 6)} | ${pad('Premium', 12)} | ${pad('Expiry', 10)} | ${pad('Spot', 8)} |\n`;
		table += '+--------+--------+----------+--------+--------------+------------+----------+';

		plays.forEach((play) => {
			table += "\n"
				+ `| ${pad('#' + (play.playId?.toString() || '1'), 6)} `
				+ `| ${pad(play.ticker, 6)} `
				+ `| ${pad(play.strike.toString(), 8)} `
				+ `| ${pad(play.putOrCall == 'P' ? 'PUT' : 'CALL', 6)} `
				+ `| ${pad(play.contracts + ' @ ' + play.price.toFixed(2), 12)} `
				+ `| ${pad(play.expiration, 10)} `
				+ `| ${pad(play.spot.toFixed(2), 8)} |\n`;

			table += '+--------+--------+----------+--------+--------------+------------+----------+';
		});

		table += `\nPage: ${page+1} / ${Math.ceil(count / PLAYS_PER_PAGE)}`;
		table += `\`\`\``;

		message.reply(table);
	},
};