const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags, ContainerBuilder } = require('discord.js');
const { peerId } = require('../../config.json');
const qman = require("../../cogs/queue-manager.js");
const kindtostr = require("../../cogs/kindtostr.js");
const dayjs = require('dayjs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Commands related to the queue.')
		.addStringOption(option =>
			option.setName('action')
				.setDescription('What do you want to do?')
				.setRequired(true)
				.addChoices(
					{ name: 'Propose', value: 'q_propose' },
					{ name: 'Remove', value: 'q_remove' },
					{ name: 'View', value: 'q_view' },
				)),
	async execute(interaction) {
		const category = interaction.options.getString('action');

		if (category == "q_propose") {

            // If the user wants to create a new proposal

            let qAsObj = qman.fetchQueue();
            let qItems = qAsObj["queue"];
            const result = qItems.filter((proposal) => proposal["user"] == interaction.user.id);
            if (result.length === 0 && interaction.member.roles.cache.has(peerId)) {

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

                } else if (!interaction.member.roles.cache.has(peerId)) { //The user is not a peer
                    await interaction.reply({ content: "No permission.", flags: MessageFlags.Ephemeral });
                } else if (result.length != 0) { // The user already has a proposal in the queue
                    await interaction.reply({ content: "You have already submitted a proposal. Each Peer can have only one header in the queue at a time. Remove it with `/queue remove`, and then do `/queue propose`.", flags: MessageFlags.Ephemeral });
                }

        } else if (category == "q_remove") {

            // If the user wants to remove something from the queue

            qman.removeFrmQueue(interaction.member.id);
            await interaction.reply({ content: "Your proposals, if any, have been removed from the queue.", flags: MessageFlags.Ephemeral });

        } else if (category == "q_view") {

            // If the user wants to view something in the queue

            let exampleContainer = new ContainerBuilder();

            let qAsObj = qman.fetchQueue();
            let qItems = qAsObj["queue"];

            if (qItems.length == 0) {
                exampleContainer.addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent("The queue is empty."),
                );
            } else {
                for (let i = 0; i < qItems.length; i++) {

                    //	```ini
                    //	[PEER RESOLUTION] <date YY-MM-DD : #>
                    //
                    //	CLASS: Application for Membership
                    //	SUBJECT: <applicant>'s Applicancy
                    //	AUTHOR: <chair>
                    //	```

                    let item = qItems[i];

                    let codeClass = kindtostr.kindToStr(item.kind);

                    const getUser = await interaction.client.users.cache.get(item.user);

                    let codeSubject = item.subject;
                    let codeAuthor = getUser.displayName;
                    let codeDate = dayjs(item.date).format("YYYY-MM-DD");

                    let codeProposal = `
\`\`\`ini
[PEER RESOLUTION] ${codeDate}\n
CLASS: ${codeClass}
SUBJECT: ${codeSubject}
AUTHOR: ${codeAuthor}
\`\`\`
`
                    exampleContainer.addTextDisplayComponents(
                        textDisplay => textDisplay
                            .setContent(codeProposal),
                    );
                }

            }
            await interaction.reply({ components: [exampleContainer], flags: MessageFlags.IsComponentsV2});
        }
	},
};