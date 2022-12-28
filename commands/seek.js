const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Define a posição da música atual.')
        .addStringOption(op => op
            .setRequired(true)
            .setName('pos')
            .setDescription('Posição da nova posição da faixa. (HH:MM:SS)')
        ),

    async execute(interaction) {
        const { client } = interaction;
        const embed = new EmbedBuilder();
        const queue = client.player.getQueue(interaction.guildId);
        const requestedDuration = interaction.options.data[0].value.trim();
        const requestedDurationColons = [...requestedDuration.matchAll(/:/g)].length;
		const durationInArray = requestedDuration.split(":");
        const areEntriesValid = durationInArray.filter(d => !isNaN(d)).length === durationInArray.length;
		const hasDurationHours = durationInArray.length === 2;
		let newPositionInMS, description;

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

        if (requestedDurationColons !== 1 || requestedDurationColons !== 2)
            return await interaction.reply({embeds: [embed
                .setColor('Red')
                .setTitle('Formatação inválida.')
                .setDescription('Verifique se você está utilizando o formato certo: **MM:SS** ou **HH:MM:SS** em vídeos com mais de 1 hora.')
            ]})

		if (!areEntriesValid) {
			const invalidEntries = durationInArray.filter(d => isNaN(d));
			const values = invalidEntries.map((e, i) => 
				!(i === invalidEntries.length-1 && i !== 0) ? ` **${e}**${invalidEntries.length >= 2 ? ',' : ''}` : ` e **${e}**`
			).join();

			return await interaction.reply({embeds: [embed
				.setColor('Red')
				.setTitle('Valores inválidos.')
				.setDescription(`Os valores${values} precisam ser números.`)
			]})
		}

        const currentSongDuration = queue.current.duration;
		const currentSongDurationArray = currentSongDuration.split(':');

		if (!hasDurationHours) {
			const [minutes, seconds] = durationInArray.map(e => Number(e));
			const oldHours = currentSongDurationArray[0];
			const oldMinutes = oldHours ? +currentSongDurationArray[1] : +currentSongDurationArray[0];
			const oldSeconds = oldHours ? +currentSongDurationArray[2] : +currentSongDurationArray[1];
			const minutesInSeconds = minutes * 60;
			const oldMinutesInSeconds = oldMinutes * 60;
			const oldPositionInMS = (oldHours ? ((oldHours*3600) + oldMinutesInSeconds + oldSeconds) : (oldMinutesInSeconds + oldSeconds))*1000;
			newPositionInMS = (minutesInSeconds + seconds)*1000;

			if (minutes > 59 || seconds > 59 || seconds < 0 || minutes < 0)
				return await interaction.reply({embeds: [embed
					.setColor('Red')
					.setTitle('Tempo inválido!')
					.setDescription('Os minutos e segundos precisam ser menores do que 60 e maiores que 0.')
				]})
			
			if (newPositionInMS >= oldPositionInMS)
				return await interaction.reply({embeds: [embed
					.setColor('Red')
					.setTitle('Nova posição inválida.')
					.setDescription('A nova posição não pode ser maior que a duração da música atual.')
				]})

			description = `Posição da música alterada para \`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}\`.`
		} else {
			const [hours, minutes, seconds] = durationInArray.map(e => Number(e));
			const [oldHours, oldMinutes, oldSeconds] = currentSongDurationArray.map(e => Number(e));
			const hoursInSeconds = hours * 3600;
			const minutesInSeconds = minutes * 60;
			const oldHoursInSeconds = oldHours * 3600;
			const oldMinutesInSeconds = oldMinutes * 60;
			const oldPositionInMS = (oldHoursInSeconds + oldMinutesInSeconds + oldSeconds)*1000;
			newPositionInMS = (hoursInSeconds + minutesInSeconds + seconds)*1000;

			if (minutes > 59 || seconds > 59 || seconds < 0 || minutes < 0 || hours < 0)
				return await interaction.reply({embeds: [embed
					.setColor('Red')
					.setTitle('Tempo inválido!')
					.setDescription('Os minutos e segundos precisam ser menores do que 60 e maiores que 0. \n Como você usou o modelo de horas, a hora também precisa ser maior do que 0.')
				]})

			if (newPositionInMS >= oldPositionInMS)
				return await interaction.reply({embeds: [embed
					.setColor('Red')
					.setTitle('Nova posição inválida.')
					.setDescription('A nova posição não pode ser maior que a duração da música atual.')
				]})

			description = `Posição da música alterada para \`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}\`.`
		}

		await queue.seek(newPositionInMS);
		await interaction.reply({embeds: [embed
			.setColor('Green')
			.setTitle('Nova posição definida.') 
			.setDescription(description)
		]});
    }
}