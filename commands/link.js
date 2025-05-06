const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Lie ton compte Discord à ton compte Twitch')
    .addStringOption(option =>
      option.setName('twitch_username')
        .setDescription('Ton nom d\'utilisateur Twitch')
        .setRequired(true)),

  async execute(interaction, inventory) {
    const discordId = interaction.user.id;
    const twitchUsername = interaction.options.getString('twitch_username');
    
    // Vérifier si le compte Discord est déjà lié
    if (inventory.isDiscordAccountLinked(discordId)) {
      const twitchId = inventory.getTwitchIdFromDiscord(discordId);
      return interaction.reply({
        content: `Ton compte Discord est déjà lié à l'identifiant Twitch: ${twitchId}. Contacte un administrateur si tu souhaites modifier cette liaison.`,
        ephemeral: true
      });
    }

    // Pour une véritable implémentation, il faudrait vérifier que l'utilisateur possède bien le compte Twitch
    // Par exemple, faire dire un mot secret par le bot Twitch que l'utilisateur devrait répéter sur Discord
    // Ou utiliser l'API Twitch pour une authentification complète
    
    // Dans cette version simplifiée, nous utilisons le nom d'utilisateur comme ID
    // Une meilleure implémentation utiliserait l'ID réel de Twitch
    const twitchId = twitchUsername.toLowerCase();

    // Lier les comptes
    inventory.linkAccounts(twitchId, discordId);

    return interaction.reply({
      content: `✅ Ton compte Discord a été lié avec succès au compte Twitch: ${twitchUsername}.\nTon inventaire est maintenant synchronisé entre Twitch et Discord!`,
      ephemeral: true
    });
  },
};