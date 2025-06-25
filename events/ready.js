const chokidar = require("chokidar");
const fs = require("node:fs");
const { Events } = require('discord.js');
const { guildId, resChan } = require("../config.json");
const qman = require("../cogs/queue-manager.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		
		let qAsObj = qman.fetchQueue();
		let qItems = qAsObj["queue"];

		console.log(qItems);
		console.log(qItems != []);

	}
};