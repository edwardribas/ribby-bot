const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pule quantas faixas quiser!')
        .addNumberOption(op => op
            .setName('faixa')
            .setDescription('Número da faixa para qual você quer pular')
        ),

    async execute(interaction) {
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const player = client.player;
        const queue = player.getQueue(interaction.guildId);
        const interactionArgument = interaction.options.data[0];
        const tracksToSkipCount = (interactionArgument && interactionArgument.value) || 1;
        const isThereASongAfter = queue && queue.tracks.length >= 1;
        const tracksCount = queue && queue.tracks.length;

        const destroyQueue = async (plural) => {
            queue.destroy();
            return await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle(plural ? 'Faixas puladas com sucesso.' : 'Faixa pulada com sucesso')
                .setDescription(`A lista de reprodução foi finalizada.`)
            ]});
        }

        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não é possível pular.')
                .setDescription('Não há nenhuma música sendo reproduzida no momento.')
            ]});

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]});

        if (tracksToSkipCount === 1) {
            if (!isThereASongAfter) return destroyQueue(false);

            queue.skip();
            const song = queue.tracks[0];
            return await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle(`Faixa pulada com sucesso.`)
                .setDescription(`**${song.title}** está tocando agora.`)
                .setFooter({ text: `Duração: ${song.duration}`})
                .setURL(song.url)
            ]});
        }

        if (tracksToSkipCount > tracksCount)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não é possível pular.')
                .setDescription(`A faixa **#${tracksToSkipCount}** não existe.`)
            ]});

        queue.skipTo(tracksToSkipCount-1);
        const song = queue.tracks[0];
        await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle(`Pulou para a faixa #${tracksToSkipCount} com sucesso.`)
            .setDescription(`${song.title} está tocando agora.`)
            .setFooter({ text: `Duração: ${song.duration}`})
            .setURL(song.url)
        ]})
    }
}