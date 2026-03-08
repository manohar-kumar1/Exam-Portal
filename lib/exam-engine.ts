import { prisma } from "@/lib/prisma";

export async function getTimeRemaining(attemptId: string): Promise<number> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: true },
  });
  if (!attempt) return 0;

  const elapsed = (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
  const totalSeconds = attempt.exam.durationMinutes * 60;
  return Math.max(0, Math.floor(totalSeconds - elapsed));
}

export async function isAttemptExpired(attemptId: string): Promise<boolean> {
  return (await getTimeRemaining(attemptId)) <= 0;
}

export async function getOrderedQuestions(examId: string) {
  const sections = await prisma.section.findMany({
    where: { examId },
    orderBy: { orderIndex: "asc" },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });

  // Flatten sections into ordered question list with section info
  return sections.flatMap((section) =>
    section.questions.map((q) => ({
      ...q,
      sectionId: section.id,
      sectionTitle: section.title,
    }))
  );
}

export async function getNextQuestion(attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      responses: { select: { questionId: true } },
    },
  });
  if (!attempt) return null;

  const allQuestions = await getOrderedQuestions(attempt.examId);
  const answeredIds = new Set(attempt.responses.map((r) => r.questionId));

  for (const question of allQuestions) {
    if (!answeredIds.has(question.id)) {
      return question;
    }
  }
  return null; // All questions answered
}

export async function computeAndSubmitAttempt(attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      responses: true,
      exam: {
        include: {
          sections: {
            include: { questions: true },
          },
        },
      },
    },
  });
  if (!attempt) return null;

  const totalQuestions = attempt.exam.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  const totalCorrect = attempt.responses.filter((r) => r.isCorrect).length;
  const totalWrong = attempt.responses.filter(
    (r) => !r.isCorrect && r.selectedAnswer
  ).length;
  const totalUnanswered = totalQuestions - attempt.responses.length;
  const totalScore = attempt.responses.reduce(
    (sum, r) => sum + Number(r.marksAwarded),
    0
  );

  const timeRemaining = await getTimeRemaining(attemptId);

  const updated = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: timeRemaining <= 0 ? "timed_out" : "completed",
      submittedAt: new Date(),
      timeRemainingSec: timeRemaining,
      totalScore,
      totalCorrect,
      totalWrong,
      totalUnanswered,
    },
  });

  return updated;
}
