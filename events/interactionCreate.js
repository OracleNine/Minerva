const { Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

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
			
		// check for modal submissions
		} else if (interaction.isModalSubmit()) {
			if (interaction.customId === 'amendmentModal') {
				console.log("Received a resolution.");
				await interaction.reply({ content: "Your submission has been added to the queue."});
			}		
		} else if (interaction.isStringSelectMenu()) {
			if (interaction.customId === "proposalSelect") {
				console.log(interaction.values[0]);
				// Build a modal based on the selection

				//If the selection was an amendment of an official document
				if (interaction.values[0] === "amd_admin" || interaction.values[0] === "amd_rp" || interaction.values[0] === "amd_format" || interaction.values[0] === "amd_community") {
                        const modal = new ModalBuilder()
							.setCustomId('amendmentModal')
							.setTitle('Amendment of an Official Document');

						const amendmentSummaryInput = new TextInputBuilder()
							.setCustomId('amendmentSummary')
							.setLabel("Summary")
							.setStyle(TextInputStyle.Paragraph);

						const amendmentDetailsInput = new TextInputBuilder()
							.setCustomId('amendmentDetails')
							.setLabel("Details")
							.setStyle(TextInputStyle.Paragraph);

						const amendmentFirstRow = new ActionRowBuilder().addComponents(amendmentSummaryInput);
						const amendmentSecondRow = new ActionRowBuilder().addComponents(amendmentDetailsInput);

						// Add inputs to the modal
						modal.addComponents(amendmentFirstRow, amendmentSecondRow);

						// Show the modal to the user
						await interaction.showModal(modal);

                    // Check if the proposal is an application of membership or peerage
                    } else if (interaction.values[0] === "app_member" || interaction.values[0] === "app_peer") {
                        // Now generate an appropriate modal

                    }
			}
		}
	},
};