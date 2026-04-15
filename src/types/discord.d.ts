import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void> | void;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
