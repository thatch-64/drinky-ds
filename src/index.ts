import fs from "node:fs";
import path from "node:path";

import "dotenv/config";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import type { Command } from "./types/discord";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, Command>();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => /\.(js|ts)$/.test(file) && !file.endsWith(".d.ts"));

for (const file of commandFiles) {

  const filePath = path.join(commandsPath, file);
  const commandModule = require(filePath);
  const command: Command = commandModule.default ?? commandModule;

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }

}

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.username}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {

    console.error(error);

    if (interaction.replied || interaction.deferred) {

      await interaction.followUp({
        content: "There was an error while executing this command.",
        flags: MessageFlags.Ephemeral,
      });

    } else {

      await interaction.reply({
        content: "There was an error while executing this command.",
        flags: MessageFlags.Ephemeral,
      });

    }
    
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
