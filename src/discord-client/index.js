//require('./deploy-commands');
const Discord = require('discord.js');
const { registerCommands, registerSlashCommands } = require('./util');
const { onInteractionCreateEvent, onMessageEvent, onReadyEvent } = require('./events');

const coinGeckoClient = require('../coingecko-client');

let client;

(async () => {
	client = new Discord.Client({ intents: [ 
		Discord.Intents.FLAGS.GUILDS, 
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.DIRECT_MESSAGES, 
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
	]});

	client.commands = new Discord.Collection();
	client.slashCommands = new Discord.Collection();
	client.cooldowns = new Discord.Collection();
	client.slashCooldowns = new Discord.Collection();

	const coinListRequest = await coinGeckoClient.coins.list();
	coinGeckoClient.coinList = (coinListRequest && coinListRequest.data);

	// Populate list of commands
	await registerCommands(client, '../commands');

	// We aren't using any slash commands, irrelevant
	//await registerSlashCommands(client, '../slash-commands');

	// Attach event handlers
	client.on('ready', () => { onReadyEvent(client); });
	client.on('messageCreate', (message) => { onMessageEvent(client, message) });
	client.on('interactionCreate', async (interaction) => { onInteractionCreateEvent(client, interaction); });

	client.login(process.env.DISCORD_TOKEN);
})();

module.exports = client;