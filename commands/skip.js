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
        const parameters = interaction.options.data[0];


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
        ]})
        
        const isThereAfter = queue.tracks.length >= 1;
        const numFaixasPular = (parameters && parameters.value) || 1;
        const numFaixas = queue.tracks.length;

        const destroyQueue = async (plural) => {
            queue.destroy();
            return await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle(plural ? 'Faixas puladas com sucesso.' : 'Faixa pulada com sucesso')
                .setDescription(`A lista de reprodução foi finalizada.`)
            ]})
        }

        if (numFaixasPular === 1) {
            if (isThereAfter) {
                queue.skip()
                const song = queue.tracks[0];
                return await interaction.reply({embeds: [embed
                    .setColor('Green')
                    .setTitle(`Faixa pulada com sucesso.`)
                    .setDescription(`**${song.title}** está tocando agora.`)
                    .setFooter({ text: `Duração: ${song.duration}`})
                    .setURL(song.url)
                ]})
            } else {
                destroyQueue(false)
            }
        }


        if (numFaixasPular > numFaixas)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não é possível pular.')
                .setDescription(`A faixa **#${numFaixasPular}** não existe.`)
            ]});

        queue.skipTo(numFaixasPular-1);
        const song = queue.tracks[0];

        return await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle(`Pulou para a faixa #${numFaixasPular} com sucesso.`)
            .setDescription(`${song.title} está tocando agora.`)
            .setFooter({ text: `Duração: ${song.duration}`})
            .setURL(song.url)
        ]})
    }
}