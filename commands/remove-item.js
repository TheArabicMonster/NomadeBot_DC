const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-item')
    .setDescription('Supprime un objet de l\'inventaire d\'un utilisateur (Admin uniquement)')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('L\'utilisateur de qui supprimer l\'objet')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('index')
        .setDescription('L\'index de l\'objet à supprimer (commence à 1)')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Limité aux administrateurs

  async execute(interaction, inventory) {
    const targetUser = interaction.options.getUser('utilisateur');
    const itemIndex = interaction.options.getInteger('index') - 1; // Convertir en index base 0
    
    // Vérifier si l'utilisateur cible a lié son compte
    const discordId = targetUser.id;
    
    if (!inventory.isDiscordAccountLinked(discordId)) {
      return interaction.reply({
        content: `⚠️ ${targetUser.username} n'a pas encore lié son compte Discord avec Twitch. Impossible de supprimer l'objet de son inventaire.`,
        ephemeral: true
      });
    }
    
    // Récupérer l'inventaire actuel pour vérifier
    const userInventory = inventory.getUserInventory(discordId, 'discord');
    
    if (itemIndex < 0 || itemIndex >= userInventory.length) {
      return interaction.reply({
        content: `⚠️ Index invalide. L'inventaire de ${targetUser.username} contient ${userInventory.length} objet(s) (indices de 1 à ${userInventory.length}).`,
        ephemeral: true
      });
    }
    
    // Supprimer l'objet de l'inventaire
    const removedItem = inventory.removeItemFromInventory(discordId, itemIndex, 'discord');
    
    // Obtenir l'ID Twitch lié pour le message
    const twitchId = inventory.getTwitchIdFromDiscord(discordId);
    
    return interaction.reply({
      content: `✅ Objet \`${removedItem}\` supprimé de l'inventaire de ${targetUser.username} (Twitch: ${twitchId}).`,
      ephemeral: true
    });
  },
};