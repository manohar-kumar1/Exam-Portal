import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamListClient } from "./exam-list-client";

export default async function ExamsPage() {
  const admin = await requireAdmin();

  const exams = await prisma.exam.findMany({
    where: { adminId: admin.id },
    include: {
      _count: { select: { sections: true, candidates: true, attempts: true } },
      sections: {
        include: { _count: { select: { questions: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const examsWithQuestionCount = exams.map((exam) => {
    const totalQuestions = exam.sections.reduce(
      (sum, section) => sum + section._count.questions,
      0
    );
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      isPublished: exam.isPublished,
      createdAt: exam.createdAt.toISOString(),
      totalQuestions,
      sectionsCount: exam._count.sections,
      candidatesCount: exam._count.candidates,
      attemptsCount: exam._count.attempts,
    };
  });

  return (
    <div className="p-6 lg:p-8">
      <ExamListClient exams={examsWithQuestionCount} />
    </div>
  );
}
