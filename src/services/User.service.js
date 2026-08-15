import prisma from "../config/prisma.js";

export default class UserService {
  static async create(username) {
    const user = await prisma.user.create({
      data: {
        username,
      },
    });

    return user;
  }

  static async update(username, fields = {}) {
    await prisma.user.update({
      data: {
        ...fields,
      },
      where: {
        username,
      },
    });
  }

  static async delete(username) {
    await prisma.user.deleteMany({
      where: {
        username,
      },
    });
  }

  static async find(username) {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    return user;
  }

  static async findMany() {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          username: "5efendi1",
        },
      },
      orderBy: {
        longest_streaks: "desc",
      },
      take: 10,
    });

    return users;
  }
}
