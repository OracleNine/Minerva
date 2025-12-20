"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = require("../config.json");
const node_cron_1 = __importDefault(require("node-cron"));
const qman = __importStar(require("../cogs/queue-manager.js"));
const frm = __importStar(require("../cogs/formatter.js"));
const kts = __importStar(require("../cogs/kindtostr.js"));
const dayjs_1 = __importDefault(require("dayjs"));
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        async function closeActive(activeResolution) {
            // Determine if server and channel are available
            const getServer = await client.guilds.fetch(config_json_1.guildId);
            const getChannel = await getServer.channels.fetch(config_json_1.resChan);
            if (!(getServer instanceof discord_js_1.Guild) || getChannel == null) {
                console.error("Could not find guild or channel.");
            }
            else {
                if (getChannel.type !== discord_js_1.ChannelType.GuildText) {
                    console.error("This is not a text channel.");
                }
                else {
                    let proposalType = activeResolution["kind"];
                    let proposalThreshold = kts.determineThreshold(proposalType);
                    let startDate = activeResolution["startdate"];
                    let formatDate = dayjs_1.default.unix(startDate).format("YYYY-MM-DD");
                    let finalMsg = frm.finalTally(activeResolution["eligiblevoters"], formatDate, proposalThreshold);
                    let tallyMsg = await getChannel.messages.fetch(activeResolution["tallymsg"]);
                    await tallyMsg.delete().then(async () => await getChannel.send(finalMsg));
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
                if (activeResolution["enddate"] <= (0, dayjs_1.default)().unix()) { // YES
                    closeActive(activeResolution);
                }
                else { // NO
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
                    }
                    else { // NO
                        return;
                    }
                }
            }
            else { // NO
                // Is the queue empty?
                let qAsObj = qman.fetchQueue();
                let qItems = qAsObj["queue"];
                if (qItems.length == 0) { // YES
                    console.log("The queue is empty.");
                    return;
                }
                else { // NO
                    // Start the first resolution in the queue
                    let startResolution = qman.findNextProposal();
                    const getServer = await client.guilds.fetch(config_json_1.guildId);
                    const getChannel = await getServer.channels.fetch(config_json_1.resChan);
                    if (!(getServer instanceof discord_js_1.Guild) || getChannel == null) {
                        console.error("Could not find guild or channel.");
                    }
                    else {
                        if (getChannel.type !== discord_js_1.ChannelType.GuildText) {
                            console.error("This is not a text channel.");
                        }
                        else {
                            try {
                                // Initialize the final message we will send to the channel
                                // First format the header
                                const getAuthor = await getServer.members.fetch(startResolution.user).catch(console.error);
                                if (!(getAuthor instanceof discord_js_1.GuildMember)) {
                                    console.log("Could not find that member.");
                                }
                                else {
                                    const getNow = (0, dayjs_1.default)();
                                    let header = frm.formatHeader(startResolution.kind, startResolution.subject, getAuthor.displayName, getNow);
                                    // Post the vote-msg and add reactions
                                    await getChannel.send(`<@&${config_json_1.peerId}>\n` + header);
                                    // Send the message to the channel here
                                    let finalMessage = frm.generateResMsg(startResolution);
                                    for (let i = 0; i < finalMessage.length; i++) {
                                        if (typeof finalMessage[i] !== undefined) {
                                            await getChannel.send(finalMessage[i]);
                                        }
                                    }
                                    // Obtain a list of current peers and save them to the proposal object
                                    let hasPeerRole = await getServer.members.fetch();
                                    let allPeers = hasPeerRole.filter((m) => {
                                        return m.roles.cache.hasAny(config_json_1.peerId) === true;
                                    });
                                    let listPeersById = allPeers.map((m) => m.user.id);
                                    // Figuring this out was possibly the most painful 2 hours of my life
                                    let listPeersByName = allPeers.map((m) => m.displayName);
                                    let eligiblePeers = [];
                                    for (let i = 0; i < listPeersById.length; i++) {
                                        let usrObj = {
                                            id: listPeersById[i],
                                            name: listPeersByName[i],
                                            voter_state: 0
                                        };
                                        eligiblePeers.push(usrObj);
                                    }
                                    let threshold = kts.determineThreshold(startResolution.kind);
                                    if (threshold === -1) {
                                        console.error("Could not determine threshold.");
                                    }
                                    else {
                                        let thresholdAsStr = kts.thresholdToString(threshold);
                                        // Send the vote message. Obtain its ID and save it to the proposal object
                                        const yesButton = new discord_js_1.ButtonBuilder()
                                            .setCustomId("vote_yes")
                                            .setEmoji(`<:yes:${config_json_1.yes}>`)
                                            .setLabel(`YES`)
                                            .setStyle(discord_js_1.ButtonStyle.Secondary);
                                        const noButton = new discord_js_1.ButtonBuilder()
                                            .setCustomId("vote_no")
                                            .setEmoji(`<:no:${config_json_1.no}>`)
                                            .setLabel(`NO`)
                                            .setStyle(discord_js_1.ButtonStyle.Secondary);
                                        const abstainButton = new discord_js_1.ButtonBuilder()
                                            .setCustomId("vote_abstain")
                                            .setEmoji(`<:abstain:${config_json_1.abstain}>`)
                                            .setLabel(`ABSTAIN`)
                                            .setStyle(discord_js_1.ButtonStyle.Secondary);
                                        const vote_row = new discord_js_1.ActionRowBuilder()
                                            .addComponents(yesButton, noButton, abstainButton);
                                        const sendVote = await getChannel.send({
                                            content: `\`\`\`
THRESHOLD: ${thresholdAsStr}
\`\`\``,
                                            components: [vote_row]
                                        });
                                        let today = (0, dayjs_1.default)();
                                        startResolution["active"] = true;
                                        startResolution["startdate"] = today.unix();
                                        const deadline = today.add(3, "day").unix();
                                        startResolution["enddate"] = deadline;
                                        startResolution["votemsg"] = sendVote.id;
                                        startResolution["eligiblevoters"] = eligiblePeers;
                                        let tallyMessage = frm.finalTally(eligiblePeers, today.format("YYYY-MM-DD"), 0);
                                        let sendTallyMsg = await getChannel.send(tallyMessage);
                                        startResolution["tallymsg"] = sendTallyMsg.id;
                                        // Update the queue object
                                        qman.removeFrmQueue(startResolution.user);
                                        qman.addToQueue(startResolution);
                                    }
                                }
                            }
                            catch (err) {
                                console.error("Could not post resolution, removing it from the queue...");
                                console.error(err);
                                qman.removeFrmQueue(startResolution.user);
                                return;
                            }
                        }
                    }
                }
            }
        }
        node_cron_1.default.schedule('*/10 * * * * *', () => {
            queueLoop();
        });
    }
};
//# sourceMappingURL=ready.js.map