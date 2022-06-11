const Discord = require('discord.js');
const prefix = process.env.DISCORD_COMMAND_PREFIX;

module.exports = async (client, message) =>
{
	const channelType = message.channel.type;

	if (channelType == 'dm')
	{
		// We don't respond to DMs
		return;
	}

	if (!message.content.startsWith(prefix) || message.author.bot) { return; }

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) { return; }
	else if (command.channels && !command.channels.includes(message.channel.id)) { return; }

	if (channelType === 'dm' && !command.canDM)
	{
		return message.reply(`I can't execute that command inside DMs!`);
	}

	if (command.args && args.length < command.args)
	{
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage)
		{
			reply += `  The proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.reply(reply);
	}

	if (!client.cooldowns.has(command.name))
	{
		client.cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = client.cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id))
	{
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime)
		{
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try
	{
		await command.execute(message, args);
	}
	catch (error)
	{
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
}