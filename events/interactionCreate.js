const { Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const qman = require("../cogs/queue-manager.js");
const kindtostr = require("../cogs/kindtostr.js")
const { peerId, chairId } = require("../config.json");
const dayjs = require('dayjs')

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
			if (interaction.customId === 'amd_admin' || interaction.customId === "amd_rp" || interaction.customId === "amd_format" || interaction.customId === "amd_community") {

				const propAsObj = {};

				propAsObj.user  = interaction.member.id;
				propAsObj.date = dayjs();
				propAsObj.subject = interaction.fields.getTextInputValue("amendmentTitle");
				propAsObj.summary = interaction.fields.getTextInputValue("amendmentSummary");
				propAsObj.details = interaction.fields.getTextInputValue("amendmentDetails1") + interaction.fields.getTextInputValue("amendmentDetails2");
				propAsObj.kind = interaction.customId;

				let result = qman.addToQueue(propAsObj);

				await interaction.reply({ content: result, flags: MessageFlags.Ephemeral});
			} else if (interaction.customId === "app_member" || interaction.customId === "app_peer") {
				
				// Initialize the proposal as an object
				const propAsObj = {};

				propAsObj.user = interaction.member.id;
				propAsObj.date = dayjs();
				propAsObj.subject = interaction.fields.getTextInputValue("appSubject");
				propAsObj.kind = interaction.customId;

				let result = qman.addToQueue(propAsObj);

				await interaction.reply({ content: result, flags: MessageFlags.Ephemeral });
			}		
		// check for select menu interactions
		} else if (interaction.isStringSelectMenu()) {
			// if someone is choosing a proposal class, show the appropriate modal
			if (interaction.customId === "proposalSelect") {
				
				// First we need to make sure this user has not already submitted a proposal.

				let qAsObj = qman.fetchQueue();
				let qItems = qAsObj["queue"];
				const result = qItems.filter((proposal) => proposal["user"] == element.user);
				
				if (result.length === 0 && interaction.member.roles.cache.has(peerId)) {

					// If the user selected an amendment of an official document
					if (interaction.values[0] === "amd_admin" || interaction.values[0] === "amd_rp" || interaction.values[0] === "amd_format" || interaction.values[0] === "amd_community") {
						let dynTitle = kindtostr.kindToStr(interaction.values[0]);
						
                        const modal = new ModalBuilder()
							.setCustomId(interaction.values[0])
							.setTitle(dynTitle);

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

						// Make sure this is the Chair, because they are the only one who can make these kinds of proposals
						if (interaction.member.roles.cache.has(chairId)) {
							let dynTitle = "";
							// Adjust the title of the modal depending on the option selected. There is probably a better way to do this but idk
							if (interaction.values[0] === "app_member") { dynTitle = "Application for Membership"; }
							if (interaction.values[0] === "app_peer") { dynTitle = "Application for Peerage"; }

							// Now make the modal
							const modal = new ModalBuilder()
								.setCustomId(interaction.values[0])
								.setTitle(dynTitle);

							const applicationSubject = new TextInputBuilder()
								.setCustomId("appSubject")
								.setLabel("Subject")
								.setPlaceholder("Username of the person you would like to promote.")
								.setStyle(TextInputStyle.Short)
								.setRequired(true)
							
							const appZeroRow = new ActionRowBuilder().addComponents(applicationSubject);
							
							modal.addComponents(appZeroRow);

							await interaction.showModal(modal);
						} else {
							await interaction.reply("You are not the Chair!");
						}
                    }
				} else {
					await interaction.reply({ content: "You have already submitted a proposal. Remove it with `/remove`, then do `/propose` again.", flags: MessageFlags.Ephemeral })
				}
			}
		}
	},
};