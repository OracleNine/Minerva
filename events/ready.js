const { Events } = require('discord.js');
const { resChan, guildId } = require("../config.json");
const cron = require("node-cron");
const qman = require("../cogs/queue-manager.js");
const frm = require("../cogs/formatter.js");
const dayjs = require('dayjs');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {

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
					
					// Find the resolutions channel (make sure it exists)
					let getResChan = client.channels.cache.get(resChan);
					if (typeof getResChan !== "undefined") {
						// Get the youngest item on the queue
						let nextProp = qman.findNextProposal();

						// Format the message and post it to the resolutions channel
						// First format the header
						
						const getAuthor = await client.users.fetch(nextProp.user);
						let header = frm.formatHeader(nextProp.kind, nextProp.subject, getAuthor.globalName);

						// Gather a list of eligible peers and write it to the queue.json
						// Post the vote-msg and add reactions
						// Obtain the message ID of the vote msg and store it in queue.json
					} else {
						console.log("Can't find the resolutions channel. Double check the config.");
					}


				}
			}
		}

		queueLoop();
		cron.schedule('*/10 * * * * *', () => {
			queueLoop();
		});

	}
};