const Discord = require('discord.js');

module.exports = async (client, interaction) =>
{
	if (!interaction.isCommand()) { return; }

	const command = client.slashCommands.get(interaction.commandName.toLowerCase());

	if (!command) { return; }

	try {
		if (command.args && args.length < command.args) {
			let reply = `You didn't provide any arguments, ${interaction.user}!`;

			if (command.usage)
			{
				reply += `  The proper usage would be: \`/${command.name} ${command.usage}\``;
			}

			throw new Error(reply);
		}

		if (!client.slashCooldowns.has(command.name))
		{
			client.slashCooldowns.set(command.name, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = client.slashCooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(interaction.user.id))
		{
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
	
			if (now < expirationTime)
			{
				const timeLeft = (expirationTime - now) / 1000;
				throw new Error(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`);
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: error.message, ephemeral: true });
	}
}