const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gituser')
        .setDescription('Recebe informações da conta de um usuário do Github.')
        .addStringOption(option => option
            .setName('usuário')
            .setDescription('Nome do usuário que você quer pesquisar')
            .setRequired(true)
        ),

    async execute(interaction) {
        const arguments = interaction.options.data;
        const [{value: userArgument}] = arguments;

        try {
            const response = await fetch(`https://api.github.com/users/${userArgument}`);
            const data = await response.json();

            const {
                html_url: link,
                followers,
                following,
                created_at,
                login: user,
                public_repos: repos,
                avatar_url,
            } = data;

            const creation = new Date(created_at).toLocaleDateString('pt-br');
            const embed = new EmbedBuilder();
            embed.setDescription('Essas são as informações que eu encontrei deste usuário:');
            embed.setTitle(`Informações sobre ${user}`)
            embed.setImage(avatar_url);
            embed.setFields([
                {name: 'Repositórios públicos', value: String(repos)},
                {name: 'Criação da conta', value: creation},
                {name: 'Seguidores', value: String(followers)},
                {name: 'Seguindo', value: String(following)},
            ]);
            embed.setURL(link)
            embed.setColor('Orange');
            
            embed.setFooter({
                text: `Enviado a pedido de ${interaction.user.username}`,
                iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
            })
            await interaction.reply({embeds: [embed]});
        } catch (err) {
            console.error(`Não foi possível prosseguir na execução do código. Erro: ${err}`);
            const embed = new EmbedBuilder();
            embed.setColor('Red');
            embed.setTitle('Ocorreu um erro!');
            embed.setDescription('Não foi possível concluir a sua solicitação.' + ` (${err})`);
            await interaction.reply({embeds: [embed]});
        }

        
    }
    
}