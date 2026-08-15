// libs
import { MessageFlags, SlashCommandBuilder } from "discord.js";

// services
import UserService from "../services/User.service.js";

const leaderboard = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show leaderboard"),
  async execute(interaction) {
    const users = await UserService.findMany();

    if (users.length === 0) {
      return await interaction.editReply("(no users)");
    }

    const result = ["**Leaderboard** :medal:"];
    result.push("");

    for (let i = 0; i < users.length; ++i) {
      result.push(
        `${i + 1}. ${users[i].username} :fire: ${users[i].longest_streaks}`,
      );
    }

    await interaction.editReply(result.join("\n"));
  },
};

export default leaderboard;
