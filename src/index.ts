import "dotenv/config";
import { Client } from "discord.js";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user?.username}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
