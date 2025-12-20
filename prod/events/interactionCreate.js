"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const qman = __importStar(require("../cogs/queue-manager.js"));
const frm = __importStar(require("../cogs/formatter.js"));
const kts = __importStar(require("../cogs/kindtostr.js"));
const config_json_1 = require("../config.json");
const structures_js_1 = require("../structures.js");
const dayjs_1 = __importDefault(require("dayjs"));
exports.default = {
    name: discord_js_1.Events.InteractionCreate,
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
            if (config_json_1.peerResolutionClasses.indexOf(interaction.customId) !== -1) {
                // Make sure the modal is one of the peer resolution classes
                if (!(interaction.member instanceof discord_js_1.GuildMember) || !(interaction.member.roles.cache.has(config_json_1.peerId))) {
                    await interaction.reply("Submission failed.");
                }
                else {
                    const newProposal = new structures_js_1.ProposalObject();
                    newProposal.user = interaction.member.id;
                    newProposal.submitted = (0, dayjs_1.default)().unix();
                    newProposal.kind = interaction.customId;
                    newProposal.active = false;
                    newProposal.votemsg = "0";
                    newProposal.startdate = 0;
                    newProposal.enddate = 0;
                    let newEligibleVotersArray = [];
                    newProposal.eligiblevoters = newEligibleVotersArray;
                    if (config_json_1.peerResolutionClasses.indexOf(interaction.customId) == 0) {
                        newProposal.subject = interaction.fields.getTextInputValue("amendmentTitle");
                        newProposal.summary = interaction.fields.getTextInputValue("amendmentSummary");
                        newProposal.details = interaction.fields.getTextInputValue("amendmentDetails1") + interaction.fields.getTextInputValue("amendmentDetails2");
                    }
                    else if (config_json_1.peerResolutionClasses.indexOf(interaction.customId) == 1 || config_json_1.peerResolutionClasses.indexOf(interaction.customId) == 2) {
                        newProposal.subject = interaction.fields.getTextInputValue("appSubject");
                    }
                    else if (config_json_1.peerResolutionClasses.indexOf(interaction.customId) >= 3 && config_json_1.peerResolutionClasses.indexOf(interaction.customId) <= 5) {
                        newProposal.subject = interaction.fields.getTextInputValue("injSubject");
                        newProposal.details = interaction.fields.getTextInputValue("injDesc") + interaction.fields.getTextInputValue("injDesc2");
                        newProposal.desire = interaction.fields.getTextInputValue("injOut");
                    }
                    else if (config_json_1.peerResolutionClasses.indexOf(interaction.customId) == 6) {
                        newProposal.subject = interaction.fields.getTextInputValue("decisionTitle");
                        newProposal.summary = interaction.fields.getTextInputValue("decisionSummary");
                        newProposal.desire = interaction.fields.getTextInputValue("decisionDetails1") + interaction.fields.getTextInputValue("decisionDetails2");
                    }
                    let result = qman.addToQueue(newProposal);
                    await interaction.reply({ content: result, flags: discord_js_1.MessageFlags.Ephemeral });
                }
            }
            // check for select menu interactions
        }
        else if (interaction.isStringSelectMenu()) {
            // if someone is choosing a proposal class, show the appropriate modal
            if (interaction.customId === "proposalSelect") {
                let modalTitle = kts.kindToStr(interaction.values[0]); // Convert the kind of resolution into a string that we can use to set the title of the modal
                if (modalTitle == undefined) {
                    await interaction.reply({ content: "There was an issue creating the modal, contact Oracle ASAP.", flags: discord_js_1.MessageFlags.Ephemeral });
                }
                else if (config_json_1.peerResolutionClasses.indexOf(interaction.values[0]) == 0) {
                    const modal = new discord_js_1.ModalBuilder()
                        .setCustomId(interaction.values[0])
                        .setTitle(modalTitle);
                    const amendmentTitle = new discord_js_1.TextInputBuilder()
                        .setCustomId('amendmentTitle')
                        .setLabel("Subject")
                        .setPlaceholder("The title of the amendment.")
                        .setStyle(discord_js_1.TextInputStyle.Short);
                    const amendmentSummaryInput = new discord_js_1.TextInputBuilder()
                        .setCustomId('amendmentSummary')
                        .setLabel("Summary")
                        .setPlaceholder("A summary of the changes you would like to make.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setMaxLength(650);
                    const amendmentDetails1 = new discord_js_1.TextInputBuilder()
                        .setCustomId('amendmentDetails1')
                        .setLabel("Details")
                        .setPlaceholder("Write a + in front of lines you want to add, and a - in front of lines you want to remove.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph);
                    const amendmentDetails2 = new discord_js_1.TextInputBuilder()
                        .setCustomId('amendmentDetails2')
                        .setLabel("Details (cont.)")
                        .setPlaceholder("Use this in case you hit the character limit on the box above. Leave this space blank if not needed.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(false);
                    const amendZeroRow = new discord_js_1.ActionRowBuilder().addComponents(amendmentTitle);
                    const amendFirstRow = new discord_js_1.ActionRowBuilder().addComponents(amendmentSummaryInput);
                    const amendSecondRow = new discord_js_1.ActionRowBuilder().addComponents(amendmentDetails1);
                    const amendThirdRow = new discord_js_1.ActionRowBuilder().addComponents(amendmentDetails2);
                    // Add inputs to the modal
                    modal.addComponents(amendZeroRow, amendFirstRow, amendSecondRow, amendThirdRow);
                    // Show the modal to the user
                    await interaction.showModal(modal);
                    // Check if the proposal is an application of membership or peerage
                }
                else if (config_json_1.peerResolutionClasses.indexOf(interaction.values[0]) == 1 || config_json_1.peerResolutionClasses.indexOf(interaction.values[0]) == 2) {
                    // Make sure this is the Chair, because they are the only one who can make these kinds of proposals
                    if (interaction.member instanceof discord_js_1.GuildMember && interaction.member.roles.cache.has(config_json_1.chairId)) {
                        // Now make the modal
                        const modal = new discord_js_1.ModalBuilder()
                            .setCustomId(interaction.values[0])
                            .setTitle(modalTitle);
                        const applicationSubject = new discord_js_1.TextInputBuilder()
                            .setCustomId("appSubject")
                            .setLabel("Subject")
                            .setPlaceholder("Username of the person you would like to promote.")
                            .setStyle(discord_js_1.TextInputStyle.Short)
                            .setRequired(true);
                        const appZeroRow = new discord_js_1.ActionRowBuilder().addComponents(applicationSubject);
                        modal.addComponents(appZeroRow);
                        await interaction.showModal(modal);
                    }
                    else {
                        await interaction.reply({ content: "You are not the Chair!", flags: discord_js_1.MessageFlags.Ephemeral });
                    }
                }
                else if (config_json_1.peerResolutionClasses.indexOf(interaction.values[0]) >= 3 && config_json_1.peerResolutionClasses.indexOf(interaction.values[0]) <= 5) {
                    // Now make the modal
                    const modal = new discord_js_1.ModalBuilder()
                        .setCustomId(interaction.values[0])
                        .setTitle(modalTitle);
                    const injunctionSubject = new discord_js_1.TextInputBuilder()
                        .setCustomId("injSubject")
                        .setLabel("Subject")
                        .setPlaceholder("Username of the person you would like to censure.")
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setRequired(true);
                    const injunctionDesc = new discord_js_1.TextInputBuilder()
                        .setCustomId("injDesc")
                        .setLabel("Description of Incident")
                        .setPlaceholder("Give a detailed description of the offending behavior.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(true);
                    const injunctionDesc2 = new discord_js_1.TextInputBuilder()
                        .setCustomId("injDesc2")
                        .setLabel("Description of Incident")
                        .setPlaceholder("Description of Incident (cont.) Leave blank if not needed.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(false);
                    const injunctionOutcome = new discord_js_1.TextInputBuilder()
                        .setCustomId("injOut")
                        .setLabel("Preferential Outcome")
                        .setPlaceholder("How do you think the situation should be handled?")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(true);
                    const appZeroRow = new discord_js_1.ActionRowBuilder().addComponents(injunctionSubject);
                    const appFirstRow = new discord_js_1.ActionRowBuilder().addComponents(injunctionDesc);
                    const appSecondRow = new discord_js_1.ActionRowBuilder().addComponents(injunctionDesc2);
                    const appThirdRow = new discord_js_1.ActionRowBuilder().addComponents(injunctionOutcome);
                    modal.addComponents(appZeroRow, appFirstRow, appSecondRow, appThirdRow);
                    await interaction.showModal(modal);
                }
                else if (config_json_1.peerResolutionClasses.indexOf(interaction.values[0]) == 6) {
                    const modal = new discord_js_1.ModalBuilder()
                        .setCustomId(interaction.values[0])
                        .setTitle(modalTitle);
                    const decisionTitle = new discord_js_1.TextInputBuilder()
                        .setCustomId('decisionTitle')
                        .setLabel("Subject")
                        .setPlaceholder("The title of the general decision.")
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setRequired(true);
                    const decisionSummaryInput = new discord_js_1.TextInputBuilder()
                        .setCustomId('decisionSummary')
                        .setLabel("Summary")
                        .setPlaceholder("A summary of the decision you would like to make.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setMaxLength(650)
                        .setRequired(true);
                    const decisionDetails1 = new discord_js_1.TextInputBuilder()
                        .setCustomId('decisionDetails1')
                        .setLabel("Details")
                        .setPlaceholder("Explain, in full detail, the decision and how it will be implemented.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(true);
                    const decisionDetails2 = new discord_js_1.TextInputBuilder()
                        .setCustomId('decisionDetails2')
                        .setLabel("Details (cont.)")
                        .setPlaceholder("Use this in case you hit the character limit on the box above. Leave this space blank if not needed.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(false);
                    const decisionZeroRow = new discord_js_1.ActionRowBuilder().addComponents(decisionTitle);
                    const decisionFirstRow = new discord_js_1.ActionRowBuilder().addComponents(decisionSummaryInput);
                    const decisionSecondRow = new discord_js_1.ActionRowBuilder().addComponents(decisionDetails1);
                    const decisionThirdRow = new discord_js_1.ActionRowBuilder().addComponents(decisionDetails2);
                    // Add inputs to the modal
                    modal.addComponents(decisionZeroRow, decisionFirstRow, decisionSecondRow, decisionThirdRow);
                    // Show the modal to the user
                    await interaction.showModal(modal);
                }
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId === "vote_yes" || interaction.customId === "vote_no" || interaction.customId === "vote_abstain") {
                let activeResolution = qman.findActive();
                if (activeResolution.length === 0) {
                    await interaction.reply({ content: "That vote is no longer active.", flags: discord_js_1.MessageFlags.Ephemeral });
                }
                else {
                    activeResolution = activeResolution[0];
                    let voteMsgId = activeResolution["votemsg"];
                    if (interaction.message.id !== voteMsgId) {
                        await interaction.reply({ content: "That vote is no longer active.", flags: discord_js_1.MessageFlags.Ephemeral });
                    }
                    else {
                        if (!(interaction.channel !== null && interaction.inCachedGuild())) {
                            await interaction.reply({ content: "This command must be executed in a guild.", flags: discord_js_1.MessageFlags.Ephemeral });
                        }
                        else {
                            let eligibleVoters = activeResolution["eligiblevoters"];
                            let thisPeer = eligibleVoters.filter((voter) => voter["id"] === interaction.member.id); // Make sure they are an eligible peer
                            if (thisPeer.length === 0) {
                                await interaction.reply({ content: "You are not eligible to vote on this resolution because you were not a Peer at the time it was created.", flags: discord_js_1.MessageFlags.Ephemeral });
                            }
                            else {
                                // Update the Peer object in the eligible voters list
                                thisPeer = thisPeer[0];
                                let withoutThisPeer = eligibleVoters.filter((voter) => voter["id"] !== interaction.member.id);
                                let newVoterState = kts.determineVoterState(interaction.customId);
                                thisPeer["voter_state"] = newVoterState;
                                withoutThisPeer.push(thisPeer);
                                // Update the queue with the new information and respond to the user
                                qman.changeProperty(activeResolution.user, "eligiblevoters", withoutThisPeer);
                                const getEmoji = kts.voterStateToEmoji(newVoterState);
                                await interaction.reply({ content: `You have voted ${getEmoji}.`, flags: discord_js_1.MessageFlags.Ephemeral });
                                // We also need to update the tally message
                                let tallyMsgId = activeResolution["tallymsg"];
                                const dateFormatted = dayjs_1.default.unix(activeResolution["startdate"]).format("YYYY-MM-DD");
                                let newTallyMsg = frm.finalTally(withoutThisPeer, dateFormatted, 0);
                                let tallyMsg = await interaction.channel.messages.fetch(tallyMsgId);
                                await tallyMsg.edit(newTallyMsg).catch(console.error);
                            }
                        }
                    }
                }
            }
        }
    },
};
//# sourceMappingURL=interactionCreate.js.map