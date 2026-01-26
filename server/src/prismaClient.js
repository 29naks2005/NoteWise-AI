const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log("Prisma connected to database");
  })
  .catch((err) => {
    console.error("Prisma connection failed", err);
    process.exit(1); // stop server if DB fails
  });

module.exports = prisma;
