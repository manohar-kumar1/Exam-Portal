"use client";

import { useTransition, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  candidateSignInSchema,
  type CandidateSignInInput,
} from "@/lib/validations/auth";

import { signInCandidate, startExam } from "../actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function CandidateLoginPage() {
  const params = useParams<{ accessLink: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CandidateSignInInput>({
    resolver: zodResolver(candidateSignInSchema),
    defaultValues: {
      username: "",
      password: "",
      accessLink: params.accessLink ?? "",
    },
  });

  function onSubmit(values: CandidateSignInInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await signInCandidate(values);

      if ("error" in result) {
        setServerError(result.error ?? "An unexpected error occurred");
        return;
      }

      const { data } = result;

      if (data.hasExistingAttempt && data.attemptId) {
        router.push(`/exam/${params.accessLink}/attempt/${data.attemptId}`);
        return;
      }

      const startResult = await startExam(data.examId, data.candidateId);

      if ("error" in startResult) {
        setServerError(startResult.error ?? "Failed to start exam");
        return;
      }

      router.push(`/exam/${params.accessLink}/attempt/${startResult.data.attemptId}`);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Exam Login</CardTitle>
          <CardDescription>
            Enter your credentials to start the exam
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Starting..." : "Start Exam"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
