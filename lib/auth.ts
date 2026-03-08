import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = await prisma.admin.upsert({
    where: { supabaseId: user.id },
    create: {
      supabaseId: user.id,
      name: user.user_metadata?.name ?? user.email ?? "Admin",
      email: user.email ?? "",
    },
    update: {},
  });

  return admin;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
