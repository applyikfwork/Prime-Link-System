import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Users, UserSquare, CheckSquare, DollarSign, MessageSquare, Briefcase, LogOut } from "lucide-react";
import { useLogout } from "@/lib/db";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const adminLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/employees", icon: Users, label: "Employees" },
    { href: "/admin/clients", icon: UserSquare, label: "Clients" },
    { href: "/admin/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/admin/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/admin/plans", icon: Briefcase, label: "Plans" },
    { href: "/admin/chat", icon: MessageSquare, label: "Chat" },
  ];

  const salesmanLinks = [
    { href: "/salesman", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/salesman/add-client", icon: UserSquare, label: "Add Client" },
    { href: "/salesman/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/salesman/chat", icon: MessageSquare, label: "Chat" },
  ];

  const workerLinks = [
    { href: "/worker", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/worker/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/worker/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/worker/chat", icon: MessageSquare, label: "Chat" },
  ];

  const links =
    user.role === "admin"
      ? adminLinks
      : user.role === "salesman"
        ? salesmanLinks
        : workerLinks;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <div className="w-64 shrink-0 border-r border-white/5 bg-[#09090f] h-screen flex flex-col">
      <div className="p-6 border-b border-white/5">
        <div className="text-xl font-black tracking-tight">
          <span className="text-white">PRIME LINK</span>
          <span className="text-blue-500"> OS</span>
        </div>
        <p className="text-xs text-white/30 mt-1 capitalize">{user.role} Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active =
            location === link.href ||
            (location.startsWith(link.href + "/") &&
              link.href !== "/admin" &&
              link.href !== "/salesman" &&
              link.href !== "/worker");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-white/60 truncate">{user.name}</p>
          <p className="text-xs text-white/20 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#09090f] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
