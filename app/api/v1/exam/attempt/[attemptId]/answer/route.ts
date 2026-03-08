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
  const { questionId, selectedAnswer } = body;

  if (!questionId || !selectedAnswer) {
    return NextResponse.json(
      { error: "questionId and selectedAnswer are required" },
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
      { error: "Cannot answer this question (forward-only)" },
      { status: 400 }
    );
  }

  // Get the question details
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { section: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Compute correctness and marks
  const isCorrect = selectedAnswer === question.correctAnswer;
  let marksAwarded = 0;
  if (isCorrect) {
    marksAwarded = Number(question.marks);
  } else {
    // Check negative marking
    const exam = await prisma.exam.findUnique({
      where: { id: attempt.examId },
    });
    if (exam?.allowNegativeMarking) {
      marksAwarded = -Number(exam.negativeMarkValue);
    }
  }

  // Check if response already exists (prevent double submission)
  const existingResponse = await prisma.response.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } },
  });
  if (existingResponse) {
    return NextResponse.json(
      { error: "Already answered this question" },
      { status: 400 }
    );
  }

  // Create the response
  await prisma.response.create({
    data: {
      attemptId,
      questionId,
      sectionId: question.sectionId,
      selectedAnswer,
      isCorrect,
      marksAwarded,
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

  return NextResponse.json({ success: true, isCorrect });
}
