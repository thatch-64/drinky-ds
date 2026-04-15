import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency."),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const reply = await interaction.fetchReply();
    const roundtripLatency = reply.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `Pong!\nRoundtrip latency: ${roundtripLatency}ms\nWebSocket latency: ${apiLatency}ms`,
    );
  },
};