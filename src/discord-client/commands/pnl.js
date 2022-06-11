const RedisOMClient = require('../../redis-client');

module.exports = {
	file_name: __filename,
	name: 'pnl',
	description: 'Displays profit/loss for the specified user (or yourself)',
	usage: '[@<user>]',
	cooldown: 3,
	async execute(message, args)
	{
		let userToCheck = message.author;

		if (message.mentions.users.size) {
			userToCheck = message.mentions.users.first();
		}

		let data = await RedisOMClient.client.execute([ 'get', `profit_loss:${userToCheck.id}` ]) || 0;

		return message.reply(`P&L for ${userToCheck}: ${Number(data).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
	},
};