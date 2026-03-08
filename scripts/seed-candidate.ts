import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString:
    "postgresql://postgres.fsokgzbpkobftgwajegi:jmGhZM6HHBQXH6ZH@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the first exam
  const exam = await prisma.exam.findFirst({
    select: { id: true, title: true, accessLink: true },
  });

  if (!exam) {
    console.log("No exams found. Create an exam first.");
    return;
  }

  console.log(`Found exam: "${exam.title}" (access: ${exam.accessLink})`);

  const username = "testuser";
  const password = "Test@123";
  const passwordHash = await bcrypt.hash(password, 10);

  const candidate = await prisma.candidate.upsert({
    where: {
      examId_username: { examId: exam.id, username },
    },
    create: {
      examId: exam.id,
      username,
      passwordHash,
      fullName: "Test User",
      email: "testuser@example.com",
    },
    update: {},
  });

  console.log("\n--- Candidate Created ---");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`Exam URL: http://localhost:3000/exam/${exam.accessLink}`);
  console.log(`Candidate ID: ${candidate.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
