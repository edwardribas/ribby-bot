const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Comandos de fila de reprodução.')
        .addNumberOption(option => option
            .setName('page')
            .setDescription('Número da página da playlist')
            .setMinValue(1)
        ),
    async execute(interaction){
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const queue = client.player.getQueue(interaction.guildId);
        const option = (interaction.options.data[0] && interaction.options.data[0].value) || 1;
        
        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setTitle('Você não está tocando nada!')
                .setDescription('Utilize o comando **/play** para adicionar alguma música à playlist.')
                .setColor('Red')
        ]})

        const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
        const page = (option || 1) - 1;
        const currentSong = queue.current

        if (page > totalPages) 
            return await interaction.reply({embeds: [embed
                .setTitle('Página inválida.')
                .setDescription(`Há somente ${totalPages} ${totalPages > 1 ? 'páginas disponíveis' : 'página disponível'}`)
                .setColor('Red')
            ]})
        
        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
        }).join("\n");

        await interaction.reply({embeds: [embed
            .setTitle(`Lista de reprodução (${queue.tracks.length+1} ${queue.tracks.length <= 2 ? 'faixa' : 'faixas' })`)
            .setDescription(`
                **Atualmente tocando** \n
                \`${currentSong.duration}\` ${currentSong.title} -- <@${currentSong.requestedBy.id}> \n
                **Próximos na fila** \n
                ${queueString}
            `)
            .setFooter({text: `Página ${page + 1} de ${totalPages}`})
            .setThumbnail(currentSong.setThumbnail)
        ]})
    }
}