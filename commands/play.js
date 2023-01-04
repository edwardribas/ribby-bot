const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adiciona uma música ou playlist à fila de reprodução.')
        .addStringOption(op => op
			.setName('search')
			.setDescription('Nome ou link da música ou playlist que você quer tocar.')
			.setRequired(true)
			.setMinLength(2)
        ),

    async execute(interaction) {
        const embed = new EmbedBuilder();
        const { client } = interaction;
        const url = interaction.options.data[0].value;
        const isSong = url.search(/(\/playlist\?|\/playlist\/)/) === -1;
        const isYoutube = url.search(/(youtube|yt\.be)/) !== -1;
		const isYoutubePlaylist = url.search(/(youtube|yt\.be|&list=|\?list=)/) !== -1; // its not being used currently
		const queryType = isSong ? QueryType.AUTO : (isYoutube ? QueryType.YOUTUBE_PLAYLIST : QueryType.SPOTIFY_PLAYLIST)

        if (!interaction.member.voice.channel) {
            embed.setColor('Red');
            embed.setTitle('Canal de voz inválido.');
            embed.setDescription('Você precisa estar dentro de um canal de voz para executar este comando!');
            return await interaction.reply({ embeds: [embed] });
        }

        const queue = await client.player.createQueue(interaction.guild, {
            metadata: { channel: interaction.channel }
        });

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})

        const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: queryType
        })
        
        if (result.tracks.length === 0)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Nenhuma música encontrada.')
                .setDescription("Não foi possível encontrar uma música com o link fornecido.")
            ]})

		isSong
			? await queue.addTrack(result.tracks[0])
			: await queue.addTracks(result.tracks);

        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        if (!queue.playing) await queue.play();

		if (isSong) {
			const song = result.tracks[0];
            return await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle(`Música adicionada com sucesso.`)
                .setDescription(`
                    **${song.title}** foi adicionada à posição **#${queue.tracks.length === 0 ? 1 : queue.tracks.length}** da playlist.
                `)
                .setFooter({ text: `Duração: ${song.duration}`})
                .setURL(song.url)
                .setThumbnail(song.thumbnail)
            ]})
        } else {
            return await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle('Músicas adicionadas com sucesso.')
                .setDescription(`Foram carregadas **${result.tracks.length}** faixas.\n O último item se localiza na posição **#${queue.tracks.length}**!`)
                .setThumbnail(result.tracks[0].thumbnail)
                .setTimestamp()
                .setURL(url)
            ]})

        }
    }
}