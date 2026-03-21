"use client";

import { useTransition, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";

import {
  adminSignInSchema,
  type AdminSignInInput,
} from "@/lib/validations/auth";
import { signInAdmin } from "../actions";

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

const ADMIN_PIN = "7391";

// ── PIN Gate ─────────────────────────────────────────────────────────────────
function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Allow only one digit
      const digit = value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setError(false);

      // Auto-advance
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all 4 filled
      if (digit && index === 3) {
        const pin = [...next.slice(0, 3), digit].join("");
        if (pin === ADMIN_PIN) {
          onSuccess();
        } else {
          setShake(true);
          setError(true);
          setTimeout(() => {
            setDigits(["", "", "", ""]);
            setShake(false);
            inputRefs.current[0]?.focus();
          }, 600);
        }
      }
    },
    [digits, onSuccess]
  );

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      const next = pasted.split("");
      setDigits(next);
      if (pasted === ADMIN_PIN) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setDigits(["", "", "", ""]);
          setShake(false);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <Image src="/GC LOGO.svg" alt="Exam Portal Logo" width={36} height={36} quality={100} className="object-contain" />
        <span className="text-lg font-semibold tracking-tight">Exam Portal</span>
      </div>

      <div className="space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <span className="material-symbols-outlined text-primary text-[26px]">lock</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Verification</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 4-digit access code to continue
        </p>
      </div>

      {/* PIN inputs */}
      <div className={`flex gap-3 justify-center ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            autoFocus={i === 0}
            className={`h-16 w-14 rounded-xl border-2 bg-card text-center text-2xl font-bold tracking-widest transition-all outline-none
              focus:ring-2 focus:ring-primary/30
              ${error
                ? "border-destructive text-destructive focus:border-destructive"
                : d
                ? "border-primary text-foreground"
                : "border-border text-foreground"
              }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive font-medium animate-in fade-in">
          Incorrect code. Please try again.
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        The code will be verified automatically when all 4 digits are entered.
      </p>
    </div>
  );
}

// ── Login Form ─────────────────────────────────────────────────────────────
function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AdminSignInInput>({
    resolver: zodResolver(adminSignInSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: AdminSignInInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await signInAdmin(values);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* Mobile brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <Image src="/GC LOGO.svg" alt="Exam Portal Logo" width={36} height={36} quality={100} className="object-contain" />
        <span className="text-lg font-semibold tracking-tight">Exam Portal</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
            <span className="material-symbols-outlined text-green-500 text-[16px]">check</span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Verified</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the admin dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="admin@example.com" autoComplete="email" {...field} />
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
                  <Input type="password" placeholder="Enter your password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/admin/signup" className="font-medium text-primary hover:underline underline-offset-4">
          Create account
        </Link>
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const [verified, setVerified] = useState(false);

  return verified ? (
    <LoginForm />
  ) : (
    <PinGate onSuccess={() => setVerified(true)} />
  );
}
