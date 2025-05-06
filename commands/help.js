const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x9146FF) // Couleur Twitch
      .setTitle('📚 Aide - NomadeBot')
      .setDescription('Voici la liste des commandes disponibles :')
      .addFields(
        { name: '/link <twitch_username>', value: 'Lie ton compte Discord à ton compte Twitch pour partager ton inventaire entre les plateformes.' },
        { name: '/inventory [utilisateur]', value: 'Affiche ton inventaire ou celui d\'un autre utilisateur.' },
        { name: '/help', value: 'Affiche cette liste de commandes.' },
        { 
          name: 'Inventaire Partagé', 
          value: 'Ton inventaire est synchronisé entre Twitch et Discord. Les objets que tu obtiens sur une plateforme sont disponibles sur l\'autre !'
        }
      )
      .setFooter({ text: 'Utilise /link pour commencer !' })
      .setTimestamp();
      
    return interaction.reply({ embeds: [embed] });
  },
};