import { NextResponse } from "next/server";
import { getTimeRemaining } from "@/lib/exam-engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const timeRemaining = await getTimeRemaining(attemptId);
  return NextResponse.json({ timeRemaining });
}
