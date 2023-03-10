const { REST, Routes } = require('discord.js');
const { token, clientID } = require('./config.json');
const fs = require('fs');

const commandsDirectory = './commands';
const commands = [];
const commandFiles = fs.readdirSync(commandsDirectory).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`${commandsDirectory}/${file}`);
	const commandData = command.data.toJSON();
	if (!command.ignore)
		commands.push(commandData);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
	console.log(" ");
    console.log(`Realizando deploy dos comandos (${commands.length}).`);

    await rest.put(Routes.applicationCommands(clientID), {
		body: commands
    })
	.then(() => {
		console.log('Deploy realizado com sucesso.');
		console.log(" ");
	});
 
	} catch (error) {
    	console.error(error);
  	}
})();