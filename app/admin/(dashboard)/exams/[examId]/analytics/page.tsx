import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, Percent, Trophy } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { AnalyticsCharts } from "./charts";

type AnalyticsPageProps = {
  params: Promise<{ examId: string }>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { examId } = await params;
  const admin = await requireAdmin();

  const exam = await prisma.exam.findFirst({
    where: { id: examId, adminId: admin.id },
    include: {
      sections: {
        include: { questions: true },
        orderBy: { orderIndex: "asc" },
      },
      attempts: {
        where: { status: { in: ["completed", "timed_out"] } },
        include: {
          responses: true,
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  const totalMarks = exam.totalMarks;
  const passingPercentage = Number(exam.passingPercentage);
  const attempts = exam.attempts;
  const totalAttempts = attempts.length;

  // --- Empty state ---
  if (totalAttempts === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/admin/exams/${examId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Exam
          </Link>
        </Button>

        <h1 className="mb-6 text-2xl font-bold tracking-tight">
          Analytics &mdash; {exam.title}
        </h1>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="text-muted-foreground mb-4 h-12 w-12" />
            <h2 className="mb-1 text-lg font-semibold">No data yet</h2>
            <p className="text-muted-foreground text-sm">
              Analytics will appear here once candidates complete the exam.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Compute overall stats ---
  const scores = attempts.map((a) => Number(a.totalScore));
  const sortedScores = [...scores].sort((a, b) => a - b);

  const avgScore = scores.reduce((sum, s) => sum + s, 0) / totalAttempts;
  const medianScore =
    totalAttempts % 2 === 0
      ? (sortedScores[totalAttempts / 2 - 1] + sortedScores[totalAttempts / 2]) / 2
      : sortedScores[Math.floor(totalAttempts / 2)];
  const highestScore = sortedScores[sortedScores.length - 1];
  const lowestScore = sortedScores[0];

  const passingScore = (passingPercentage / 100) * totalMarks;
  const passCount = scores.filter((s) => s >= passingScore).length;
  const passRate = totalMarks > 0 ? (passCount / totalAttempts) * 100 : 0;

  // --- Score distribution (10 buckets: 0-10%, 10-20%, ..., 90-100%) ---
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}%`,
    count: 0,
  }));

  for (const score of scores) {
    const pct = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    // Place 100% in the last bucket
    const bucketIndex = pct >= 100 ? 9 : Math.floor(pct / 10);
    scoreDistribution[bucketIndex].count++;
  }

  // --- Section performance ---
  // Build a map: sectionId -> { name, totalMarksAwarded, totalMaxMarks }
  const sectionMap = new Map<
    string,
    { name: string; totalAwarded: number; totalMax: number; attemptCount: number }
  >();

  for (const section of exam.sections) {
    const sectionMaxMarks = section.questions.reduce(
      (sum, q) => sum + Number(q.marks),
      0
    );
    sectionMap.set(section.id, {
      name: section.title,
      totalAwarded: 0,
      totalMax: sectionMaxMarks,
      attemptCount: 0,
    });
  }

  // Track which attempts contributed to each section
  const sectionAttemptSets = new Map<string, Set<string>>();
  for (const section of exam.sections) {
    sectionAttemptSets.set(section.id, new Set());
  }

  for (const attempt of attempts) {
    for (const response of attempt.responses) {
      const sec = sectionMap.get(response.sectionId);
      if (sec) {
        sec.totalAwarded += Number(response.marksAwarded);
        const attemptSet = sectionAttemptSets.get(response.sectionId);
        if (attemptSet) {
          attemptSet.add(attempt.id);
        }
      }
    }
  }

  // Update attempt counts from the sets
  for (const [sectionId, sec] of sectionMap) {
    const attemptSet = sectionAttemptSets.get(sectionId);
    sec.attemptCount = attemptSet ? attemptSet.size : totalAttempts;
  }

  const sectionPerformance = Array.from(sectionMap.values())
    .filter((s) => s.totalMax > 0 && s.attemptCount > 0)
    .map((s) => ({
      name: s.name,
      avgScore: Math.round(
        (s.totalAwarded / (s.totalMax * s.attemptCount)) * 100
      ),
      maxScore: s.totalMax,
    }));

  // --- Question difficulty ---
  // Build a map: questionId -> { label, correctCount }
  const questionMap = new Map<
    string,
    { label: string; correctCount: number }
  >();

  let questionIndex = 0;
  for (const section of exam.sections) {
    for (const question of section.questions) {
      questionIndex++;
      const label =
        question.questionText.length > 50
          ? `Q${questionIndex}: ${question.questionText.slice(0, 47)}...`
          : `Q${questionIndex}: ${question.questionText}`;
      questionMap.set(question.id, { label, correctCount: 0 });
    }
  }

  for (const attempt of attempts) {
    for (const response of attempt.responses) {
      const q = questionMap.get(response.questionId);
      if (q && response.isCorrect) {
        q.correctCount++;
      }
    }
  }

  const questionDifficulty = Array.from(questionMap.values())
    .map((q) => ({
      question: q.label,
      correctPercent: Math.round((q.correctCount / totalAttempts) * 100),
      totalAttempts,
    }))
    .sort((a, b) => a.correctPercent - b.correctPercent);

  return (
    <div className="p-6 lg:p-8">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/admin/exams/${examId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to Exam
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Analytics &mdash; {exam.title}
      </h1>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
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
                {avgScore.toFixed(1)} / {totalMarks}
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

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="text-muted-foreground h-5 w-5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Highest Score</p>
              <p className="text-sm font-semibold">
                {highestScore} / {totalMarks}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">Median Score</p>
            <p className="text-sm font-semibold">
              {medianScore.toFixed(1)} / {totalMarks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">Lowest Score</p>
            <p className="text-sm font-semibold">
              {lowestScore} / {totalMarks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">
              Score Range
            </p>
            <p className="text-sm font-semibold">
              {(highestScore - lowestScore).toFixed(1)} marks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        scoreDistribution={scoreDistribution}
        sectionPerformance={sectionPerformance}
        questionDifficulty={questionDifficulty}
      />
    </div>
  );
}
