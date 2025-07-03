import { SlashCommandBuilder, MessageFlags, ChatInputCommandInteraction } from 'discord.js';
import * as qman from "../../cogs/queue-manager.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("spook")
		.setDescription("A command for testing"),
	async execute(interaction: ChatInputCommandInteraction<undefined|"raw"|"cached">) {
		if (interaction.user.id !== "184011968946896896") {
			await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral});
		} else {
			const youngest = qman.findNextProposal();
			console.log(youngest)
			await interaction.reply({ content: "Spook!", flags: MessageFlags.Ephemeral });
		}
	}
}