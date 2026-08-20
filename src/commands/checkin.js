// libs
import {
  MessageFlags,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
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
      .setRequired(false);

    const todayInput = new TextInputBuilder()
      .setCustomId("today")
      .setLabel("What you want to get done today ?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(yesterdayInput),
      new ActionRowBuilder().addComponents(todayInput),
    );

    await interaction.showModal(modal);
  },

  async modalSubmit(interaction) {
    const yesterday = interaction.fields.getTextInputValue("yesterday");
    const today = interaction.fields.getTextInputValue("today");

    if (!today && !yesterday) {
      return await interaction.reply({
        content: "Fill in at least one field",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const LOGGER = new LoggerService(interaction.client);
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

      const today Date(now.getFullYear(), now.getMonth(), now.getDate());

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

    const checkinEmbed = new EmbedBuilder()  // Embed Part...
      .setAuthor({ name: `𝗗𝗮𝗶𝗹𝘆 𝗖𝗵𝗲𝗰𝗸 I𝗻...🔁 ${interaction.user.username}`}); // .id Just shows Plan Name. // TODO; add nickname.
    if (yesterday) { // note; the font for Text used here is mathematical sans-serif bold.
      checkinEmbed.addFields({
        name:"𝗪𝗵𝗮𝘁 𝗜 𝗗𝗶𝗱 𝗬𝗲𝘀𝘁𝗲𝗿𝗱𝗮𝘆...⏮️",
        value:yesterday,
      });
    }
    if (today) {
      checkinEmbed.addFields({
        name:"𝗪𝗵𝗮𝘁 𝗜 𝗪𝗮𝗻𝘁 𝗧𝗼 𝗗𝗼 𝗧𝗼𝗱𝗮𝘆...🎯",
        value:today,
      });
    }
    const statsEmbed = new EmbedBuilder().addFields({
        name:`🔥${current_streaks} Current Streak`,
        value:"🔥x Away From The Next Check Point (Todo)", // ToDo; adding Stages of streaks. i.e 10 days, 20 days and so on...
      },
      {
        name:`🏆${longest_streaks} Longest Streak`,
        value:"🏆x Away From Goal (Todo)", // ToDo; adding /setgoal command.
        inline:true,}
    );

    await interaction.editReply({
      content:"Congrats On Showing Up Today!!!🏆\nKeep it up and you'll be a CEO of some AI company one day🔥",
      embeds:[checkinEmbed, statsEmbed]
    });
  },
};

export default generate; // adding better colors and author/fields images to embeds.