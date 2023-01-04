const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Alterna a exibição da faixa que está tocando.'),

    async execute(interaction) {
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const queue = client.player.getQueue(interaction.guildId);

        if (queue && queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
        
        client.player.showNowPlaying = !(client.player.showNowPlaying);
        await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle('Alternado com sucesso.')
            .setDescription(
                client.player.showNowPlaying
                    ? 'Agora o bot exibirá detalhes da música sempre que iniciar uma nova faixa.'
                    : 'O bot não exibirá mais detalhes ao se iniciar uma nova música.'
            )
        ]})
    }
}