import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTimeRemaining,
  isAttemptExpired,
  computeAndSubmitAttempt,
  getNextQuestion,
  getOrderedQuestions,
} from "@/lib/exam-engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.status !== "in_progress") {
    return NextResponse.json(
      { error: "Invalid or completed attempt" },
      { status: 403 }
    );
  }

  if (await isAttemptExpired(attemptId)) {
    await computeAndSubmitAttempt(attemptId);
    return NextResponse.json(
      { error: "Time expired", status: "timed_out" },
      { status: 410 }
    );
  }

  const next = await getNextQuestion(attemptId);
  if (!next) {
    // All questions answered
    return NextResponse.json({ allAnswered: true });
  }

  const timeRemaining = await getTimeRemaining(attemptId);

  // Get total questions and answered count for progress
  const allQuestions = await getOrderedQuestions(attempt.examId);
  const answeredCount = await prisma.response.count({ where: { attemptId } });

  return NextResponse.json({
    question: {
      id: next.id,
      text: next.questionText,
      type: next.questionType,
      options: next.options,
      marks: Number(next.marks),
      imageUrl: next.imageUrl,
    },
    section: {
      id: next.sectionId,
      title: next.sectionTitle,
    },
    progress: {
      current: answeredCount + 1,
      total: allQuestions.length,
    },
    timeRemaining,
  });
}
