const prefix = process.env.DISCORD_COMMAND_PREFIX;

module.exports = {
	name: 'help',
	file_name: __filename,
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 3,
	execute(message, args)
	{
		const data = [];
		let { commands } = message.client;

		if (!args.length)
		{
			commands = commands.filter((command) => { return !command.hidden; });
			data.push(`Available commands: `);
			data.push(commands.map(command => `**${command.name}**`).join(', '));
			data.push(`\nFor more information, use \`${prefix}help <command name>\``);

			return message.reply(data.join('\n'))
				.then(() =>
				{
					if (message.channel.type === 'dm')
					{
						return;
					}
				})
				.catch(error =>
				{
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply(`It seems like I can't DM you!  Do you have DMs disabled?`);
				}
			);
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command)
		{
			return message.reply(`that's not a valid command!`);
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases)
		{
			data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		}
		if (command.description)
		{
			data.push(`**Description:** ${command.description}`);
		}
		if (command.usage)
		{
			data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
		}
		if (command.channels)
		{
			data.push(`**Channels**: ${command.channels.map((channel) => { return `<#${channel}>` ; }).join(', ')}`);
		}

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.reply(data.join('\n'));
	},
};