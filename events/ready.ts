import { Client, Guild, Events, ButtonBuilder, ActionRowBuilder, ButtonStyle, GuildMember, GuildBasedChannel, ChannelType } from "discord.js";
import { resChan, guildId, peerId, yes, no, abstain } from "../config.json";
import { VoterObject } from "../structures";
import cron from "node-cron";
import * as qman from "../cogs/queue-manager.js";
import * as frm from "../cogs/formatter.js";
import * as kts from "../cogs/kindtostr.js";
import dayjs from "dayjs";

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client<true>) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		interface proposalInterface {
			user: string;
			submitted: number;
			kind: string;
			active: boolean;
			votemsg: number;
			startdate: number;
			subject: undefined;
			details: undefined;
			summary: undefined;
			desire: undefined;
			eligiblevoters: object[];
			tallymsg: string;
		}

		async function closeActive(activeResolution: proposalInterface) {
			// Determine if server and channel are available
			const getServer: void | Guild = await client.guilds.fetch(guildId);
			const getChannel: null | GuildBasedChannel = await getServer.channels.fetch(resChan);
			if (!(getServer instanceof Guild) || getChannel == null) {
				console.error("Could not find guild or channel.");
			} else {
				if (getChannel.type !== ChannelType.GuildText) {
					console.error("This is not a text channel.");
				} else {
					let proposalType: string = activeResolution["kind"];
					let proposalThreshold = kts.determineThreshold(proposalType);
					let startDate = activeResolution["startdate"];
					let formatDate = dayjs.unix(startDate).format("YYYY-MM-DD");
					let finalMsg = frm.finalTally(<VoterObject[]>activeResolution["eligiblevoters"], formatDate, proposalThreshold!)

					let tallyMsg = await getChannel.messages.fetch(activeResolution["tallymsg"]);
					await tallyMsg.delete()
					.then(async () => await getChannel!.send(finalMsg));
					qman.changeProperty(activeResolution["user"], "active", false);
					qman.removeFrmQueue(activeResolution["user"]);
				}
			}
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
					let startResolution = qman.findNextProposal();
					const getServer: void | Guild = await client.guilds.fetch(guildId);
					const getChannel: null | GuildBasedChannel = await getServer.channels.fetch(resChan);
					if (!(getServer instanceof Guild) || getChannel == null) {
						console.error("Could not find guild or channel.");
					} else {
						if (getChannel.type !== ChannelType.GuildText) {
							console.error("This is not a text channel.");
						} else {
							try {
								// Initialize the final message we will send to the channel
								// First format the header
								const getAuthor = await getServer.members.fetch(startResolution.user).catch(console.error);
								if (!(getAuthor instanceof GuildMember)) {
									console.log("Could not find that member.");
								} else {
									const getNow = dayjs().format("YYYY-MM-DD");
									let header = frm.formatHeader(startResolution.kind, startResolution.subject, getAuthor.displayName, getNow);


									// Post the vote-msg and add reactions
									await getChannel.send(`<@&${peerId}>\n` + header);

									// Send the message to the channel here
									let finalMessage = frm.generateResMsg(startResolution);
									for (let i = 0; i < finalMessage.length; i++) {
										if (typeof finalMessage[i] !== undefined) {
											await getChannel.send(finalMessage[i]!);
										}
									}

									// Obtain a list of current peers and save them to the proposal object
									let hasPeerRole = await getServer.members.fetch();
									let allPeers = hasPeerRole.filter((m: GuildMember) => {
										return m.roles.cache.hasAny(peerId) === true;
									});
									let listPeersById = allPeers.map((m: GuildMember)=>m.user.id);
									// Figuring this out was possibly the most painful 2 hours of my life
									let listPeersByName = allPeers.map((m: GuildMember)=>m.displayName);
									let eligiblePeers = [];

									for (let i = 0; i < listPeersById.length; i++) {
										let usrObj = {
											id: listPeersById[i],
											name: listPeersByName[i],
											voter_state: 0
										}
										eligiblePeers.push(usrObj);
									}

									let threshold = kts.determineThreshold(startResolution.kind);
									let thresholdAsStr = "";
									if (threshold === 2/3) {
										thresholdAsStr = "2/3";
									} else if (threshold === 1/2) {
										thresholdAsStr = "1/2 + ε";
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

									const vote_row = new ActionRowBuilder<ButtonBuilder>()
										.addComponents(yesButton, noButton, abstainButton);

									const sendVote = await getChannel.send({
										content: `\`\`\`
THRESHOLD: ${thresholdAsStr}
\`\`\``,
										components: [vote_row]
									});

									let today = dayjs();

									startResolution["active"] = true;
									startResolution["startdate"] = today.unix();
									const deadline = today.add(3, "day").unix();
									startResolution["enddate"] = deadline;
									startResolution["votemsg"] = sendVote.id;
									startResolution["eligiblevoters"] = eligiblePeers;

									let tallyMessage = frm.formatTally(<VoterObject[]>eligiblePeers, today.format("YYYY-MM-DD"));
									let sendTallyMsg = await getChannel.send(tallyMessage);
									
									startResolution["tallymsg"] = sendTallyMsg.id;

									// Update the queue object
									qman.removeFrmQueue(startResolution.user);
									qman.addToQueue(startResolution);
								}

							} catch(err) {
								console.error("Could not post resolution, removing it from the queue..." + err);
								qman.removeFrmQueue(startResolution.user);
								return;
							}
					}
				}
			}
		}
	}

		cron.schedule('*/10 * * * * *', () => {
			queueLoop();
		});

	}
};