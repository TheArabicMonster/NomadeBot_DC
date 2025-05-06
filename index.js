/**
 * Bot Discord NomadeBot - Partageant l'inventaire avec le bot Twitch
 */
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Import du module d'inventaire partagé
const sharedPath = process.env.SHARED_PATH || '../NomadeBot_SHARED';
const inventory = require(`${sharedPath}/data/inventory`);

// Création du client Discord avec les permissions nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Collection pour stocker les commandes
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Vérification de l'existence du dossier commands, création sinon
if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath);
  console.log('📁 Dossier commands/ créé');
}

// Chargement des commandes
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  // Vérification que la commande a un nom et une fonction execute
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Commande chargée: ${command.data.name}`);
  } else {
    console.warn(`❌ La commande ${file} manque de propriétés requises.`);
  }
}

// Fonction pour enregistrer les commandes slash dans Discord
async function registerCommands() {
  try {
    console.log('Début de l\'enregistrement des commandes slash...');
    
    const commands = [];
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    // Collecte des données des commandes
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if ('data' in command) {
        commands.push(command.data.toJSON());
      }
    }
    
    // Configuration du REST API
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    // Enregistrement des commandes globalement
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    
    console.log(`✅ ${commands.length} commandes slash enregistrées avec succès.`);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des commandes slash:', error);
  }
}

// Événement: Client prêt
client.once(Events.ClientReady, readyClient => {
  console.log(`✅ Bot Discord connecté en tant que ${readyClient.user.tag}`);
  
  // Enregistrement des commandes slash
  registerCommands();
  
  // Configuration de la sauvegarde automatique de l'inventaire partagé
  inventory.setupAutoSave(300000); // 5 minutes
});

// Événement: Interaction (pour les commandes slash)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) return;
  
  try {
    await command.execute(interaction, inventory);
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
    
    const replyOptions = {
      content: 'Une erreur est survenue lors de l\'exécution de cette commande.',
      ephemeral: true
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
});

// Connexion à Discord
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Tentative de connexion à Discord...'))
  .catch(error => {
    console.error('Erreur lors de la connexion à Discord:', error);
    process.exit(1);
  });

// Gestion des erreurs non capturées
process.on('uncaughtException', error => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', error => {
  console.error('Promesse rejetée non gérée:', error);
});