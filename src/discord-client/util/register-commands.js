const fs = require('fs').promises;
const path = require('path');
//const { checkCommandModule } = require('./check-command-module');

/**
 * Register commands with the discord client
 * @param {Discord.Client} client - The discord client instance
 * @param {String} dir - The directory where commands are located
 */
async function registerCommands(client, dir) {
	const files = await fs.readdir(path.join(__dirname, dir));

	for (let file of files) {
		const stat = await fs.lstat(path.join(__dirname, dir, file));

		if (stat.isDirectory()) {
			// If file is a directory, recursive call
			await registerCommands(client, path.join(dir, file));
		} else {
			// Ensure the file is a .js file
			if (file.endsWith('.js')) {
				try {
					const command = require(path.join(__dirname, dir, file));

					//if (checkCommandModule(commandName, command)) {
						client.commands.set(command.name, command);
					//}
				} catch (err) {
					console.error(err);
				}
			}
		}
	}
}

module.exports = registerCommands;