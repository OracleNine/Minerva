const { Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const qman = require("../cogs/queue-manager.js");

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
			// if the modal submission corresponds to an amendment, get those values
			if (interaction.customId === 'amendmentModal') {

				const amendInTitle = interaction.fields.getTextInputValue("amendmentTitle");
				const amendInSum = interaction.fields.getTextInputValue("amendmentSummary");
				const amendInDets = interaction.fields.getTextInputValue("amendmentDetails1") + interaction.fields.getTextInputValue("amendmentDetails2");
				const amendUser = interaction.member.id;
				const amendThreshold = 0.67;

				let result = qman.addToQueue(amendUser, amendThreshold, amendInTitle, amendInSum, amendInDets);

				await interaction.reply({ content: result, flags: MessageFlags.Ephemeral});
			}		
		// check for select menu interactions
		} else if (interaction.isStringSelectMenu()) {
			// if someone is choosing a proposal class, show the appropriate modal
			if (interaction.customId === "proposalSelect") {
				console.log(interaction.values[0]);
				// Build a modal based on the selection

				//If the selection was an amendment of an official document
				if (interaction.values[0] === "amd_admin" || interaction.values[0] === "amd_rp" || interaction.values[0] === "amd_format" || interaction.values[0] === "amd_community") {
                        const modal = new ModalBuilder()
							.setCustomId('amendmentModal')
							.setTitle('Amendment of an Official Document');

						const amendmentTitle = new TextInputBuilder()
							.setCustomId('amendmentTitle')
							.setLabel("Subject")
							.setPlaceholder("The title of the amendment.")
							.setStyle(TextInputStyle.Short);

						const amendmentSummaryInput = new TextInputBuilder()
							.setCustomId('amendmentSummary')
							.setLabel("Summary")
							.setPlaceholder("A summary of the changes you would like to make.")
							.setStyle(TextInputStyle.Paragraph);

						const amendmentDetails1 = new TextInputBuilder()
							.setCustomId('amendmentDetails1')
							.setLabel("Details")
							.setPlaceholder("The exact changes to the text.")
							.setStyle(TextInputStyle.Paragraph);
						
						const amendmentDetails2 = new TextInputBuilder()
							.setCustomId('amendmentDetails2')
							.setLabel("Details (cont.)")
							.setPlaceholder("Use this in case you hit the character limit on the box above. Leave this space blank if not needed.")
							.setStyle(TextInputStyle.Paragraph)
							.setRequired(false);
						
						const amendZeroRow = new ActionRowBuilder().addComponents(amendmentTitle);
						const amendFirstRow = new ActionRowBuilder().addComponents(amendmentSummaryInput);
						const amendSecondRow = new ActionRowBuilder().addComponents(amendmentDetails1);
						const amendThirdRow = new ActionRowBuilder().addComponents(amendmentDetails2);

						// Add inputs to the modal
						modal.addComponents(amendZeroRow, amendFirstRow, amendSecondRow, amendThirdRow);

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