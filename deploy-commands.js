const { REST, Routes } = require('discord.js');
const { token, clientID } = require('./config.json');
const fs = require('fs');

const COMMANDS_DIR = './commands';

const commands = [];
const commandFiles = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`${COMMANDS_DIR}/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing application (/) commands (${commands.length}).`);

    await rest.put(Routes.applicationCommands(clientID), {
        body: commands
    });

    console.log(`Successfully reloaded application (/) commands (${commands.length}).`);
  } catch (error) {
    console.error(error);
  }
})();