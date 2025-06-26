const { Events, blockQuote, bold, italic, quote, spoiler, strikethrough, underline, subtext } = require('discord.js');
const { resChan, guildId } = require("../config.json");
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
					
					// Find the resolutions channel
					const getChannel = await client.channels.fetch(resChan).catch(console.error);
					// Get the youngest item on the queue
					let nextProp = qman.findNextProposal();

					// Initialize the final message we will send to the channel
					let finalMessage = "";
					// First format the header
					
					const getAuthor = await client.users.fetch(nextProp.user);
					let header = frm.formatHeader(nextProp.kind, nextProp.subject, getAuthor.globalName);

					if (peerResolutionClasses.indexOf(nextProp.kind) >= 0 && peerResolutionClasses.indexOf(nextProp.kind) <= 3) {
						// Summary of resolution
						let summaryText = "**Summary of Resolution**\n"
						summaryText += nextProp.summary;
						// Details of Amendment
						let detailsText = frm.formatDetails(nextProp.details);
						
						finalMessage += summaryText;
						finalMessage += detailsText;

						finalMessage = frm.truncateMsg(finalMessage);
						

					}
					if (peerResolutionClasses.indexOf(nextProp.kind) == 4 || peerResolutionClasses.indexOf(nextProp.kind) == 5) {
						
					}
					if (peerResolutionClasses.indexOf(nextProp.kind) >= 6 && peerResolutionClasses.indexOf(nextProp.kind) <= 8) {
						
					}

					// Gather a list of eligible peers and write it to the queue.json
					// Post the vote-msg and add reactions
					// Obtain the message ID of the vote msg and store it in queue.json


				}
			}
		}

		queueLoop();
		cron.schedule('*/10 * * * * *', () => {
			queueLoop();
		});

	}
};