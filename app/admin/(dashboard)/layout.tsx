import Link from "next/link";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/admin/(auth)/actions";
import { MobileSidebar } from "./components/mobile-sidebar";
import { NavLink } from "./components/nav-link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card lg:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
            <LayoutDashboard className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold tracking-tight">Exam Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Overview
          </p>
          <NavLink href="/admin/dashboard" icon="dashboard">
            Dashboard
          </NavLink>
          <NavLink href="/admin/exams" icon="exams">
            Exams
          </NavLink>
        </nav>

        {/* User section */}
        <div className="border-t p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {admin.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-card px-4 lg:hidden">
        <MobileSidebar />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
            <LayoutDashboard className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold tracking-tight">Exam Portal</span>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-60 min-h-screen">{children}</main>
    </div>
  );
}
