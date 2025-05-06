const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Affiche ton inventaire ou celui d\'un autre utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('L\'utilisateur dont tu veux voir l\'inventaire')
        .setRequired(false)),

  async execute(interaction, inventory) {
    // Déterminer l'utilisateur cible
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    const discordId = targetUser.id;
    
    // Récupérer l'inventaire de l'utilisateur
    const userInventory = inventory.getUserInventory(discordId, 'discord');
    
    // Vérifier si le compte est lié
    const isLinked = inventory.isDiscordAccountLinked(discordId);
    const twitchId = inventory.getTwitchIdFromDiscord(discordId);
    
    // Créer l'embed pour afficher l'inventaire
    const embed = new EmbedBuilder()
      .setColor(0x9146FF) // Couleur Twitch
      .setTitle(`📦 Inventaire de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp();
    
    if (!isLinked) {
      embed.setDescription(`${targetUser.username} n'a pas lié son compte Discord à Twitch.\nUtilise la commande \`/link\` pour lier ton compte.`);
    } else {
      embed.setDescription(`Compte lié avec Twitch: **${twitchId}**`);
      
      if (userInventory.length === 0) {
        embed.addFields({ name: 'Inventaire vide', value: 'Cet utilisateur n\'a aucun objet dans son inventaire.' });
      } else {
        // Afficher les objets de l'inventaire (limité à 25 pour respecter les limites de Discord)
        const itemsList = userInventory.slice(0, 25).map((item, index) => `${index + 1}. ${item}`).join('\n');
        embed.addFields({ name: `Objets (${userInventory.length})`, value: itemsList });
        
        if (userInventory.length > 25) {
          embed.setFooter({ text: `Et ${userInventory.length - 25} autres objets...` });
        }
      }
    }
    
    return interaction.reply({ embeds: [embed] });
  },
};