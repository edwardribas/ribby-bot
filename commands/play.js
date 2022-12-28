const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduz uma música do YouTube no seu canal de voz.')
        .addSubcommand(sc => sc
            .setName('pause')
            .setDescription('Alterna a pausa da música atual.')
        )
        .addSubcommand(sc => sc
            .setName('song')
            .setDescription('Adiciona uma música à fila de reprodução.')
            .addStringOption(option => option
                .setName('url')
                .setDescription('URL da música que você quer reproduzir')
                .setRequired(true)
            ),
        )
        .addSubcommand(sc => sc
            .setName('playlist')
            .setDescription('Adiciona uma playlist à fila de reprodução.')
            .addStringOption(option => option
                .setName('url')
                .setDescription('URL da playlist que você quer reproduzir')
                .setRequired(true)
            ),
        ),

    async execute(interaction) {
        const embed = new EmbedBuilder();
        const { client } = interaction;
        const subcommand = interaction.options.getSubcommand();
        const isSong = subcommand === "song";
        const isPause = subcommand === "pause";

        if (!interaction.member.voice.channel) {
            embed.setColor('Red');
            embed.setTitle('Canal de voz inválido.');
            embed.setDescription('Você precisa estar dentro de um canal de voz para executar este comando!');
            return await interaction.reply({ embeds: [embed] });
        }
        
        const queue = await client.player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });
        
        if (isPause){
            if (!queue || !queue.playing) {
                return await interaction.reply({embeds: [embed
                    .setTitle('Não foi possível pausar/despausar.')
                    .setDescription('O bot precisa estar tocando alguma coisa para poder utilizar essa funcionalidade.')
                    .setColor('Red')
                ]})
            }
            else {
                const isPaused = queue.connection.paused;
                if (!isPaused) {
                    queue.setPaused(true)
                    return await interaction.reply({embeds: [embed
                        .setColor('Green')
                        .setTitle('Música pausada.')
                        .setDescription('Utilize o mesmo comando para despausar a música.')
                    ]})
                } else {
                    queue.setPaused(false);
                    return await interaction.reply({embeds: [embed
                        .setColor('Green')
                        .setTitle('Música despausada.')
                        .setDescription('Agora você pode voltar a ouvir sua música.')
                    ]})

                }
            }
        }

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
         
        const [{value: url}] = interaction.options.data[0].options;
        const isYoutube = url.search(/(youtube|yt\.be)/) !== -1;
        const queryType = isSong ? QueryType.AUTO : (isYoutube ? QueryType.YOUTUBE_PLAYLIST : QueryType.SPOTIFY_PLAYLIST)

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


        let song;
        if (isSong) {
            song = result.tracks[0];
            await queue.addTrack(song);
        } else {
            await queue.addTracks(result.tracks)
        }

        if (!queue.connection) await queue.connect(interaction.member.voice.channel)
        if (!queue.playing) await queue.play()
        
        if (isSong) {
            return await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle(`Música adicionada com sucesso.`)
                .setDescription(`
                    **${song.title}** foi adicionada à posição **#${queue.tracks.length === 0 ? 1 : queue.tracks.length + 1}** da playlist.
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