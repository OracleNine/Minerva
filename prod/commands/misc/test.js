"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("spook")
        .setDescription("A command for testing"),
    async execute(interaction) {
        if (interaction.user.id !== "184011968946896896") {
            await interaction.reply({ content: "No permission.", flags: discord_js_1.MessageFlags.Ephemeral });
        }
        else {
            await interaction.reply({ content: "Spook!", flags: discord_js_1.MessageFlags.Ephemeral });
        }
    }
};
//# sourceMappingURL=test.js.map