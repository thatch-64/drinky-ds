import fs from "node:fs";
import path from "node:path";

import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID.");
}

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => /\.(js|ts)$/.test(file) && !file.endsWith(".d.ts"));

const commands: ReturnType<SlashCommandBuilder["toJSON"]>[] = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = require(filePath);
  const command = commandModule.default ?? commandModule;

  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log(`Deployed ${commands.length} guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(`Deployed ${commands.length} global commands.`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
