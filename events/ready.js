const { Events } = require('discord.js');
const { guildId } = require("../config.json");
const qman = require("../cogs/queue-manager.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		
		let qAsObj = qman.fetchQueue();
		let qItems = qAsObj["queue"];

		if (qItems != []) {
			// if queue is not empty, we need to check if a vote is active

			
		} else {
			// if queue is empty

		}

	},
};