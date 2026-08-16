export default class LoggerService {
  static CHANNEL_ID = process.env.DEBUG_CHANNEL_ID ?? null;

  #client;

  constructor(client) {
    this.#client = client;
  }

  async info(message) {
    if (!LoggerService.CHANNEL_ID) return;

    const channel = await this.#client.channels.fetch(LoggerService.CHANNEL_ID);

    if (!channel?.isTextBased()) return;

    return channel.send(message);
  }

  async error(message) {
    if (!LoggerService.CHANNEL_ID) return;

    const channel = await this.#client.channels.fetch(LoggerService.CHANNEL_ID);

    if (!channel?.isTextBased()) return;

    return channel.send(message);
  }
}
