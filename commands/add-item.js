const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-item')
    .setDescription('Ajoute un objet à l\'inventaire d\'un utilisateur (Admin uniquement)')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('L\'utilisateur à qui ajouter l\'objet')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('objet')
        .setDescription('L\'objet à ajouter à l\'inventaire')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Limité aux administrateurs

  async execute(interaction, inventory) {
    const targetUser = interaction.options.getUser('utilisateur');
    const item = interaction.options.getString('objet');
    
    // Vérifier si l'utilisateur cible a lié son compte
    const discordId = targetUser.id;
    
    if (!inventory.isDiscordAccountLinked(discordId)) {
      return interaction.reply({
        content: `⚠️ ${targetUser.username} n'a pas encore lié son compte Discord avec Twitch. Impossible d'ajouter l'objet à son inventaire.`,
        ephemeral: true
      });
    }
    
    // Ajouter l'objet à l'inventaire
    inventory.addItemToInventory(discordId, item, 'discord');
    
    // Obtenir l'ID Twitch lié pour le message
    const twitchId = inventory.getTwitchIdFromDiscord(discordId);
    
    return interaction.reply({
      content: `✅ Objet \`${item}\` ajouté à l'inventaire de ${targetUser.username} (Twitch: ${twitchId}).`,
      ephemeral: true
    });
  },
};