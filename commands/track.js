const { SlashCommandBuilder, EmbedBuilder, } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Exibe posição atual da música'),

    async execute(interaction) {
        const { client } = interaction;
        const queue = client.player.getQueue(interaction.guildId);
        const embed = new EmbedBuilder();
        const trackPosition = queue.createProgressBar()
        const currentSong = queue && queue.current;

        if (!queue || !queue.playing)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Nenhuma música está sendo reproduzida.')
                .setDescription('Você pode utilizar o comando **/play** para adicionar uma música ou playlist à fila de reprodução.')
            ]})

        if (queue.playing && (interaction.member.voice.channel.id !== queue.connection.channel.id))
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Não foi possível continuar.')
                .setDescription(`Você precisa estar no mesmo canal de voz que o bot (${queue.connection.channel}) para utilizar este comando.`)
            ]})
        

        await interaction.reply({embeds: [embed
            .setColor('Green')
            .setTitle(`${currentSong.title}`)
            .setURL(currentSong.url)
            .setDescription(`${trackPosition} \n\n Utilize **/seek HH:MM:SS** para mudar a posição da música.`)
            .setThumbnail(currentSong.thumbnail)
        ]})
    }
}