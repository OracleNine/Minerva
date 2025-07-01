const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags, TextDisplayBuilder } = require('discord.js');
const { peerId, guildId } = require('../../config.json');
const qman = require("../../cogs/queue-manager.js");
const kts = require("../../cogs/kindtostr.js");
const frm = require("../../cogs/formatter.js");
const dayjs = require('dayjs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Commands related to the management of the queue.')
		.addStringOption(option =>
			option.setName('action')
                .setDescription("What do you want to do?")
				.setRequired(true)
				.addChoices(
					{ name: 'Propose', value: 'q_propose' },
					{ name: 'Remove', value: 'q_remove' },
					{ name: 'View', value: 'q_view' },
				)),
	async execute(interaction) {
		const category = interaction.options.getString('action');
        if (!interaction.member.roles.cache.has(peerId)) {
            await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral });
        } else {
            if (category == "q_propose") {
            let qAsObj = qman.fetchQueue();
            let qItems = qAsObj["queue"];
            const result = qItems.filter((proposal) => proposal["user"] == interaction.user.id);
                if (result.length === 0) {

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

                        await interaction.reply({
                            content: "Choose the type of resolution you would like to propose.",
                            components: [row],
                            withResponse: true,
                            flags: MessageFlags.Ephemeral
                        });

                        // The response is detected by interactionCreate.js

                    } else if (result.length != 0) { // The user already has a proposal in the queue
                        await interaction.reply({ content: "You have already submitted a proposal. Each Peer can have only one header in the queue at a time. Remove it with `/queue remove`, and then do `/queue propose`.", flags: MessageFlags.Ephemeral });
                    }

            } else if (category == "q_remove") {

                // If the user wants to remove something from the queue
                let result = qman.removeFrmQueue(interaction.member.id);
                await interaction.reply({ content: result, flags: MessageFlags.Ephemeral });

            } else if (category == "q_view") {

                // If the user wants to view something in the queue
                let qAsObj = qman.fetchQueue();
                let qItems = qAsObj["queue"];
                qItems = qItems.sort(frm.sortQueue); // Sorts items based on age
                let codeProposal = "";
                const getServer = await interaction.client.guilds.fetch(guildId);

                if (qItems.length == 0) {
                    codeProposal = "The queue is empty.";
                } else {
                    for (let i = 0; i < qItems.length; i++) {
                        // Iterate through each item in the queue and format it
                        let item = qItems[i];
                        const getUser = await getServer.members.fetch(item.user); // This gets the nickname rather than the username
                        codeProposal += `[POSITION: ${i}]\n`
                        codeProposal += `    CLASS: ${kts.kindToStr(item.kind)}\n`
                        codeProposal += `  SUBJECT: ${item.subject}\n`
                        codeProposal += `   AUTHOR: ${getUser.displayName}\n`
                    }
                }

                let queueMsgArray = frm.truncateMsg(codeProposal);
                let firstQueueMsg = `\`\`\`ini\n` + queueMsgArray[0] + `\`\`\``
                await interaction.reply({ content: firstQueueMsg });
                if (queueMsgArray.length > 1) {
                    for (let i = 1; i < queueMsgArray.length; i++) {
                        let subsQueueMsg = `\`\`\`ini\n` + queueMsgArray[i] + `\`\`\``
                        await interaction.followUp({ content: subsQueueMsg})
                    }
                }
            }
        }
	},
};