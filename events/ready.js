const { Events } = require('discord.js');
const { resChan, guildId } = require("../config.json");
const cron = require("node-cron");
const qman = require("../cogs/queue-manager.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		function queueLoop() {
			// Is a resolution open?
			if (qman.findActive()) { // YES
				console.log("Yes, a resolution is open.");
			} else { // NO
				// Is the queue empty?
				console.log("No, there is no open resolution.");
				let qAsObj = qman.fetchQueue();
				let qItems = qAsObj["queue"];

				if (qItems.length == 0) { // YES
					console.log("The queue is empty.");
					return;
				} else { // NO
					console.log("Queue is not empty, start another resolution...")
					// Start the first resolution in the queue
					
					// Find the resolutions channel (make sure it exists)
					let getResChan = client.channels.cache.get(resChan);
					if (typeof getResChan !== "undefined") {
						// Get the youngest item on the queue

						// Format the message and post it to the resolutions channel

						

						// Gather a list of eligible peers and write it to the queue.json
						// Post the vote-msg and add reactions
						// Obtain the message ID of the vote msg and store it in queue.json
					} else {
						console.log("Can't find the resolutions channel. Double check the config.");
					}


				}
			}
		}

		cron.schedule('*/10 * * * * *', () => {
			qman.findNextProposal();
		});

	}
};