const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Mover música de posição')
        .addNumberOption(op => op
            .setName('pos_old')
            .setDescription('Posição atual da música')
            .setMinValue(1)    
            .setRequired(true)
        )
        .addNumberOption(op => op
            .setName('pos_new')
            .setDescription('Nova posição da música')
            .setMinValue(1)    
            .setRequired(true)
        ),

    async execute(interaction) {
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const queue = client.player.getQueue(interaction.guildId);
        const oldPos = interaction.options.data[0].value;
        const newPos = interaction.options.data[1].value;
        
        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível mover!')
                .setDescription('Não há nenhuma música sendo reproduzida.')
            ]});

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
         
        if (oldPos-1 > queue.tracks.length)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível mover a faixa.')
                .setDescription('A posição antiga da faixa não pode ser maior que o número de faixas atual.')
            ]})

        if (newPos-1 >= queue.tracks.length)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível mover a faixa.')
                .setDescription('A nova posição da faixa não pode ser maior ou igual que o número de faixas atual.')
            ]})

        if (queue.tracks[oldPos-1]) {
            queue.insert(queue.tracks[oldPos-1], newPos-1)
            await interaction.reply({embeds: [embed
                .setColor('Green')
                .setTitle('Faixa movida com sucesso!')
                .setDescription(`Movida da posição **#${oldPos}** para **#${newPos}**`)
            ]})
        }
    }
}