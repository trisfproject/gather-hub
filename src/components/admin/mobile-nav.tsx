"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu,
  X,
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Ticket,
  MapPin,
  Newspaper,
  Mic2,
  ShieldCheck,
  Users,
  ShoppingBag
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface MobileNavProps {
  user: {
    name: string;
    role: string;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "News", href: "/admin/news", icon: Newspaper },
    { name: "Sharing Session", href: "/admin/sharing-session", icon: Mic2 },
    { name: "Pickup Points", href: "/admin/pickup-points", icon: MapPin },
    { name: "Merchandise", href: "/admin/merchandise", icon: ShoppingBag, roles: ["SUPER_ADMIN", "ADMIN", "COMMITTEE", "CHECKIN", "VIEWER"] },
    { name: "Admins", href: "/admin/admins", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
    { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
  ];

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <span className="font-bold text-lg text-foreground">Gather Hub<span className="text-accent">.</span></span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-secondary hover:text-foreground focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-sm pt-16">
          <div className="px-6 mb-8">
            <div className="text-sm font-medium text-foreground">{user.name}</div>
            <div className="text-xs text-secondary font-mono">{user.role}</div>
          </div>
          
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              if (item.roles && !item.roles.includes(user.role)) return null;
              
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-base font-medium rounded-md
                    ${isActive 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-secondary hover:bg-border hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="mr-4 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-4 py-3 text-base font-medium rounded-md text-red-500 hover:bg-red-500/10 mt-4"
            >
              <LogOut className="mr-4 h-5 w-5" aria-hidden="true" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
