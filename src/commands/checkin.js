// libs
import {
  MessageFlags,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

// services
import UserService from "../services/User.service.js";
import LoggerService from "../services/Logger.service.js";

const generate = {
  cooldown: 10,

  data: new SlashCommandBuilder()
    .setName("checkin")
    .setDescription("Generate checkin template"),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("checkin_modal")
      .setTitle("Daily Check-in ✅");

    const yesterdayInput = new TextInputBuilder()
      .setCustomId("yesterday")
      .setLabel("What you did yesterday ?")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Task 1\nTask 2\n etc.")
      .setRequired(false);

    const todayInput = new TextInputBuilder()
      .setCustomId("today")
      .setLabel("What you want to get done today ?")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Task 1\nTask 2\n etc.")
      .setRequired(false);

    const pointSymbolInput = new TextInputBuilder()
      .setCustomId("customPointSymbol")
      .setLabel("Custom point symbol")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Default: 📌. Enter "number" for a numbered list.')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(yesterdayInput),
      new ActionRowBuilder().addComponents(todayInput),
      new ActionRowBuilder().addComponents(pointSymbolInput),
    );

    await interaction.showModal(modal);
  },

  async modalSubmit(interaction) {
    const yesterday = interaction.fields.getTextInputValue("yesterday");
    const today = interaction.fields.getTextInputValue("today");
    const customPointSymbol =
      interaction.fields.getTextInputValue("customPointSymbol") ?? ":pushpin:";

    if (!today && !yesterday) {
      return await interaction.reply({
        content: "Fill in at least one field",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const LOGGER = new LoggerService(interaction.client);

    const template = [`**Daily Check-in ✅ <@${interaction.user.id}>**\n`];

    // add did check's
    if (yesterday) {
      const yesterdayArr = yesterday.split("\n");
      template.push("__What I did yesterday: :ballot_box_with_check:__");
      for (let i = 0; i < yesterdayArr.length; ++i) {
        const line = yesterdayArr[i].trim();
        if (line === "") continue;
        template.push(
          `${customPointSymbol === "number" ? `${i + 1}. ` : customPointSymbol} ${line}`,
        );
      }
      template.push("");
    }

    // add want check's
    if (today) {
      const todayArr = today.split("\n");
      template.push("__What I want to get done today: :sparkles:__");
      for (let i = 0; i < todayArr.length; ++i) {
        const line = todayArr[i].trim();
        if (line === "") continue;
        template.push(
          `${customPointSymbol === "number" ? `${i + 1}. ` : customPointSymbol} ${line}`,
        );
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
          await LOGGER.info(
            `Streak reseted for <@${interaction.user.id}>\n Last checkin at: ${userData.last_checkin_at}`,
          );
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
