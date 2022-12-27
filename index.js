const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { token } = require('./config.json');
const { Player } = require('discord-player');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages
	]
});

client.commands = new Collection();
client.player = new Player(client, {
	showNowPlaying: false,
	ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
	}
});

const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const embed = new EmbedBuilder();

for (const file of commandsFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('data' in command || 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.error(`The command at the path ${filePath} is missing a "data" or "execute" attribute. `);
	}
}

client.on('ready', () => {
  	console.log(``);
  	console.log(`${client.user.tag} agora está logado - ${new Date().toLocaleString('pt-br')}`);
  	console.log(``);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand() || interaction.hasReplied) return;

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command)
		return await interaction.reply({embeds: [embed
			.setColor('red')
			.setTitle('Comando inexistente.')
			.setDescription(`O comando **${interaction.commandName}** não foi encontrado.`)
		]})

	try {
		await command.execute(interaction);
	} catch(err) {
		console.error(err);
		await interaction.reply({embeds: [embed
			.setColor('Red')
			.setTitle('Algo deu errado.')
			.setDescription('Ocorreu um erro e não foi possível executar o seu comando.')
		]})
	}
});

client.on("messageCreate", (message) => {
	const containsRibby = message.content.toLowerCase().match(/ribby/g) && message.content.toLowerCase().match(/ribby/g).length !== 0;
	if (message.guildId === '946460608251957388' && message.author.id === '366582685310910464' && containsRibby) {
		return message.reply('Olha meu chefão aí!')
	}
});

client.player.on('trackStart', (guild) => {
	if (client.player.showNowPlaying) {
		const embed = new EmbedBuilder();
		const guildId = guild.metadata.channel.guild.id;
		const queueChannel = guild.metadata.channel;
		const currentSong = client.player.getQueue(guildId).current;
		queueChannel.send({embeds: [embed
			.setColor('Greyple')
			.setTitle(`Reproduzindo ${currentSong.title}`)
			.setDescription(`${currentSong.requestedBy} escolheu essa música.\n`)
			.setFooter({text: `Duração: ${currentSong.duration}`})
			.setURL(currentSong.url)
			.setThumbnail(currentSong.thumbnail)
		]})
	}
});


client.login(token);