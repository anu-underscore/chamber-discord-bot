// libs
import { MessageFlags, SlashCommandBuilder } from "discord.js";

// services
import UserService from "../services/User.service.js";

const generate = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("checkin")
    .setDescription("Generate checkin template")
    .addStringOption((option) =>
      option.setName("yesterday").setDescription("What you did yesterday"),
    )
    .addStringOption((option) =>
      option.setName("today").setDescription("What you want to get done today"),
    ),
  async execute(interaction) {
    const yesterday = interaction.options.getString("yesterday");
    const today = interaction.options.getString("today");

    if (!today && !yesterday) {
      return await interaction.editReply({
        content: "Fill in at least one field",
        flags: MessageFlags.Ephemeral,
      });
    }

    const template = [`**Daily Check-in ✅ <@${interaction.user.id}>**\n`];

    // add did check's
    if (yesterday) {
      const yesterdayArr = yesterday.split(", ");
      template.push("__What I did yesterday: :ballot_box_with_check:__");
      for (let i = 0; i < yesterdayArr.length; ++i) {
        template.push(`:pushpin: ${yesterdayArr[i]}`);
      }
      template.push("");
    }

    // add want check's
    if (today) {
      const todayArr = today.split(", ");
      template.push("__What I want to get done today: :sparkles:__");
      for (let i = 0; i < todayArr.length; ++i) {
        template.push(`:pushpin: ${todayArr[i]}`);
      }

      template.push("");
    }

    const username = interaction.user.username;
    let userData = await UserService.find(username);

    if (userData) {
      const lastCheckin = new Date(userData.last_checkin_at);
      const now = new Date();

      const lastDay = new Date(
        lastCheckin.getFullYear(),
        lastCheckin.getMonth(),
        lastCheckin.getDate(),
      );

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const DAY = 24 * 60 * 60 * 1000;
      const diffDays = Math.floor((today - lastDay) / DAY);

      if (diffDays === 0) {
        // Already streak today
        console.log("SKIP");
      } else {
        userData.last_checkin_at = new Date(now);

        if (diffDays === 1) {
          // Keep streak
          console.log("STREAK");
          ++userData.current_streaks;

          if (userData.current_streaks > userData.longest_streaks) {
            userData.longest_streaks = userData.current_streaks;
          }
        } else {
          // Skip day → reset
          console.log("RESET");
          userData.last_checkin_at = new Date(now);
          userData.current_streaks = 1;
        }

        await UserService.update(username, {
          current_streaks: userData.current_streaks,
          longest_streaks: userData.longest_streaks,
          last_checkin_at: userData.last_checkin_at,
        });
      }
    } else {
      userData = await UserService.create(username);
    }

    const { longest_streaks, current_streaks } = userData;

    template.push("-----");
    template.push(
      `:fire: **${current_streaks}-day${current_streaks > 1 ? "s" : ""} streak**`,
    );
    template.push(
      `:trophy: **${longest_streaks} day${longest_streaks > 1 ? "s" : ""} longest streak**`,
    );

    await interaction.editReply(template.join("\n"));
  },
};

export default generate;
