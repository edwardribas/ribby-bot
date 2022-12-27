const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa a fila de reprodução atual.'),

    async execute(interaction){
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const queue = client.player.getQueue(interaction.guildId);
        
        if (!queue)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Playlist vazia.')
                .setDescription('A fila de reprodução já está vazia.')
            ]})  
        
        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
        
        queue.destroy();
        return await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle('Playlist esvaziada.')
            .setDescription('Você esvaziou a lista de reprodução com sucesso')
        ]})
    }
}