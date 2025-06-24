const { ContainerBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const qman = require("../../cogs/queue-manager");
const kindtostr = require("../../cogs/kindtostr.js");
const dayjs = require('dayjs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('seequeue')
		.setDescription('Look at the Peer Resolution queue, and pending proposals.'),
	async execute(interaction) {

		let exampleContainer = new ContainerBuilder();

        let qAsObj = qman.fetchQueue();
		let qItems = qAsObj["queue"];
		
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

		await interaction.reply({ components: [exampleContainer], flags: MessageFlags.IsComponentsV2});
	},
};