import { ReactNode } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let user;
  try {
    // We enforce a base level of authentication for the entire admin shell.
    // If they aren't authenticated at all, they get booted to login.
    const result = await requirePermission("dashboard", "read");
    user = result.user;
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Mobile Topbar & Nav */}
      <div className="md:hidden">
        <MobileNav user={user} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-surface border-r border-border z-10">
        <Sidebar user={user} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
