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
const config_json_1 = require("../../config.json");
const qman = __importStar(require("../../cogs/queue-manager.js"));
const frm = __importStar(require("../../cogs/formatter.js"));
const dayjs_1 = __importDefault(require("dayjs"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('queue')
        .setDescription('Commands related to the management of the queue.')
        .addStringOption(option => option.setName('action')
        .setDescription("What do you want to do?")
        .setRequired(true)
        .addChoices({ name: 'Propose', value: 'q_propose' }, { name: 'Remove', value: 'q_remove' }, { name: 'View', value: 'q_view' }, { name: 'Clear', value: 'q_clear' })),
    async execute(interaction) {
        const category = interaction.options.getString('action');
        if (!(interaction.inCachedGuild()) || !interaction.member.roles.cache.has(config_json_1.peerId)) {
            await interaction.reply({ content: "No permission.", flags: discord_js_1.MessageFlags.Ephemeral });
        }
        else {
            if (category == "q_propose") {
                let qAsObj = qman.fetchQueue();
                let qItems = qAsObj["queue"];
                const result = qItems.filter((proposal) => proposal["user"] == interaction.user.id);
                if (result.length === 0) {
                    // Build the menu for selecting the class of proposal
                    const proposal_select = new discord_js_1.StringSelectMenuBuilder()
                        .setCustomId("proposalSelect")
                        .setPlaceholder("Make a selection!")
                        .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("Amendment of Official Document(s)")
                        .setDescription("THRESHOLD: 2/3")
                        .setValue("amd_official"), new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("General Peer Decision")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("gen_decision"), new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("Application for Membership")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("app_member"), new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("Application for Peerage")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("app_peer"), new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("Injunction on Intellectual Property")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("inj_ip"), new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("Injunction on Roleplay Action")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("inj_rp"), new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel("Injunction on User Behavior")
                        .setDescription("THRESHOLD: 1/2 + ε")
                        .setValue("inj_member"));
                    // Send this menu to the user as a message
                    const row = new discord_js_1.ActionRowBuilder()
                        .addComponents(proposal_select);
                    await interaction.reply({
                        content: "Choose the type of resolution you would like to propose.",
                        components: [row],
                        withResponse: true,
                        flags: discord_js_1.MessageFlags.Ephemeral
                    });
                    // The response is detected by interactionCreate.js
                }
                else if (result.length != 0) { // The user already has a proposal in the queue
                    await interaction.reply({ content: "You have already submitted a proposal. Each Peer can have only one header in the queue at a time. Remove it with `/queue remove`, and then do `/queue propose`.", flags: discord_js_1.MessageFlags.Ephemeral });
                }
            }
            else if (category == "q_remove") {
                // If the user wants to remove something from the queue
                let result = qman.removeFrmQueue(interaction.member.id);
                await interaction.reply({ content: result, flags: discord_js_1.MessageFlags.Ephemeral });
            }
            else if (category == "q_view") {
                // If the user wants to view something in the queue
                let qAsObj = qman.fetchQueue();
                let qItems = qAsObj["queue"];
                qItems = qItems.sort(frm.sortQueue); // Sorts items based on age
                let codeProposal = "";
                const getServer = await interaction.client.guilds.fetch(config_json_1.guildId);
                if (qItems.length == 0) {
                    codeProposal = "The queue is empty.";
                }
                else {
                    for (let i = 0; i < qItems.length; i++) {
                        // Iterate through each item in the queue and format it
                        let item = qItems[i];
                        const getUser = await getServer.members.fetch(item.user);
                        let getDisplayName = getUser.displayName;
                        codeProposal += frm.formatHeader(item.kind, item.subject, getDisplayName, dayjs_1.default.unix(item.submitted), i);
                    }
                }
                let queueMsgArray = frm.truncateMsg(codeProposal, false);
                let firstQueueMsg = queueMsgArray[0];
                await interaction.reply({ content: firstQueueMsg });
                if (queueMsgArray.length > 1) {
                    for (let i = 1; i < queueMsgArray.length; i++) {
                        let subsQueueMsg = queueMsgArray[i];
                        await interaction.followUp({ content: subsQueueMsg });
                    }
                }
            }
            else if (category === "q_clear") {
                if (!interaction.member.roles.cache.has(config_json_1.chairId)) {
                    await interaction.reply({ content: "No permission.", flags: discord_js_1.MessageFlags.Ephemeral });
                }
                else {
                    qman.clearQueue();
                    await interaction.reply({ content: "Queue has been wiped.", flags: discord_js_1.MessageFlags.Ephemeral });
                }
            }
        }
    },
};
//# sourceMappingURL=queue.js.map