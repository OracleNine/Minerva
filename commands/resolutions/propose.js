const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const { peerId } = require('../../config.json');
const qman = require("../../cogs/queue-manager.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('propose')
		.setDescription('Add a proposal to the queue.'),
	async execute(interaction) {
        // Check if the user is a peer, and ensure they do not have any proposals already in the queue

		 if (interaction.member.roles.cache.has(peerId)) {

            // Build the menu for selecting the class of proposal
            const proposal_select = new StringSelectMenuBuilder()
                .setCustomId("proposalSelect")
                .setPlaceholder("Make a selection!")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Amendent of Administrative Charter")
                        .setDescription("THRESHOLD: 2/3")
                        .setValue("amd_admin"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Amendent of Roleplay Charter")
                        .setDescription("THRESHOLD: 2/3")
                        .setValue("amd_rp"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Amendent of Formatting Guidelines")
                        .setDescription("THRESHOLD: 2/3")
                        .setValue("amd_format"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Amendent of Community Guidelines")
                        .setDescription("THRESHOLD: 2/3")
                        .setValue("amd_community"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Application for Membership")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("app_member"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Application for Peerage")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("app_peer"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Injunction on Intellectual Property")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("inj_ip"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Injunction on Roleplay Action")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("inj_rp"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Injunction on User Behavior")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("inj_member"),
                );

                // Send this menu to the user as a message
                const row = new ActionRowBuilder()
                    .addComponents(proposal_select);

                const response = await interaction.reply({
                    content: "Choose the type of resolution you would like to propose.",
                    components: [row],
                    withResponse: true,
                    flags: MessageFlags.Ephemeral
                });

                // The response is detected by interactionCreate.js
         } else {
            // User is not a peer
            await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral });
         }
	},
};