import { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags, ChatInputCommandInteraction } from "discord.js";
import { peerId, guildId } from "../../config.json";
import { ProposalObject } from "../../structures";
import * as qman from "../../cogs/queue-manager.js";
import * as kts from "../../cogs/kindtostr.js";
import * as frm from "../../cogs/formatter.js";

export default {
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
	async execute(interaction: ChatInputCommandInteraction<undefined|"cached"|"raw">) {
		const category = interaction.options.getString('action');
        if (!(interaction.inCachedGuild()) || !interaction.member.roles.cache.has(peerId)) {
            await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral });
        } else {
            if (category == "q_propose") {
            let qAsObj = qman.fetchQueue();
            let qItems = qAsObj["queue"];
            const result = qItems.filter((proposal: ProposalObject) => proposal["user"] == interaction.user.id);
                if (result.length === 0) {

                    // Build the menu for selecting the class of proposal
                    const proposal_select = new StringSelectMenuBuilder()
                        .setCustomId("proposalSelect")
                        .setPlaceholder("Make a selection!")
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Amendment of Official Document(s)")
                                .setDescription("THRESHOLD: 2/3")
                                .setValue("amd_official"),
                            new StringSelectMenuOptionBuilder()
                                .setLabel("General Peer Decision")
                                .setDescription("THRESHOLD: 1/2 + ε")
                                .setValue("gen_decision"),
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
                                .setValue("inj_member")
                        );

                        // Send this menu to the user as a message
                        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
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
                        let stripPrefix = getUser.displayName.substring(4, getUser.displayName.length);
                        codeProposal += `[POSITION: ${i}]\n`
                        codeProposal += `    CLASS: ${kts.kindToStr(item.kind)}\n`
                        codeProposal += `  SUBJECT: ${item.subject}\n`
                        codeProposal += `   AUTHOR: ${stripPrefix}\n`
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