import { SlashCommandBuilder, MessageFlags, ChatInputCommandInteraction, Command } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName("spook")
		.setDescription("A command for testing"),
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.user.id !== "184011968946896896") {
			await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral});
		} else {
			await interaction.reply({ content: "Spook!", flags: MessageFlags.Ephemeral });
		}
	}
};