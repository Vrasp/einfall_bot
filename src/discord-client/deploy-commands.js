const fs = require('fs').promises;
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

async function getSlashCommands(dir) {
	let commands = [];

	const files = await fs.readdir(path.join(__dirname, dir));

	for (let file of files) {
		const stat = await fs.lstat(path.join(__dirname, dir, file));

		if (stat.isDirectory()) {
			// If file is a directory, recursive call
			let newCommands = await getSlashCommands(path.join(dir, file));
			Array.prototype.push.apply(commands, newCommands);
		} else {
			// Ensure the file is a .js file
			if (file.endsWith('.js')) {
				try {
					const command = require(path.join(__dirname, dir, file));

					commands.push(command.data.toJSON());
				} catch (err) {
					console.error(err);
				}
			}
		}
	}

	return commands;
}
(async (dir) => {
	const commands = await getSlashCommands(dir);

	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

	rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
})('./slash-commands');