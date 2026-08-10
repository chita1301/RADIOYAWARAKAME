"use server";

import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/admin-auth";

export async function adminLogoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
