"use strict";
const { Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const qman = require("../cogs/queue-manager.js");
const frm = require("../cogs/formatter.js");
const kindtostr = require("../cogs/kindtostr.js");
const { peerId, chairId, guildId, resChan } = require("../config.json");
const dayjs = require('dayjs');
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
            }
            catch (error) {
                console.error(error);
            }
            // check for modal submissions
        }
        else if (interaction.isModalSubmit()) {
            const peerResolutionClasses = ["amd_admin", "amd_rp", "amd_format", "amd_community", "app_member", "app_peer", "inj_rp", "inj_ip", "inj_member"];
            if (peerResolutionClasses.indexOf(interaction.customId) !== -1) {
                // Make sure the modal is one of the peer resolution classes
                const newProposal = {};
                newProposal.user = interaction.member.id;
                newProposal.submitted = dayjs().unix();
                newProposal.kind = interaction.customId;
                newProposal.active = false;
                newProposal.votemsg = "0";
                newProposal.startdate = "";
                newProposal.enddate = "";
                newProposal.eligiblevoters = [];
                if (peerResolutionClasses.indexOf(interaction.customId) >= 0 && peerResolutionClasses.indexOf(interaction.customId) <= 3) {
                    newProposal.subject = interaction.fields.getTextInputValue("amendmentTitle");
                    newProposal.summary = interaction.fields.getTextInputValue("amendmentSummary");
                    newProposal.details = interaction.fields.getTextInputValue("amendmentDetails1") + interaction.fields.getTextInputValue("amendmentDetails2");
                }
                else if (peerResolutionClasses.indexOf(interaction.customId) == 4 || peerResolutionClasses.indexOf(interaction.customId) == 5) {
                    newProposal.subject = interaction.fields.getTextInputValue("appSubject");
                }
                else if (peerResolutionClasses.indexOf(interaction.customId) >= 6 && peerResolutionClasses.indexOf(interaction.customId) <= 8) {
                    newProposal.subject = interaction.fields.getTextInputValue("injSubject");
                    newProposal.details = interaction.fields.getTextInputValue("injDesc");
                    newProposal.desire = interaction.fields.getTextInputValue("injOut");
                }
                let result = qman.addToQueue(newProposal);
                await interaction.reply({ content: result, flags: MessageFlags.Ephemeral });
            }
            // check for select menu interactions
        }
        else if (interaction.isStringSelectMenu()) {
            // if someone is choosing a proposal class, show the appropriate modal
            if (interaction.customId === "proposalSelect") {
                let modalTitle = kindtostr.kindToStr(interaction.values[0]); // Convert the kind of resolution into a string that we can use to set the title of the modal
                // If the user selected an amendment of an official document
                if (interaction.values[0] === "amd_admin" || interaction.values[0] === "amd_rp" || interaction.values[0] === "amd_format" || interaction.values[0] === "amd_community") {
                    const modal = new ModalBuilder()
                        .setCustomId(interaction.values[0])
                        .setTitle(modalTitle);
                    const amendmentTitle = new TextInputBuilder()
                        .setCustomId('amendmentTitle')
                        .setLabel("Subject")
                        .setPlaceholder("The title of the amendment.")
                        .setStyle(TextInputStyle.Short);
                    const amendmentSummaryInput = new TextInputBuilder()
                        .setCustomId('amendmentSummary')
                        .setLabel("Summary")
                        .setPlaceholder("A summary of the changes you would like to make.")
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(650);
                    const amendmentDetails1 = new TextInputBuilder()
                        .setCustomId('amendmentDetails1')
                        .setLabel("Details")
                        .setPlaceholder("Write a + in front of lines you want to add, and a - in front of lines you want to remove.")
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
                }
                else if (interaction.values[0] === "app_member" || interaction.values[0] === "app_peer") {
                    // Make sure this is the Chair, because they are the only one who can make these kinds of proposals
                    if (interaction.member.roles.cache.has(chairId)) {
                        // Now make the modal
                        const modal = new ModalBuilder()
                            .setCustomId(interaction.values[0])
                            .setTitle(modalTitle);
                        const applicationSubject = new TextInputBuilder()
                            .setCustomId("appSubject")
                            .setLabel("Subject")
                            .setPlaceholder("Username of the person you would like to promote.")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);
                        const appZeroRow = new ActionRowBuilder().addComponents(applicationSubject);
                        modal.addComponents(appZeroRow);
                        await interaction.showModal(modal);
                    }
                    else {
                        await interaction.reply({ content: "You are not the Chair!", flags: MessageFlags.Ephemeral });
                    }
                }
                else if (interaction.values[0] === "inj_ip" || interaction.values[0] === "inj_rp" || interaction.values[0] === "inj_member") {
                    // Now make the modal
                    const modal = new ModalBuilder()
                        .setCustomId(interaction.values[0])
                        .setTitle(modalTitle);
                    const injunctionSubject = new TextInputBuilder()
                        .setCustomId("injSubject")
                        .setLabel("Subject")
                        .setPlaceholder("Username of the person you would like to censure.")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    const injunctionDesc = new TextInputBuilder()
                        .setCustomId("injDesc")
                        .setLabel("Description of Incident")
                        .setPlaceholder("Give a detailed description of the offending behavior.")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);
                    const injunctionOutcome = new TextInputBuilder()
                        .setCustomId("injOut")
                        .setLabel("Preferential Outcome")
                        .setPlaceholder("How do you think the situation should be handled?")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);
                    const appZeroRow = new ActionRowBuilder().addComponents(injunctionSubject);
                    const appFirstRow = new ActionRowBuilder().addComponents(injunctionDesc);
                    const appSecondRow = new ActionRowBuilder().addComponents(injunctionOutcome);
                    modal.addComponents(appZeroRow, appFirstRow, appSecondRow);
                    await interaction.showModal(modal);
                }
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId === "vote_yes" || interaction.customId === "vote_no" || interaction.customId === "vote_abstain") {
                let activeResolution = qman.findActive();
                if (activeResolution.length === 0) {
                    await interaction.reply({ content: "That vote is no longer active.", flags: MessageFlags.Ephemeral });
                }
                else {
                    activeResolution = activeResolution[0];
                    let voteMsgId = activeResolution["votemsg"];
                    if (interaction.message.id !== voteMsgId) {
                        await interaction.reply({ content: "That vote is no longer active.", flags: MessageFlags.Ephemeral });
                    }
                    else {
                        let eligibleVoters = activeResolution["eligiblevoters"];
                        let thisPeer = eligibleVoters.filter((voter) => voter["id"] === interaction.member.id); // Make sure they are an eligible peer
                        if (thisPeer.length === 0) {
                            await interaction.reply({ content: "You are not eligible to vote on this resolution because you were not a Peer at the time it was created.", flags: MessageFlags.Ephemeral });
                        }
                        else {
                            // Update the Peer object in the eligible voters list
                            thisPeer = thisPeer[0];
                            let withoutThisPeer = eligibleVoters.filter((voter) => voter["id"] !== interaction.member.id);
                            let newVoterState = kindtostr.determineVoterState(interaction.customId);
                            thisPeer["voter_state"] = newVoterState;
                            withoutThisPeer.push(thisPeer);
                            // Update the queue with the new information and respond to the user
                            qman.changeProperty(activeResolution.user, "eligiblevoters", withoutThisPeer);
                            const getEmoji = kindtostr.determineVoterState(newVoterState);
                            await interaction.reply({ content: `You have voted ${getEmoji}.`, flags: MessageFlags.Ephemeral });
                            // We also need to update the tally message
                            let tallyMsgId = activeResolution["tallymsg"];
                            const dateFormatted = dayjs.unix(activeResolution["startdate"]).format("YYYY-MM-DD");
                            let newTallyMsg = frm.formatTally(withoutThisPeer, dateFormatted);
                            let tallyMsg = await interaction.channel.messages.fetch(tallyMsgId);
                            await tallyMsg.edit(newTallyMsg);
                        }
                    }
                }
            }
        }
    },
};
//# sourceMappingURL=interactionCreate.js.map