import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, Percent } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ResultsTable } from "./results-table";

type ResultsPageProps = {
  params: Promise<{ examId: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { examId } = await params;
  const admin = await requireAdmin();

  const exam = await prisma.exam.findFirst({
    where: { id: examId, adminId: admin.id },
    select: {
      id: true,
      title: true,
      totalMarks: true,
      passingPercentage: true,
    },
  });

  if (!exam) notFound();

  const attempts = await prisma.examAttempt.findMany({
    where: { examId },
    include: {
      candidate: {
        select: { fullName: true, username: true, email: true },
      },
    },
    orderBy: { totalScore: "desc" },
  });

  // Serialize Decimal fields to numbers for client component
  const totalMarks = exam.totalMarks;
  const passingPercentage = Number(exam.passingPercentage);

  const attemptsData = attempts.map((attempt) => ({
    id: attempt.id,
    candidateId: attempt.candidateId,
    candidateName: attempt.candidate.fullName,
    candidateUsername: attempt.candidate.username,
    candidateEmail: attempt.candidate.email,
    totalScore: Number(attempt.totalScore),
    totalCorrect: attempt.totalCorrect,
    totalWrong: attempt.totalWrong,
    totalUnanswered: attempt.totalUnanswered,
    status: attempt.status as string,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
  }));

  // Summary stats
  const totalAttempts = attemptsData.length;
  const averageScore =
    totalAttempts > 0
      ? attemptsData.reduce((sum, a) => sum + a.totalScore, 0) / totalAttempts
      : 0;
  const passCount =
    totalMarks > 0
      ? attemptsData.filter(
          (a) => (a.totalScore / totalMarks) * 100 >= passingPercentage
        ).length
      : 0;
  const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/admin/exams/${examId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to Exam
        </Link>
      </Button>

      {/* Title */}
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Results &mdash; {exam.title}
      </h1>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="text-muted-foreground h-5 w-5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Total Attempts</p>
              <p className="text-sm font-semibold">{totalAttempts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="text-muted-foreground h-5 w-5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Average Score</p>
              <p className="text-sm font-semibold">
                {averageScore.toFixed(1)} / {totalMarks}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Percent className="text-muted-foreground h-5 w-5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Pass Rate</p>
              <p className="text-sm font-semibold">{passRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-8" />

      {/* Results table */}
      <ResultsTable
        examId={examId}
        totalMarks={totalMarks}
        passingPercentage={passingPercentage}
        attempts={attemptsData}
      />
    </div>
  );
}
