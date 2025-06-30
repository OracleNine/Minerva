const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { resChan, guildId, peerId, yes, no, abstain, clientId, } = require("../config.json");
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

		async function closeResolution(activeResolution) {	
			// Have all eligible users voted?
			let voteMsgId = activeResolution["votemsg"];
			let eligibleVoters = activeResolution["eligiblevoters"];
		}

		async function queueLoop() {
			// Is a resolution open?
			let activeResolution = qman.findActive();
			if (activeResolution.length > 0) { // YES
				activeResolution = activeResolution[0];
				// Has 72 hours passed?
				if (activeResolution["enddate"] <= dayjs().unix()) {// YES
					closeResolution(activeResolution);
				} else { // NO
					let eligibleVoters = activeResolution["eligiblevoters"];
					let allVotersVoted = true;

					// Iterate through all eligible voters and make sure its not 0 (absent) for anyone
					for (let i = 0; i < eligibleVoters.length; i++) {
						let voter = eligibleVoters[i];
						let state = voter.voter_state;

						if (state == 0) {
							allVotersVoted = false;
						}
					}
					// Have all eligible peers voted?
					if (allVotersVoted) { // YES
						console.log("Everyone has voted");
					} else { // NO
						console.log("Not everyone has voted");
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
						let listPeers = peerRole.filter(m => {
							return m.roles.cache.hasAny(peerId) === true;
						});
						listPeers = listPeers.map(m=>m.user.id);
						// Figuring this out was possibly the most painful 2 hours of my life

						let elPeersArr = [];

						for (let i = 0; i < listPeers.length; i++) {
							let usrObj = {
								id: listPeers[i],
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

												// Set active to true for this proposal
						let today = dayjs();

						qman.changeProperty(nextProp.user, "active", true);
						qman.changeProperty(nextProp.user, "startdate", today.unix());
						const deadline = today.add(3, "day").unix();
						qman.changeProperty(nextProp.user, "enddate", deadline);
						qman.changeProperty(nextProp.user, "votemsg", sendVote.id);
						qman.changeProperty(nextProp.user, "eligiblevoters", elPeersArr);

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