import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email: npm run admin:grant -- <email>");
    process.exit(1);
  }

  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
  });

  if (!user) {
    console.error(`User not found with email: ${normalized}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email: normalized },
    data: { role: "ADMIN" },
  });

  console.log(`✓ Success: Granted ADMIN role to ${updated.name} (${updated.email}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
