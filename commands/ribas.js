const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ribas')
        .setDescription('Você verá a foto do dono do bot.'),
        
    async execute(interaction) {
        const embed = new EmbedBuilder();
        embed.setColor('Red');
        embed.setTitle('Ribas');
        embed.setDescription('Flamengo CAMPEÃO!!!!!!');
        embed.setImage('https://media.discordapp.net/attachments/946460608839184466/1055231394718154752/1690f40b4216558eba1c28c7123ed310.png');
        await interaction.reply({embeds: [embed]});
    }
}