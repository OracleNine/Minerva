const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
			}

		} else if (interaction.isModalSubmit()) {
			if (interaction.customId === 'resolutionModal') {
				console.log("Received a resolution.");
				await interaction.reply({ content: "Your submission has been added to the queue."});
			}		
		}
	},
};