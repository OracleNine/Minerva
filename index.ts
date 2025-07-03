import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { token } from "./config.json";


const client: any = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers ] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		const cmd = command.default ?? command;
		if ('data' in cmd && 'execute' in cmd) {
			client.commands.set(cmd.data.name, cmd);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	const evt = event.default ?? event;
	if (evt.once) {
		client.once(evt.name, (...args: any[]) => evt.execute(...args));
	} else {
		client.on(evt.name, (...args: any[]) => evt.execute(...args));
	}
}

client.login(token);