const { Events, blockQuote, bold, italic, quote, spoiler, strikethrough, underline, subtext } = require('discord.js');
const { resChan, guildId, peerId, yes, no, abstain } = require("../config.json");
const cron = require("node-cron");
const qman = require("../cogs/queue-manager.js");
const frm = require("../cogs/formatter.js");
const kts = require("../cogs/kindtostr.js");
const dayjs = require('dayjs');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		async function queueLoop() {
			// Is a resolution open?
			if (qman.findActive()) { // YES
				console.log("Yes, a resolution is open.");
			} else { // NO
				// Is the queue empty?
				let qAsObj = qman.fetchQueue();
				let qItems = qAsObj["queue"];

				if (qItems.length == 0) { // YES
					console.log("The queue is empty.");
					return;
				} else { // NO
					// Start the first resolution in the queue
					let nextProp = qman.findNextProposal();

					// Find the resolutions channel
					const getServer = await client.guilds.fetch(guildId);
					const getChannel = await getServer.channels.fetch(resChan).catch(console.error);
					const getAuthor = await getServer.members.fetch(nextProp.user);

					// Initialize the final message we will send to the channel
					// First format the header
					
					const getNow = dayjs().format("YYYY-MM-DD");
					let header = frm.formatHeader(nextProp.kind, nextProp.subject, getAuthor.nickname, getNow);


					// Post the vote-msg and add reactions
					// For some godforsaken reason, the header needs to be sent separately or there will be a weird gap in the msg
					await getChannel.send(`<@&${peerId}>\n` + header);

					// Send the message to the channel here
					let finalMessage = frm.generateResMsg(nextProp);
					for (let i = 0; i < finalMessage.length; i++) {
						await getChannel.send(finalMessage[i]);
					}

					// Set active to true for this proposal
					nextProp["active"] = true;
					nextProp["startdate"] = dayjs().unix()

					// Obtain a list of eligible peers and save them to the proposal object
					let eligible = getServer.roles.cache.get(peerId).members.map(m=>m.user.id);
					nextProp["eligiblevoters"] = eligible;

					let threshold = kts.determineThreshold(nextProp.kind);
					if (threshold === 2/3) {
						threshold = "2/3";
					} else if (threshold === 1/2) {
						threshold = "1/2 + ε";
					}
					// Send the vote message. Obtain its ID and save it to the proposal object
					voteTxt = `\`\`\`
THRESHOLD: ${threshold}
\`\`\`
<:yes:${yes}> \`YES\`   |   <:no:${no}> \`NO\`   |   <:abstain:${abstain}> \`ABSTAIN\``
					const sendVote = await getChannel.send(voteTxt);
					nextProp["votemsg"] = sendVote.id;
					sendVote.react(yes)
						.then(() => sendVote.react(no))
						.then(() => sendVote.react(abstain))
						.catch(error => console.error(error));

					// Update the queue
					qman.removeFrmQueue(nextProp.user);
					qman.addToQueue(nextProp);
					

				}
			}
		}

		cron.schedule('*/10 * * * * *', () => {
			queueLoop();
		});

	}
};