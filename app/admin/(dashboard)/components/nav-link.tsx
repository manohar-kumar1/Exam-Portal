"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  exams: FileText,
};

interface NavLinkProps {
  href: string;
  icon: keyof typeof icons;
  children: React.ReactNode;
}

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/admin/dashboard"
      ? pathname === "/admin/dashboard"
      : pathname.startsWith(href);
  const Icon = icons[icon];

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
