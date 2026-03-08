import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-primary p-10 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Exam Portal</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Psychometric &<br />Aptitude Assessment
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-sm">
            Create, manage, and analyze assessments with detailed analytics and candidate insights.
          </p>
        </div>

        <p className="text-xs text-white/40">
          Secure assessment platform
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
