const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { getLyrics } = require('genius-lyrics-api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Obtém a letra da música atual.'),

    async execute(interaction) {
        const { client } = interaction;
        const queue = client.player.getQueue(interaction.guildId);
        const embed = new EmbedBuilder();
        const currentSong = queue && queue.current;

        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Playlist vazia!')
                .setDescription('Não há nenhuma música sendo reproduzida.')
            ]});

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})

        // const response = await fetch(currentSong.url);
        // const data = await response.text();
        // const musicName = data.split('"},"defaultMetadata":{"simpleText":"')[1]?.split('"},"')[0];
        
        const options = {
            apiKey: config.geniusClientAccessToken,
            title: currentSong.title,
            artist: ' ',
            optimizeQuery: true
        };

        const lyrics = await getLyrics(options);

        if (!lyrics || lyrics.length >= 4000)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Nenhuma letra encontrada.')
                .setDescription('Provavelmente as letras desta música ainda não foram publicadas ou o título do vídeo pode ter muitas informações.')
            ]})

        
        await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle(`Letras de ${currentSong.title}`)
            .setDescription(lyrics)
            .setURL(currentSong.url)
        ]})
    }
}