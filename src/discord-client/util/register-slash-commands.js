const fs = require('fs').promises;
const path = require('path');

/**
 * Register commands with the discord client
 * @param {Discord.Client} client - The discord client instance
 * @param {String} dir - The directory where commands are located
 */
async function registerSlashCommands(client, dir) {
	const files = await fs.readdir(path.join(__dirname, dir));

	for (let file of files) {
		const stat = await fs.lstat(path.join(__dirname, dir, file));

		if (stat.isDirectory()) {
			// If file is a directory, recursive call
			await registerSlashCommands(client, path.join(dir, file));
		} else {
			// Ensure the file is a .js file
			if (file.endsWith('.js')) {
				try {
					const command = require(path.join(__dirname, dir, file));

					//if (checkCommandModule(commandName, command)) {
						client.slashCommands.set(command.data.name, command);
					//}
				} catch (err) {
					console.error(err);
				}
			}
		}
	}
}

module.exports = registerSlashCommands;