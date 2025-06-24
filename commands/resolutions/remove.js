const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const qman = require("../../cogs/queue-manager");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove your proposal from the queue.'),
	async execute(interaction) {
        let result = qman.removeFrmQueue(interaction.member.id);
		await interaction.reply({ content: "Your proposals, if you submitted any, have been removed from the queue.", flags: MessageFlags.Ephemeral });
	},
};