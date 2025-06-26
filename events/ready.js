const { Events, blockQuote, bold, italic, quote, spoiler, strikethrough, underline, subtext } = require('discord.js');
const { resChan, guildId, peerId } = require("../config.json");
const cron = require("node-cron");
const qman = require("../cogs/queue-manager.js");
const frm = require("../cogs/formatter.js");
const dayjs = require('dayjs');
const peerResolutionClasses = ["amd_admin", "amd_rp", "amd_format", "amd_community", "app_member", "app_peer", "inj_rp", "inj_ip", "inj_member"];

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
					let finalMessage = "";
					// First format the header
					
					const getNow = dayjs().format("YYYY-MM-DD");
					let header = frm.formatHeader(nextProp.kind, nextProp.subject, getAuthor.nickname, getNow);

					if (peerResolutionClasses.indexOf(nextProp.kind) >= 0 && peerResolutionClasses.indexOf(nextProp.kind) <= 3) {
						// Summary of resolution
						let summaryText = "> " + "### Summary of Resolution\n";
						summaryText += "> " + nextProp.summary;
						// Details of Amendment
						let detailsText = frm.formatDetails(nextProp.details);
						
						finalMessage += summaryText + "\n";

						finalMessage += "> ### Details of Amendment\n"
						finalMessage += detailsText;

						finalMessage = frm.truncateMsg(finalMessage);
						

					}
					if (peerResolutionClasses.indexOf(nextProp.kind) == 4 || peerResolutionClasses.indexOf(nextProp.kind) == 5) {
						
					}
					if (peerResolutionClasses.indexOf(nextProp.kind) >= 6 && peerResolutionClasses.indexOf(nextProp.kind) <= 8) {
						let descText = "> **Description of Incident**\n";
						descText += "> " + nextProp.details;

						descText += "\n> **Preferential Outcome**\n"
						descText += "> " + nextProp.desire;

						finalMessage = frm.truncateMsg(descText);

					}
					// Post the vote-msg and add reactions
					// For some godforsaken reason, the header needs to be sent separately or there will be a weird gap in the msg
					await getChannel.send(header);
					for (let i = 0; i < finalMessage.length; i++) {
						await getChannel.send(finalMessage[i]);
					}
					// Set active to true for this proposal
					nextProp["active"] = true;

					// Obtain a list of eligible peers and save them to the proposal object
					let eligible = getServer.roles.cache.get(peerId).members.map(m=>m.user.id);
					nextProp["eligiblevoters"] = eligible;

					// Obtain the message ID of the vote message
					voteTxt = `\`\`\`
THRESHOLD: 2/3
\`\`\`
:white_check_mark: \`YES\`   |   :x: \`NO\`   |   :heavy_minus_sign: \`ABSTAIN\``
					await getChannel.send(voteTxt);
					// Update the queue


				}
			}
		}

		//queueLoop();
		cron.schedule('*/10 * * * * *', () => {
			//queueLoop();
		});

	}
};