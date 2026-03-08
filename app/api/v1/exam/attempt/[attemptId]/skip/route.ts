import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isAttemptExpired,
  computeAndSubmitAttempt,
  getNextQuestion,
} from "@/lib/exam-engine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const body = await request.json();
  const { questionId } = body;

  if (!questionId) {
    return NextResponse.json(
      { error: "questionId is required" },
      { status: 400 }
    );
  }

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

  // Forward-only: verify the question is the current one
  if (attempt.currentQuestionId !== questionId) {
    return NextResponse.json(
      { error: "Cannot skip this question (forward-only)" },
      { status: 400 }
    );
  }

  // Get the question to retrieve sectionId
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Check if response already exists (prevent double submission)
  const existingResponse = await prisma.response.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } },
  });
  if (existingResponse) {
    return NextResponse.json(
      { error: "Already responded to this question" },
      { status: 400 }
    );
  }

  // Create a skip response: null answer, not correct, zero marks
  await prisma.response.create({
    data: {
      attemptId,
      questionId,
      sectionId: question.sectionId,
      selectedAnswer: null,
      isCorrect: false,
      marksAwarded: 0,
    },
  });

  // Update currentQuestionId to next question
  const nextQuestion = await getNextQuestion(attemptId);
  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      currentQuestionId: nextQuestion?.id || null,
    },
  });

  return NextResponse.json({ success: true, skipped: true });
}
