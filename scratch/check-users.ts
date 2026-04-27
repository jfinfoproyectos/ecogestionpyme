import "dotenv/config";
import prisma from "../src/shared/lib/prisma";

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  users.forEach(u => {
    console.log(`- ${u.email}: ${u.role} (ID: ${u.id})`);
  });
  await prisma.$disconnect();
}

checkUsers();
