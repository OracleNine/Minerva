const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const { peerId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('propose')
		.setDescription('Add a proposal to the queue.'),
	async execute(interaction) {
        // Check if the user is a peer
		 if (interaction.member.roles.cache.has(peerId)) {

            // Build the menu for selecting the class of proposal
            const proposal_select = new StringSelectMenuBuilder()
                .setCustomId("proposal_select")
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

                // Await a response
                const collectorFilter = i => i.user.id === interaction.user.id;
                try {
                    const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 3_600_000 });

                    // Get the class of the resolution
                    if (confirmation.values[0] === "amd_admin" || confirmation.values[0] === "amd_rp" || confirmation.values[0] === "amd_format" || confirmation.values[0] === "amd_community") {

                    } else if () {
                        
                    }
                    switch (confirmation.values[0]) {
                        case "amd_admin":
                            console.log("1");
                            break;
                        case "amd_rp":
                            console.log("2");
                            break;
                        case "amd_format":
                            console.log("3");
                            break;
                        case "amd_community":
                            console.log("4");
                            break;
                        case "app_member":
                            console.log("5");
                            break;
                        case "app_peer":
                            console.log("6");
                            break;
                        case "inj_ip":
                            console.log("7");
                            break;
                        case "inj_rp":
                            console.log("8");
                            break;
                        case "inj_member":
                            console.log("9");
                            break;
                    }



                } catch {
                    await interaction.editReply({ content: "Confirmation not received. Try running the command again. `/propose`", components: [] });
                }
         } else {
            await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral });
         }
	},
};