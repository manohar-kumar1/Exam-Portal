"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsChartsProps = {
  scoreDistribution: { range: string; count: number }[];
  sectionPerformance: { name: string; avgScore: number; maxScore: number }[];
  questionDifficulty: {
    question: string;
    correctPercent: number;
    totalAttempts: number;
  }[];
};

function getDifficultyColor(percent: number): string {
  if (percent >= 80) return "#22c55e"; // green-500 — easy
  if (percent >= 50) return "#3b82f6"; // blue-500 — medium
  if (percent >= 30) return "#f59e0b"; // amber-500 — hard
  return "#ef4444"; // red-500 — very hard
}

export function AnalyticsCharts({
  scoreDistribution,
  sectionPerformance,
  questionDifficulty,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scoreDistribution}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number) => [value, "Candidates"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section Performance */}
      {sectionPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Section Performance (Avg %)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectionPerformance}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [`${value}%`, "Avg Score"]}
                  />
                  <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Difficulty */}
      {questionDifficulty.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Difficulty (% Correct)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="w-full"
              style={{
                height: Math.max(300, questionDifficulty.length * 36),
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionDifficulty}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="question"
                    width={200}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [`${value}%`, "Correct"]}
                  />
                  <Bar dataKey="correctPercent" radius={[0, 4, 4, 0]}>
                    {questionDifficulty.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={getDifficultyColor(entry.correctPercent)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#22c55e" }} />
                Easy (80%+)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
                Medium (50-79%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#f59e0b" }} />
                Hard (30-49%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#ef4444" }} />
                Very Hard (&lt;30%)
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
