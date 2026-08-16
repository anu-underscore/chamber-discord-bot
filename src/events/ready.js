// libs
import { Events } from "discord.js";

// servcies
import LoggerService from "../services/Logger.service.js";

const ready = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    await new LoggerService(client).info("Bot started");
  },
};

export default ready;
