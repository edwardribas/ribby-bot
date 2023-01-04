const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa ou despausa a reprodução de músicas.'),

    async execute(interaction) {
        const embed = new EmbedBuilder();
        const { client } = interaction;
        const queue = client.player.getQueue(interaction.guildId);

        if ((queue && queue.playing) && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
        
        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setTitle('Não foi possível pausar/despausar.')
                .setDescription('O bot precisa estar tocando alguma coisa para poder utilizar essa funcionalidade.')
                .setColor('Red')
            ]})

        const isPaused = queue.connection.paused;
        queue.setPaused(!isPaused);
        return await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle(`Música ${!!isPaused ? 'pausada' : 'despausada'}.`)
            .setDescription(!!isPaused ? 'Utilize o mesmo comando para despausar a música.' : 'Agora você pode voltar a ouvir sua música.')
        ]})
    }
}