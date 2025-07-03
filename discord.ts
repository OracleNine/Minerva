import { Collection, SlashCommandBuilder } from "discord.js"

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
    export interface Command {
        data: SlashCommandBuilder,
        execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    }
}