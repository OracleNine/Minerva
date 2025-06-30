const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName("spook")
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		await interaction.reply({content: "Spook!"});
	}
}