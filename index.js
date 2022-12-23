const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Mapeia cada arquivo encontrado no diretório de comandos e adiciona à coleção
// de comandos do objeto client.
for (const file of commandsFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('data' in command || 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.error(`The command at the path ${filePath} is missing a "data" or "execute" attribute. `);
	}
}

// Notifica que o bot já está ligado.
client.on('ready', () => {
  	console.log(`Logged in as ${client.user.tag}!`);
});

// Interação criada pelo usuário
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command)
		throw new Error(`The command ${interaction.commandName} couldn't be found.`);

	try {
		await command.execute(interaction);
	} catch(err) {
		console.error(err);
		await interaction.reply({content: 'An error ocurred and I couldn\'t process your command.'})
	}
});

client.login(token);