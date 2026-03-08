import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trophy,
  Clock,
  ArrowLeft,
  Hash,
  Target,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

type Option = { id: string; text: string };

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ accessLink: string; attemptId: string }>;
}) {
  const { accessLink, attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: {
          title: true,
          totalMarks: true,
          passingPercentage: true,
          accessLink: true,
        },
      },
      candidate: { select: { fullName: true } },
      responses: {
        include: {
          question: {
            select: {
              questionText: true,
              correctAnswer: true,
              explanation: true,
              marks: true,
              questionType: true,
              options: true,
            },
          },
          section: { select: { title: true } },
        },
        orderBy: { answeredAt: "asc" },
      },
    },
  });

  if (!attempt) return notFound();
  if (attempt.exam.accessLink !== accessLink) return notFound();
  if (attempt.status === "in_progress") return notFound();

  // Compute score and pass/fail
  const totalScore = Number(attempt.totalScore);
  const totalMarks = attempt.exam.totalMarks;
  const passingPercentage = Number(attempt.exam.passingPercentage);
  const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
  const passed = percentage >= passingPercentage;

  const { totalCorrect, totalWrong, totalUnanswered } = attempt;

  // Group responses by section
  const sectionMap = new Map<
    string,
    {
      title: string;
      responses: typeof attempt.responses;
      correct: number;
      total: number;
      score: number;
      maxScore: number;
    }
  >();

  for (const response of attempt.responses) {
    const sectionTitle = response.section.title;
    if (!sectionMap.has(sectionTitle)) {
      sectionMap.set(sectionTitle, {
        title: sectionTitle,
        responses: [],
        correct: 0,
        total: 0,
        score: 0,
        maxScore: 0,
      });
    }
    const section = sectionMap.get(sectionTitle)!;
    section.responses.push(response);
    section.total += 1;
    section.maxScore += Number(response.question.marks);
    if (response.isCorrect) {
      section.correct += 1;
      section.score += Number(response.marksAwarded);
    } else {
      section.score += Number(response.marksAwarded); // handles negative marking
    }
  }

  const sections = Array.from(sectionMap.values());
  const hasMultipleSections = sections.length > 1;

  // Helper to get display text for a selected answer
  function getAnswerDisplayText(
    selectedAnswer: string | null,
    options: Option[] | null
  ): string {
    if (!selectedAnswer) return "Not answered";
    if (!options || options.length === 0) return selectedAnswer;
    const option = options.find((o) => o.id === selectedAnswer);
    return option ? option.text : selectedAnswer;
  }

  // Helper to get display text for the correct answer
  function getCorrectAnswerDisplayText(
    correctAnswer: string,
    options: Option[] | null
  ): string {
    if (!options || options.length === 0) return correctAnswer;
    const option = options.find((o) => o.id === correctAnswer);
    return option ? option.text : correctAnswer;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {attempt.exam.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Results for {attempt.candidate.fullName}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Score Summary Card */}
        <Card className="overflow-hidden">
          <div
            className={`h-1.5 w-full ${passed ? "bg-emerald-500" : "bg-red-500"}`}
          />
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Score Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex items-center justify-center w-28 h-28 rounded-full border-4 ${
                    passed
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-red-500 bg-red-50 dark:bg-red-950/30"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        passed
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {totalScore}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      / {totalMarks}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span
                    className={`text-3xl font-bold ${
                      passed
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                  <Badge
                    className={
                      passed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800"
                    }
                  >
                    <Trophy className="h-3 w-3" />
                    {passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Passing score: {passingPercentage}%
                </p>

                <Badge
                  variant="outline"
                  className="text-muted-foreground"
                >
                  <Clock className="h-3 w-3" />
                  {attempt.status === "timed_out"
                    ? "Timed Out"
                    : attempt.status === "completed"
                      ? "Completed"
                      : attempt.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-foreground">
                {totalScore}
              </span>
              <span className="text-xs text-muted-foreground">
                Total Score
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalCorrect}
              </span>
              <span className="text-xs text-muted-foreground">
                Correct
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalWrong}
              </span>
              <span className="text-xs text-muted-foreground">
                Wrong
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
              <MinusCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-muted-foreground">
                {totalUnanswered}
              </span>
              <span className="text-xs text-muted-foreground">
                Unanswered
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Section-wise Breakdown */}
        {hasMultipleSections && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Section-wise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-center">Correct / Total</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.title}>
                      <TableCell className="font-medium">
                        {section.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {section.correct}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span>{section.total}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {section.score.toFixed(1)} / {section.maxScore.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Question-by-Question Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              Question-by-Question Review
            </CardTitle>
            <CardDescription>
              Detailed review of each question and your response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attempt.responses.map((response, index) => {
              const options = response.question.options as Option[] | null;
              const isUnanswered = !response.selectedAnswer;
              const isCorrect = response.isCorrect;

              return (
                <div key={response.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex gap-3 sm:gap-4">
                    {/* Status Icon */}
                    <div className="pt-0.5 shrink-0">
                      {isUnanswered ? (
                        <MinusCircle className="h-5 w-5 text-muted-foreground" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Question header */}
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          Q{index + 1}.
                        </span>
                        <p className="text-sm font-medium text-foreground flex-1">
                          {response.question.questionText}
                        </p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {Number(response.question.marks)} mark
                          {Number(response.question.marks) !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Answers */}
                      <div className="grid gap-1.5 text-sm pl-0 sm:pl-6">
                        {/* Selected Answer */}
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground shrink-0 w-24 text-xs font-medium uppercase tracking-wider pt-0.5">
                            Your answer
                          </span>
                          <span
                            className={
                              isUnanswered
                                ? "text-muted-foreground italic"
                                : isCorrect
                                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                  : "text-red-600 dark:text-red-400 font-medium"
                            }
                          >
                            {getAnswerDisplayText(response.selectedAnswer, options)}
                          </span>
                        </div>

                        {/* Correct Answer (show if wrong or unanswered) */}
                        {(!isCorrect || isUnanswered) && (
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground shrink-0 w-24 text-xs font-medium uppercase tracking-wider pt-0.5">
                              Correct
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {getCorrectAnswerDisplayText(
                                response.question.correctAnswer,
                                options
                              )}
                            </span>
                          </div>
                        )}

                        {/* Explanation */}
                        {response.question.explanation && (
                          <div className="flex items-start gap-2 mt-1">
                            <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {response.question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {attempt.responses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MinusCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No responses recorded for this attempt.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">
            Attempt ID: {attemptId.slice(0, 8)}...{" "}
            {attempt.submittedAt &&
              `| Submitted: ${new Date(attempt.submittedAt).toLocaleString()}`}
          </p>
        </div>
      </main>
    </div>
  );
}
