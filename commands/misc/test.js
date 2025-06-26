const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('A test command for miscellaneous things.'),
	async execute(interaction) {
		if (interaction.member.id === "184011968946896896") {
            await interaction.reply("Successful");
        }
	},
};