const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const qman = require("../../cogs/queue-manager");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('seequeue')
		.setDescription('Look at the Peer Resolution queue, and pending proposals.'),
	async execute(interaction) {
        let result = qman.seeQueue();
		let propList = Object.entries(result);
		for (let i = 0; i < propList.length; i++) {
			console.log(propList[i][1]["user"]);
		}
		await interaction.reply({ content: "This is a placeholder msg.", flags: MessageFlags.Ephemeral });
	},
};