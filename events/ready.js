const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { resChan, guildId, peerId, yes, no, abstain, clientId, absent } = require("../config.json");
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

		async function closeActive(activeResolution) {
			let proposalType = activeResolution["kind"];
			let proposalThreshold = kts.determineThreshold(proposalType);
			let startDate = activeResolution["startdate"];
			let formatDate = dayjs.unix(startDate).format("YYYY-MM-DD");
			let finalMsg = frm.finalTally(activeResolution["eligiblevoters"], formatDate, proposalThreshold)

			let tallyMsg = await getChannel.messages.fetch(activeResolution["tallymsg"]);
			await tallyMsg.delete()
			.then(async () => await getChannel.send(finalMsg));
			qman.changeProperty(activeResolution["user"], "active", false);
			qman.removeFrmQueue(activeResolution["user"]);
		}

		async function queueLoop() {
			// Is a resolution open?
			let activeResolution = qman.findActive();
			if (activeResolution.length > 0) { // YES
				activeResolution = activeResolution[0];
				// Has 72 hours passed?
				if (activeResolution["enddate"] <= dayjs().unix()) {// YES
					closeActive(activeResolution);
				} else { // NO
					let eligibleVoters = activeResolution["eligiblevoters"];
					let allVotersVoted = true;

					// Iterate through all eligible voters and make sure its not 0 (absent) for anyone
					for (let i = 0; i < eligibleVoters.length; i++) {
						let voter = eligibleVoters[i];
						let state = voter.voter_state;
						if (state === 0) {
							allVotersVoted = false;
						}
					}
					// Have all eligible peers voted?
					if (allVotersVoted) { // YES
						closeActive(activeResolution);
					} else { // NO
						return;
					}
					
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
						await getChannel.send(`<@&${peerId}>\n` + header);

						// Send the message to the channel here
						let finalMessage = frm.generateResMsg(nextProp);
						if (finalMessage.length > 0) {
							for (let i = 0; i < finalMessage.length; i++) {
								await getChannel.send(finalMessage[i]);
							}
						}

						// Obtain a list of current peers and save them to the proposal object
						let peerRole = await getServer.members.fetch();
						let allPeers = peerRole.filter(m => {
							return m.roles.cache.hasAny(peerId) === true;
						});
						let listPeers = allPeers.map(m=>m.user.id);
						// Figuring this out was possibly the most painful 2 hours of my life
						let getPeerNames = allPeers.map(m=>m.displayName);
						let elPeersArr = [];

						for (let i = 0; i < listPeers.length; i++) {
							let usrObj = {
								id: listPeers[i],
								name: getPeerNames[i],
								voter_state: 0
							}
							elPeersArr.push(usrObj);
						}

						let threshold = kts.determineThreshold(nextProp.kind);
						if (threshold === 2/3) {
							threshold = "2/3";
						} else if (threshold === 1/2) {
							threshold = "1/2 + ε";
						}
					// Send the vote message. Obtain its ID and save it to the proposal object

						const yesButton = new ButtonBuilder()
							.setCustomId("vote_yes")
							.setEmoji(`<:yes:${yes}>`)
							.setLabel(`YES`)
							.setStyle(ButtonStyle.Secondary);
						
						const noButton = new ButtonBuilder()
							.setCustomId("vote_no")
							.setEmoji(`<:no:${no}>`)
							.setLabel(`NO`)
							.setStyle(ButtonStyle.Secondary);
						
						const abstainButton = new ButtonBuilder()
							.setCustomId("vote_abstain")
							.setEmoji(`<:abstain:${abstain}>`)
							.setLabel(`ABSTAIN`)
							.setStyle(ButtonStyle.Secondary);

						const vote_row = new ActionRowBuilder()
							.addComponents(yesButton, noButton, abstainButton);

						const sendVote = await getChannel.send({
							content: `\`\`\`
THRESHOLD: ${threshold}
\`\`\``,
							components: [vote_row]
						});

						let today = dayjs();

						nextProp["active"] = true;
						nextProp["startdate"] = today.unix();
						const deadline = today.add(3, "day").unix();
						nextProp["enddate"] = deadline;
						nextProp["votemsg"] = sendVote.id;
						nextProp["eligiblevoters"] = elPeersArr;

						let tallyMessage = frm.formatTally(elPeersArr, today.format("YYYY-MM-DD"));
						let sendTallyMsg = await getChannel.send(tallyMessage);
						
						nextProp["tallymsg"] = sendTallyMsg.id;

						// Update the queue object
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