"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Ticket,
  MapPin,
  Newspaper,
  Mic2,
  ShieldCheck
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: {
    name: string;
    role: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
        },
      },
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Registrations", href: "/admin/registrations", icon: Ticket },
    { name: "News", href: "/admin/news", icon: Newspaper },
    { name: "Sharing Session", href: "/admin/sharing-session", icon: Mic2 },
    { name: "Pickup Points", href: "/admin/pickup-points", icon: MapPin },
    { name: "Admins", href: "/admin/admins", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
    { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pt-5 pb-4">
      <div className="flex items-center flex-shrink-0 px-6 mb-6">
        <span className="font-bold text-xl text-foreground">Gather Hub<span className="text-accent">.</span></span>
      </div>
      
      <div className="px-6 mb-8">
        <div className="text-sm font-medium text-foreground">{user.name}</div>
        <div className="text-xs text-secondary font-mono">{user.role}</div>
      </div>

      <nav className="flex-1 px-4 space-y-1 bg-surface">
        {navItems.map((item) => {
          // RBAC visibility filter (visual only, actual auth is server-side)
          if (item.roles && !item.roles.includes(user.role)) return null;

          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-secondary hover:bg-border hover:text-foreground'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 flex-shrink-0 h-5 w-5
                  ${isActive ? 'text-accent' : 'text-secondary group-hover:text-foreground'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
