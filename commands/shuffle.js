const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Randomiza a lista de reprodução atual.'),

    async execute(interaction) {
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const queue = client.player.getQueue(interaction.guildId);
        
        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível randomizar!')
                .setDescription('Não há nenhuma música sendo reproduzida.')
            ]});

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
            
        if (queue.tracks.length < 3)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`É necessário ter pelo menos 3 faixas para randomizar a playlist.`)
            ]})
            
        queue.shuffle();
            
        await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle('Playlist randomizada!')
            .setDescription(`**${queue.tracks.length}** faixas foram aleatorizadas.`)
        ]})
    }
}