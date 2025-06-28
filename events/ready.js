const { Events, blockQuote, bold, italic, quote, spoiler, strikethrough, underline, subtext } = require('discord.js');
const { resChan, guildId, peerId, yes, no, abstain, clientId } = require("../config.json");
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

		// Get server, channel, and author
		const getServer = await client.guilds.fetch(guildId).catch(console.error);
		const getChannel = await getServer.channels.fetch(resChan).catch(console.error);

		async function closeRes() {

		}

		async function queueLoop() {
			// Is a resolution open?
			let activeResolution = qman.findActive();
			if (activeResolution.length > 0) { // YES
				activeResolution = activeResolution[0];
				// Have three days passed?
				if (activeResolution["enddate"] <= dayjs().unix()) {// YES
					
				} else { // NO
					let voteMsgId = activeResolution["votemsg"];
					const voteMsgObj = await getChannel.messages.fetch(voteMsgId);

					// Obtain an array of user IDs who voted "yes"
					const yesRxn = await voteMsgObj.reactions.cache.find(reaction => reaction._emoji.id === yes);
					let yesUsers = await yesRxn.users.fetch();
					yesUsers = yesUsers.map(m => m.id);
					yesUsers = frm.snip(yesUsers, clientId);
					// You wouldnt believe how difficult this was to figure out
					// Obtain an array of user IDs who voted "no"
					const noRxn = await voteMsgObj.reactions.cache.find(reaction => reaction._emoji.id === no);
					let noUsers = await noRxn.users.fetch();
					noUsers = noUsers.map(m => m.id);
					noUsers = frm.snip(noUsers, clientId);
					// Obtain an array of user IDs who voted "abstain"
					const abstainRxn = await voteMsgObj.reactions.cache.find(reaction => reaction._emoji.id === no);
					let abstainUsers = await abstainRxn.users.fetch();
					abstainUsers = abstainUsers.map(m => m.id);
					abstainUsers = frm.snip(abstainUsers, clientId);

					afterVoters = frm.translateVotes(yesUsers, noUsers, abstainUsers);
					console.log(afterVoters);
					
				}	

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
					try {

						// Initialize the final message we will send to the channel
						// First format the header
						const getAuthor = await getServer.members.fetch(nextProp.user).catch(console.error);
						const getNow = dayjs().format("YYYY-MM-DD");
						let header = frm.formatHeader(nextProp.kind, nextProp.subject, getAuthor.nickname, getNow);


						// Post the vote-msg and add reactions
						// For some godforsaken reason, the header needs to be sent separately or there will be a weird gap in the msg
						await getChannel.send(`<@&${peerId}>\n` + header);

						// Send the message to the channel here
						let finalMessage = frm.generateResMsg(nextProp);
						if (finalMessage.length > 0) {
							for (let i = 0; i < finalMessage.length; i++) {
								await getChannel.send(finalMessage[i]);
							}
						}
						// Set active to true for this proposal
						let today = dayjs();

						nextProp["active"] = true;
						nextProp["startdate"] = today.unix();
						nextProp["enddate"] = today.add(3, "day").unix();

						// Obtain a list of eligible peers and save them to the proposal object
						let listPeers = getServer.roles.cache.get(peerId).members.map(m=>m.user.id);
						let elPeersArr = [];

						for (let i = 0; i < listPeers.length; i++) {
							let usrObj = {
								id: listPeers[i],
								voter_state: 0
							}
							elPeersArr.push(usrObj);
						}

						console.log(elPeersArr);
						nextProp["eligiblevoters"] = elPeersArr;

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

					} catch(err) {
						console.error("Could not post resolution, removing it from the queue..." + err);
						qman.removeFrmQueue(nextProp.user);
						return;
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