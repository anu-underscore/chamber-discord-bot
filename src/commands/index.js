// libs
import { Collection } from "discord.js";

// commands
import checkin from "./checkin.js";
import leaderboard from "./leaderboard.js";

const allCommands = [checkin, leaderboard];

const commandsCollection = new Collection();
const commands = [];

for (let i = 0; i < allCommands.length; ++i) {
  const command = allCommands[i];
  commandsCollection.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

export { commandsCollection, commands };
